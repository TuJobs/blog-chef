import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import AnonymousUser from "@/models/AnonymousUser";

// POST - Tạo bài viết mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, image, hashtags, authorId } = body;

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

    await dbConnect();

    // Tìm hoặc tạo anonymous user
    let anonymousUser = await AnonymousUser.findOne({ sessionId: authorId });
    if (!anonymousUser) {
      // Tạo anonymous user mới nếu chưa có
      anonymousUser = new AnonymousUser({
        sessionId: authorId,
        nickname: "Người dùng ẩn danh", // Sẽ được cập nhật từ client
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
      });
      await anonymousUser.save();
    } else {
      // Cập nhật lastActive
      anonymousUser.lastActive = new Date();
      await anonymousUser.save();
    }

    // Tạo excerpt từ content (150 ký tự đầu)
    const excerpt =
      content.length > 150 ? content.substring(0, 150) + "..." : content;

    // Xử lý hashtags - loại bỏ # và khoảng trắng
    const processedHashtags = hashtags
      ? hashtags
          .split(/[\s,]+/)
          .map((tag: string) => tag.replace("#", "").trim())
          .filter((tag: string) => tag.length > 0)
      : [];

    // Tạo post mới
    const newPost = new Post({
      title: title.trim(),
      content: content.trim(),
      excerpt,
      category,
      tags: processedHashtags,
      anonymousAuthor: anonymousUser._id,
      authorType: "anonymous",
      images: image ? [{ url: image, alt: title }] : [],
      status: "published",
    });

    const savedPost = await newPost.save();

    return NextResponse.json(
      {
        success: true,
        message: "Bài viết đã được tạo thành công!",
        post: {
          id: savedPost._id,
          title: savedPost.title,
          excerpt: savedPost.excerpt,
          category: savedPost.category,
          tags: savedPost.tags,
          createdAt: savedPost.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating post:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      // MongoDB validation error handling
      return NextResponse.json(
        {
          success: false,
          message: "Dữ liệu không hợp lệ",
          errors: ["Vui lòng kiểm tra lại thông tin đầu vào"],
        },
        { status: 400 }
      );
    }

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

    await dbConnect();

    // Build filter
    const filter: Record<string, unknown> = { status: "published" };
    if (category) filter.category = category;
    if (tag) filter.tags = { $in: [tag] };

    // Get posts với populate author
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name email")
      .populate("anonymousAuthor", "nickname avatar")
      .select(
        "title excerpt category tags author anonymousAuthor authorType createdAt views reactions images"
      )
      .lean();

    // Get total count for pagination
    const total = await Post.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
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
