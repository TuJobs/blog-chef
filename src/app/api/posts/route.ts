import { NextRequest, NextResponse } from "next/server";
import { getPosts, createPost, createUser, getUserById } from "@/lib/database-service";

// POST - Tạo bài viết mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      category,
      image,
      hashtags,
      authorId,
      authorName,
      authorAvatar,
    } = body;

    // Validate required fields
    if (!title || !content || !category || !authorId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Thiếu thông tin bắt buộc: title, content, category, authorId",
        },
        { status: 400 }
      );
    }

    // Ensure user exists or create new user
    let user = await getUserById(authorId);
    if (!user) {
      user = await createUser({
        id: authorId,
        nickname: authorName || "Người dùng ẩn danh",
        avatar:
          authorAvatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorId}`,
      });
    }

    // Process hashtags - remove # and whitespace
    const processedHashtags = hashtags
      ? hashtags
          .split(/[\s,]+/)
          .map((tag: string) => tag.replace("#", "").trim())
          .filter((tag: string) => tag.length > 0)
      : [];

    // Create new post
    const newPost = await createPost({
      title: title.trim(),
      content: content.trim(),
      category,
      tags: processedHashtags,
      images: image ? [image] : [],
      status: "published",
      author_id: authorId, // Use snake_case for PostgreSQL
    });

    return NextResponse.json(
      {
        success: true,
        message: "Bài viết đã được tạo thành công!",
        post: {
          ...newPost,
          author: {
            id: user.id,
            nickname: user.nickname,
            avatar: user.avatar,
          },
          excerpt:
            content.length > 150 ? content.substring(0, 150) + "..." : content,
          images: image ? [{ url: image, alt: title }] : [],
          status: "published",
          comments: 0,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi hệ thống, vui lòng thử lại sau",
      },
      { status: 500 }
    );
  }
}

// GET - Lấy danh sách bài viết
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get all posts
    let posts = await getPosts();

    // Filter by category
    if (category) {
      posts = posts.filter((post) => post.category === category);
    }

    // Filter by tag
    if (tag) {
      posts = posts.filter((post) => post.tags.includes(tag));
    }

    // Sort by created_at (newest first)
    posts.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Get total count for pagination
    const total = posts.length;
    const totalPages = Math.ceil(total / limit);

    // Apply pagination
    const paginatedPosts = posts.slice(skip, skip + limit);

    // Enrich posts with author information
    const postsWithAuthors = await Promise.all(
      paginatedPosts.map(async (post) => {
        const author = await getUserById(post.author_id);
        return {
          id: post.id,
          title: post.title,
          content: post.content,
          excerpt:
            post.content.length > 150
              ? post.content.substring(0, 150) + "..."
              : post.content,
          category: post.category,
          tags: post.tags,
          author: author || {
            id: post.author_id,
            nickname: "Người dùng ẩn danh",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_id}`,
          },
          images: [],
          status: "published",
          views: post.views || 0,
          likes: post.likes || 0,
          comments: 0,
          createdAt: post.created_at, // Convert back to camelCase for frontend
          updatedAt: post.updated_at, // Convert back to camelCase for frontend
        };
      })
    );

    return NextResponse.json({
      success: true,
      posts: postsWithAuthors,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi khi tải bài viết",
      },
      { status: 500 }
    );
  }
}
