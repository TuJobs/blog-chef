import { NextRequest, NextResponse } from "next/server";
import * as db from "@/lib/sqlite";

interface SearchParams {
  q: string; // Search query
  category?: string;
  tag?: string;
  author?: string;
  page?: number;
  limit?: number;
}

// Search function
function searchPosts(
  posts: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    author: { nickname: string; avatar?: string };
    createdAt: string;
    updatedAt?: string;
    likes: number;
    views?: number;
  }>,
  query: string
): typeof posts {
  const searchTerm = query.toLowerCase();

  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm) ||
      post.category.toLowerCase().includes(searchTerm) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
      post.author.nickname.toLowerCase().includes(searchTerm)
  );
}

// GET - Tìm kiếm bài viết
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams: SearchParams = {
      q: url.searchParams.get("q") || "",
      category: url.searchParams.get("category") || undefined,
      tag: url.searchParams.get("tag") || undefined,
      author: url.searchParams.get("author") || undefined,
      page: parseInt(url.searchParams.get("page") || "1"),
      limit: parseInt(url.searchParams.get("limit") || "10"),
    };

    // Validate search query
    if (!searchParams.q.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng nhập từ khóa tìm kiếm",
        },
        { status: 400 }
      );
    }

    // Get all posts from database
    const allPosts = await db.getPosts();

    // Enrich posts with author information
    const postsWithAuthors = await Promise.all(
      allPosts.map(async (post) => {
        const author = await db.getUserById(post.authorId);
        return {
          ...post,
          author: {
            nickname: author?.nickname || "Người dùng ẩn danh",
            avatar:
              author?.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`,
          },
        };
      })
    );

    // Start with search results
    let filteredPosts = searchPosts(postsWithAuthors, searchParams.q);

    // Apply additional filters
    if (searchParams.category) {
      filteredPosts = filteredPosts.filter(
        (post) => post.category === searchParams.category
      );
    }

    if (searchParams.tag) {
      filteredPosts = filteredPosts.filter((post) =>
        post.tags.includes(searchParams.tag!)
      );
    }

    if (searchParams.author) {
      filteredPosts = filteredPosts.filter((post) =>
        post.author.nickname
          .toLowerCase()
          .includes(searchParams.author!.toLowerCase())
      );
    }

    // Sort by relevance (for now, by creation date)
    filteredPosts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Pagination
    const page = Math.max(1, searchParams.page || 1);
    const limit = Math.min(50, Math.max(1, searchParams.limit || 10));
    const offset = (page - 1) * limit;
    const paginatedPosts = filteredPosts.slice(offset, offset + limit);

    // Prepare response data
    const postsWithSummary = paginatedPosts.map((post) => ({
      id: post.id,
      title: post.title,
      content:
        post.content.slice(0, 200) + (post.content.length > 200 ? "..." : ""),
      category: post.category,
      tags: post.tags,
      author: {
        nickname: post.author.nickname,
        avatar: post.author.avatar || "",
      },
      createdAt: post.createdAt,
      updatedAt: post.updatedAt || post.createdAt,
      likes: post.likes || 0,
      views: post.views || 0,
    }));

    const totalPages = Math.ceil(filteredPosts.length / limit);

    return NextResponse.json({
      success: true,
      posts: postsWithSummary,
      pagination: {
        page,
        limit,
        total: filteredPosts.length,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      searchInfo: {
        query: searchParams.q,
        filters: {
          category: searchParams.category,
          tag: searchParams.tag,
          author: searchParams.author,
        },
        resultsCount: filteredPosts.length,
      },
    });
  } catch (error) {
    console.error("Error searching posts:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi khi tìm kiếm bài viết",
      },
      { status: 500 }
    );
  }
}
