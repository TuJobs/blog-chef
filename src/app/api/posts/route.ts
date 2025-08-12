import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Post type definition
interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: {
    id: string;
    nickname: string;
    avatar: string;
  };
  images: Array<{ url: string; alt: string }>;
  status: string;
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

const POSTS_FILE = path.join(process.cwd(), "data", "posts.json");

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(POSTS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read posts from JSON file
async function readPosts(): Promise<Post[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(POSTS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
}

// Write posts to JSON file
async function writePosts(posts: Post[]) {
  await ensureDataDir();
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), "utf8");
}

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

    // Read existing posts
    const posts = await readPosts();

    // Create excerpt from content (150 chars)
    const excerpt =
      content.length > 150 ? content.substring(0, 150) + "..." : content;

    // Process hashtags - remove # and whitespace
    const processedHashtags = hashtags
      ? hashtags
          .split(/[\s,]+/)
          .map((tag: string) => tag.replace("#", "").trim())
          .filter((tag: string) => tag.length > 0)
      : [];

    // Create new post object
    const newPost: Post = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      excerpt,
      category,
      tags: processedHashtags,
      author: {
        id: authorId,
        nickname: authorName || "Người dùng ẩn danh",
        avatar:
          authorAvatar ||
          "https://api.dicebear.com/7.x/avataaars/svg?seed=" + authorId,
      },
      images: image ? [{ url: image, alt: title }] : [],
      status: "published",
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to beginning of posts array
    posts.unshift(newPost);

    // Keep only last 100 posts to avoid file getting too large
    if (posts.length > 100) {
      posts.splice(100);
    }

    // Write back to file
    await writePosts(posts);

    return NextResponse.json(
      {
        success: true,
        message: "Bài viết đã được tạo thành công!",
        post: {
          id: newPost.id,
          title: newPost.title,
          excerpt: newPost.excerpt,
          category: newPost.category,
          tags: newPost.tags,
          createdAt: newPost.createdAt,
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

    // Read posts from file
    let posts = await readPosts();

    // Apply filters
    if (category) {
      posts = posts.filter((post: Post) => post.category === category);
    }
    if (tag) {
      posts = posts.filter(
        (post: Post) => post.tags && post.tags.includes(tag)
      );
    }

    // Get total count for pagination
    const total = posts.length;
    const totalPages = Math.ceil(total / limit);

    // Apply pagination
    const paginatedPosts = posts.slice(skip, skip + limit);

    // Format posts for response
    const formattedPosts = paginatedPosts.map((post: Post) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags,
      author: post.author,
      images: post.images,
      views: post.views || 0,
      likes: post.likes || 0,
      comments: post.comments || 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      posts: formattedPosts,
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
