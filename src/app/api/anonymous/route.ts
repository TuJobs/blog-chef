import { NextRequest, NextResponse } from "next/server";
import * as db from "@/lib/sqlite";
import { createAnonymousUser } from "@/lib/anonymousAuth";

// POST - Tạo hoặc cập nhật anonymous user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, nickname, avatar } = body;

    let user;
    if (sessionId) {
      // Kiểm tra user có tồn tại không
      user = await db.getUserById(sessionId);

      if (user) {
        // User đã tồn tại, không cần cập nhật
        return NextResponse.json(
          {
            success: true,
            user: {
              id: user.id,
              nickname: user.nickname,
              avatar: user.avatar,
              createdAt: user.createdAt,
              sessionId: user.id,
            },
          },
          { status: 200 }
        );
      }
    }

    // Tạo user mới
    const newUserData = createAnonymousUser();
    user = await db.createUser({
      id: sessionId || newUserData.id,
      nickname: nickname || newUserData.nickname,
      avatar: avatar || newUserData.avatar,
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          createdAt: user.createdAt,
          sessionId: user.id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error handling anonymous user:", error);

    // Fallback: tạo user đơn giản nếu có lỗi
    const fallbackUser = createAnonymousUser();
    return NextResponse.json(
      {
        success: true,
        user: {
          id: fallbackUser.id,
          nickname: fallbackUser.nickname,
          avatar: fallbackUser.avatar,
          createdAt: new Date().toISOString(),
          sessionId: fallbackUser.id,
        },
      },
      { status: 201 }
    );
  }
}

// GET - Lấy thông tin user theo sessionId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu sessionId",
        },
        { status: 400 }
      );
    }

    const user = await db.getUserById(sessionId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy người dùng",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        createdAt: user.createdAt,
        sessionId: user.id,
      },
    });
  } catch (error) {
    console.error("Error getting anonymous user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi khi lấy thông tin người dùng",
      },
      { status: 500 }
    );
  }
}
