import { NextRequest, NextResponse } from "next/server";
import * as db from "@/lib/database-service";

// GET - Lấy thống kê tổng quan
export async function GET(request: NextRequest) {
  try {
    // Read all data from database
    const posts = await db.getPosts();
    const comments = await db.getComments();
    const reactions = await db.getReactions();

    // Calculate statistics
    const totalPosts = posts.length;
    const totalComments = comments.length;
    const totalReactions = reactions.length;

    // Posts by category
    const postsByCategory = posts.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPosts = posts.filter(
      (post) => new Date(post.created_at) >= sevenDaysAgo
    ).length;

    const recentComments = comments.filter(
      (comment) => new Date(comment.created_at) >= sevenDaysAgo
    ).length;

    const recentReactions = reactions.filter(
      (reaction) => new Date(reaction.created_at) >= sevenDaysAgo
    ).length;

    // Top posts by likes - enrich with author info
    const topPostsData = posts
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 5);

    const topPosts = await Promise.all(
      topPostsData.map(async (post) => {
        const author = await db.getUserById(post.author_id);
        return {
          id: post.id,
          title: post.title,
          likes: post.likes || 0,
          author: author?.nickname || "Người dùng ẩn danh",
        };
      })
    );

    return NextResponse.json({
      success: true,
      stats: {
        total: {
          posts: totalPosts,
          comments: totalComments,
          reactions: totalReactions,
        },
        postsByCategory,
        recentActivity: {
          posts: recentPosts,
          comments: recentComments,
          reactions: recentReactions,
        },
        topPosts,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi khi tải thống kê",
      },
      { status: 500 }
    );
  }
}
