import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AnonymousUser from "@/models/AnonymousUser";
import { createAnonymousUser } from "@/lib/anonymousAuth";

// POST - Tạo hoặc cập nhật anonymous user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, nickname, avatar } = body;

    await dbConnect();

    let user;
    if (sessionId) {
      // Cập nhật user hiện có hoặc tạo mới
      user = await AnonymousUser.findOneAndUpdate(
        { sessionId },
        {
          nickname: nickname || "Người dùng ẩn danh",
          avatar:
            avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
          lastActive: new Date(),
        },
        { upsert: true, new: true }
      );
    } else {
      // Tạo user mới hoàn toàn
      const newUserData = createAnonymousUser();
      user = new AnonymousUser({
        sessionId: newUserData.id,
        nickname: newUserData.nickname,
        avatar: newUserData.avatar,
        lastActive: new Date(),
      });
      await user.save();
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.sessionId,
          nickname: user.nickname,
          avatar: user.avatar,
          createdAt: user.createdAt,
          sessionId: user.sessionId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error handling anonymous user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi khi xử lý người dùng ẩn danh",
      },
      { status: 500 }
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

    await dbConnect();

    const user = await AnonymousUser.findOne({ sessionId });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy người dùng",
        },
        { status: 404 }
      );
    }

    // Cập nhật lastActive
    user.lastActive = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user.sessionId,
        nickname: user.nickname,
        avatar: user.avatar,
        createdAt: user.createdAt,
        sessionId: user.sessionId,
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
