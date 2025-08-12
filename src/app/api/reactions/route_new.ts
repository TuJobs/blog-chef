import { NextRequest, NextResponse } from "next/server";
import {
  getReactionsByPostId,
  toggleReaction,
  createUser,
  getUserById,
} from "@/lib/sqlite";

// POST - Toggle reaction (like/unlike)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      postId,
      userId,
      authorId,
      authorName,
      authorAvatar,
      type = "LIKE",
    } = body;

    // Support both userId and authorId for compatibility
    const userIdToUse = userId || authorId;

    // Validate required fields
    if (!postId || !userIdToUse) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu thông tin bắt buộc: postId, userId/authorId",
        },
        { status: 400 }
      );
    }

    // Ensure user exists or create new user
    let user = await getUserById(userIdToUse);
    if (!user) {
      user = await createUser({
        id: userIdToUse,
        nickname: authorName || "Người dùng ẩn danh",
        avatar:
          authorAvatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${userIdToUse}`,
      });
    }

    // Toggle reaction
    const result = await toggleReaction(postId, userIdToUse, type);

    // Get updated reaction counts for the post
    const reactions = await getReactionsByPostId(postId);
    const likesCount = reactions.length;

    return NextResponse.json({
      success: true,
      message: result.added ? "Đã thích bài viết!" : "Đã bỏ thích bài viết!",
      action: result.added ? "added" : "removed",
      reaction: result.reaction,
      added: result.added,
      likesCount,
    });
  } catch (error: unknown) {
    console.error("Error toggling reaction:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi hệ thống, vui lòng thử lại sau",
      },
      { status: 500 }
    );
  }
}

// GET - Lấy reaction counts và user reaction status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const userId = searchParams.get("userId");
    const authorId = searchParams.get("authorId");

    // Support both userId and authorId for compatibility
    const userIdToUse = userId || authorId;

    if (!postId) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu postId",
        },
        { status: 400 }
      );
    }

    // Get reactions for the post
    const reactions = await getReactionsByPostId(postId);

    // Count reactions by type
    const reactionCounts = reactions.reduce((acc, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Check if user has reacted
    let userReaction = null;
    let hasUserReacted = false;

    if (userIdToUse) {
      userReaction = reactions.find((r) => r.authorId === userIdToUse) || null;
      hasUserReacted = !!userReaction;
    }

    return NextResponse.json({
      success: true,
      postId,
      totalCount: reactions.length,
      reactionCounts,
      userReaction,
      hasUserReacted,
    });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi khi tải reactions",
      },
      { status: 500 }
    );
  }
}
