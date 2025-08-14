import { NextRequest, NextResponse } from "next/server";
import { PostService, UserService } from "@/lib/services";

export async function GET(request: NextRequest) {
  try {
    // Check if cloud database is configured
    if (!process.env.NEON_DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cloud database not configured. Please setup Neon database first.",
          message: "See CLOUD-SETUP.md for configuration instructions",
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const authorId = searchParams.get("authorId");
    const search = searchParams.get("search");

    const offset = (page - 1) * limit;

    let result;

    if (search) {
      // Search posts
      const posts = await PostService.search(search);
      result = {
        posts,
        total: posts.length,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(posts.length / limit),
          hasNext: posts.length > limit,
          hasPrev: page > 1,
        },
      };
    } else {
      // Get posts with pagination
      result = await PostService.findAll({
        limit,
        offset,
        category: category || undefined,
        authorId: authorId || undefined,
      });

      const totalPages = Math.ceil(result.total / limit);

      return NextResponse.json({
        success: true,
        posts: result.posts,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if cloud database is configured
    if (!process.env.NEON_DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cloud database not configured. Please setup Neon database first.",
          message: "See CLOUD-SETUP.md for configuration instructions",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      category,
      tags = [],
      images = [],
      authorId,
      status = "published",
    } = body;

    // Validate required fields
    if (!title || !content || !authorId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the post
    const post = await PostService.create({
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + "...",
      category,
      tags,
      images,
      authorId,
      status,
    });

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create post" },
      { status: 500 }
    );
  }
}
