import { NextRequest, NextResponse } from "next/server";
import {
  getCommentsByPostId,
  createComment,
  createUser,
  getUserById,
} from "@/lib/sqlite";

// POST - Tạo comment mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, content, authorId, authorName, authorAvatar } = body;

    // Validate required fields
    if (!postId || !content || !authorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu thông tin bắt buộc: postId, content, authorId",
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

    // Create new comment
    const newComment = await createComment({
      content: content.trim(),
      postId,
      authorId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Comment đã được tạo thành công!",
        comment: {
          ...newComment,
          author: {
            id: user.id,
            nickname: user.nickname,
            avatar: user.avatar,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi hệ thống, vui lòng thử lại sau",
      },
      { status: 500 }
    );
  }
}

// GET - Lấy danh sách comments cho một post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    if (!postId) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu postId",
        },
        { status: 400 }
      );
    }

    // Get comments for the post
    const comments = await getCommentsByPostId(postId);

    // Sort by createdAt (newest first)
    comments.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Get total count for pagination
    const total = comments.length;
    const totalPages = Math.ceil(total / limit);

    // Apply pagination
    const paginatedComments = comments.slice(skip, skip + limit);

    // Enrich comments with author information
    const commentsWithAuthors = await Promise.all(
      paginatedComments.map(async (comment) => {
        const author = await getUserById(comment.authorId);
        return {
          ...comment,
          author: author || {
            id: comment.authorId,
            nickname: "Người dùng ẩn danh",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorId}`,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      comments: commentsWithAuthors,
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
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi khi tải comments",
      },
      { status: 500 }
    );
  }
}
