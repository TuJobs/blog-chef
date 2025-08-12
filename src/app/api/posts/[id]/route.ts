import { NextRequest, NextResponse } from "next/server";
import * as db from "@/lib/sqlite";

// GET - Lấy chi tiết bài viết theo ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID bài viết không hợp lệ",
        },
        { status: 400 }
      );
    }

    // Get post from database
    const post = await db.getPostById(id);

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy bài viết",
        },
        { status: 404 }
      );
    }

    // Get author information
    const author = await db.getUserById(post.authorId);

    // Update view count
    await db.incrementPostViews(id);

    // Get related posts (same category, exclude current post)
    const allPosts = await db.getPosts();
    const relatedPosts = allPosts
      .filter((p) => p.id !== id && p.category === post.category)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3);

    // Enrich related posts with author info
    const relatedPostsWithAuthors = await Promise.all(
      relatedPosts.map(async (relatedPost) => {
        const relatedAuthor = await db.getUserById(relatedPost.authorId);
        return {
          id: relatedPost.id,
          title: relatedPost.title,
          category: relatedPost.category,
          author: {
            nickname: relatedAuthor?.nickname || "Người dùng ẩn danh",
            avatar:
              relatedAuthor?.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${relatedPost.authorId}`,
          },
          createdAt: relatedPost.createdAt,
          likes: relatedPost.likes || 0,
        };
      })
    );

    // Prepare response with author info
    const postWithAuthor = {
      ...post,
      author: {
        nickname: author?.nickname || "Người dùng ẩn danh",
        avatar:
          author?.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`,
        id: post.authorId,
      },
      views: (post.views || 0) + 1,
    };

    return NextResponse.json({
      success: true,
      post: postWithAuthor,
      relatedPosts: relatedPostsWithAuthors,
    });
  } catch (error) {
    console.error("Error fetching post details:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi khi tải bài viết",
      },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật bài viết
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID bài viết không hợp lệ",
        },
        { status: 400 }
      );
    }

    // Validate required fields
    const { title, content, category, authorId } = body;
    if (!title?.trim() || !content?.trim() || !category || !authorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng điền đầy đủ thông tin bắt buộc",
        },
        { status: 400 }
      );
    }

    // Check if post exists
    const existingPost = await db.getPostById(id);
    if (!existingPost) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy bài viết",
        },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (existingPost.authorId !== authorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Bạn không có quyền chỉnh sửa bài viết này",
        },
        { status: 403 }
      );
    }

    // Update post
    const updatedPost = await db.updatePost(id, {
      title: title.trim(),
      content: content.trim(),
      category,
      tags: body.tags || [],
      images: body.images || [],
    });

    if (!updatedPost) {
      return NextResponse.json(
        {
          success: false,
          message: "Không thể cập nhật bài viết",
        },
        { status: 500 }
      );
    }

    // Get author information
    const author = await db.getUserById(updatedPost.authorId);

    // Return updated post with author info
    const postWithAuthor = {
      ...updatedPost,
      author: {
        nickname: author?.nickname || "Người dùng ẩn danh",
        avatar:
          author?.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${updatedPost.authorId}`,
        id: updatedPost.authorId,
      },
    };

    return NextResponse.json({
      success: true,
      message: "Cập nhật bài viết thành công!",
      post: postWithAuthor,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi khi cập nhật bài viết",
      },
      { status: 500 }
    );
  }
}

// DELETE - Xóa bài viết
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const authorId = url.searchParams.get("authorId");

    if (!id || !authorId) {
      return NextResponse.json(
        {
          success: false,
          message: "ID bài viết và authorId không hợp lệ",
        },
        { status: 400 }
      );
    }

    // Check if post exists
    const existingPost = await db.getPostById(id);
    if (!existingPost) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy bài viết",
        },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (existingPost.authorId !== authorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Bạn không có quyền xóa bài viết này",
        },
        { status: 403 }
      );
    }

    // Delete post and related data
    const deleted = await db.deletePost(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Không thể xóa bài viết",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Xóa bài viết thành công!",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi khi xóa bài viết",
      },
      { status: 500 }
    );
  }
}
