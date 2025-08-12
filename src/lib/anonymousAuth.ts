import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

// Danh sách bí danh tiếng Việt cho nội trợ
const NICKNAMES = [
  "Chị Mai Xinh",
  "Cô Hương Thơm",
  "Bà Lan Duyên",
  "Chị Hoa Tươi",
  "Cô Linh Đông",
  "Bà Thu Vàng",
  "Chị Nhung Mềm",
  "Cô Hạnh Ngọt",
  "Bà Phương Nồng",
  "Chị Oanh Vui",
  "Cô Trang Sạch",
  "Bà Bích Xanh",
  "Chị Thủy Trong",
  "Cô Kim Loại",
  "Bà Ngọc Quý",
  "Chị Hồng Tươi",
  "Cô Xuân Xanh",
  "Bà Hạ Mát",
  "Chị Thu Vàng",
  "Cô Đông Ấm",
  "Bà Thành Công",
  "Chị Yêu Đời",
  "Cô Hạnh Phúc",
  "Bà Bình An",
  "Chị Nấu Giỏi",
  "Cô Dọn Khéo",
  "Bà Trồng Rau",
  "Chị Bánh Ngon",
  "Cô Canh Đậm",
  "Bà Cơm Dẻo",
  "Chị Chăm Con",
  "Cô Yêu Chồng",
];

export interface AnonymousUser {
  id: string;
  nickname: string;
  avatar: string;
  createdAt: Date;
  sessionId: string;
}

// Tạo user anonymous với bí danh ngẫu nhiên
export function createAnonymousUser(sessionId?: string): AnonymousUser {
  const id = randomBytes(16).toString("hex");
  const nickname = NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)];
  const avatarSeed = Math.floor(Math.random() * 1000);
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=ffeaa7,fab1a0,fd79a8,e17055,00b894,00cec9,6c5ce7,a29bfe`;

  return {
    id,
    nickname,
    avatar,
    createdAt: new Date(),
    sessionId: sessionId || id,
  };
}

// Lưu user vào localStorage (client-side)
export function saveAnonymousUser(user: AnonymousUser) {
  if (typeof window !== "undefined") {
    localStorage.setItem("anonymousUser", JSON.stringify(user));
  }
}

// Lấy user từ localStorage (client-side)
export function getAnonymousUser(): AnonymousUser | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("anonymousUser");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

// API Route để tạo user anonymous mới
export async function POST(request: NextRequest) {
  try {
    const sessionId = request.headers.get("x-session-id") || undefined;
    const user = createAnonymousUser(sessionId);

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating anonymous user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create anonymous user",
      },
      { status: 500 }
    );
  }
}

// API Route để lấy thông tin user hiện tại
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get("x-session-id");

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "No session ID provided",
        },
        { status: 400 }
      );
    }

    // Trong thực tế, bạn có thể lưu user vào database
    // Ở đây chỉ return user mới cho đơn giản
    const user = createAnonymousUser(sessionId);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error getting anonymous user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get anonymous user",
      },
      { status: 500 }
    );
  }
}
