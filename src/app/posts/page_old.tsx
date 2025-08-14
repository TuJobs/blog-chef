"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { Heart, MessageCircle, Eye, Hash, ArrowLeft } from "lucide-react";
import Image from "next/image";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    nickname: string;
    avatar: string;
  };
  images: string[];
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  comments: number;
}

interface PostsData {
  success: boolean;
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function PostsPage() {
  const searchParams = useSearchParams();
  const [postsData, setPostsData] = useState<PostsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);

        // Thử API trước
        const params = new URLSearchParams();
        if (category) params.append("category", category);
        if (tag) params.append("tag", tag);
        params.append("page", page.toString());
        params.append("limit", "12");

        const response = await fetch(`/api/posts?${params}`);
        const result = await response.json();

        if (result.success) {
          setPostsData({
            posts: result.posts,
            pagination: result.pagination,
          });
          return;
        } else {
          throw new Error("API failed");
        }
      } catch (apiError) {
        console.log("API unavailable, using localStorage:", apiError);

        // Fallback: Đọc từ localStorage
        try {
          const localPosts = JSON.parse(
            localStorage.getItem("blog_posts") || "[]"
          );

          // Filter posts
          let filteredPosts: LocalPost[] = localPosts;

          if (category) {
            filteredPosts = filteredPosts.filter(
              (post: LocalPost) => post.category === category
            );
          }

          if (tag) {
            filteredPosts = filteredPosts.filter(
              (post: LocalPost) => post.tags && post.tags.includes(tag)
            );
          }

          // Pagination
          const limit = 12;
          const skip = (page - 1) * limit;
          const paginatedPosts = filteredPosts.slice(skip, skip + limit);
          const total = filteredPosts.length;
          const totalPages = Math.ceil(total / limit);

          // Transform to match API format
          const transformedPosts = paginatedPosts.map((post: LocalPost) => ({
            _id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            category: post.category,
            tags: post.tags || [],
            authorType: "anonymous",
            anonymousAuthor: {
              nickname: post.author,
              avatar: post.authorAvatar,
            },
            createdAt: post.createdAt,
            views: post.views || 0,
            reactions: {
              likes: Array(post.likes || 0).fill({ user: "", createdAt: "" }),
              hearts: [],
            },
            images: post.image ? [{ url: post.image, alt: post.title }] : [],
          }));

          setPostsData({
            posts: transformedPosts,
            pagination: {
              page,
              limit,
              total,
              totalPages,
              hasNext: page < totalPages,
              hasPrev: page > 1,
            },
          });
        } catch (localError) {
          console.error("Error reading from localStorage:", localError);
          setError("Không thể tải bài viết. Hãy thử tạo bài viết đầu tiên!");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [category, tag, page]);

  const getCategoryName = (cat: string) => {
    const categories: Record<string, string> = {
      cooking: "Nấu ăn",
      home: "Chăm sóc nhà",
      baby: "Chăm sóc bé",
      beauty: "Làm đẹp",
      tips: "Mẹo hay",
      health: "Sức khỏe",
      family: "Gia đình",
      lifestyle: "Lối sống",
    };
    return categories[cat] || cat;
  };

  const getAuthorName = (post: Post) => {
    if (post.authorType === "user" && post.author) {
      return post.author.name;
    } else if (post.authorType === "anonymous" && post.anonymousAuthor) {
      return post.anonymousAuthor.nickname;
    }
    return "Người dùng ẩn danh";
  };

  const getAuthorAvatar = (post: Post) => {
    if (post.authorType === "anonymous" && post.anonymousAuthor) {
      return post.anonymousAuthor.avatar;
    }
    return "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-pink-600 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Về trang chủ
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {tag ? (
                  <span className="flex items-center">
                    <Hash className="h-8 w-8 text-pink-500 mr-2" />#{tag}
                  </span>
                ) : category ? (
                  getCategoryName(category)
                ) : (
                  "Tất cả bài viết"
                )}
              </h1>

              {postsData && (
                <p className="text-gray-600">
                  Tìm thấy {postsData.pagination.total} bài viết
                  {tag && ` cho hashtag #${tag}`}
                  {category && ` trong chủ đề ${getCategoryName(category)}`}
                </p>
              )}
            </div>

            <Link
              href="/posts/create"
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Viết bài mới
            </Link>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md p-6 animate-pulse"
              >
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-700 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {postsData && !loading && (
          <>
            {postsData.posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-xl p-8 max-w-md mx-auto">
                  <p className="text-gray-600 text-lg mb-4">
                    Chưa có bài viết nào
                  </p>
                  <Link
                    href="/posts/create"
                    className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Viết bài đầu tiên
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {postsData.posts.map((post) => (
                  <article
                    key={post._id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    {post.images && post.images.length > 0 && (
                      <img
                        src={post.images[0].url}
                        alt={post.images[0].alt}
                        className="w-full h-48 object-cover"
                      />
                    )}

                    <div className="p-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2 py-1 rounded-full">
                          {getCategoryName(post.category)}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Link
                              key={tag}
                              href={`/posts?tag=${encodeURIComponent(tag)}`}
                              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-full transition-colors"
                            >
                              <Hash className="h-3 w-3 mr-1" />
                              {tag}
                            </Link>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              +{post.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Author - Hidden for cleaner look */}
                      <div className="hidden">
                        <div className="flex items-center space-x-2">
                          <img
                            src={getAuthorAvatar(post)}
                            alt={getAuthorName(post)}
                            className="h-6 w-6 rounded-full"
                          />
                          <span>bởi {getAuthorName(post)}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100">
                        <button className="flex items-center space-x-1 text-gray-600 hover:text-pink-600 transition-colors">
                          <Heart className="h-4 w-4" />
                          <span>{post.reactions?.likes?.length || 0}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          <span>0</span>
                        </button>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Eye className="h-4 w-4" />
                          <span>{post.views}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {postsData.pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center space-x-2">
                  {postsData.pagination.hasPrev && (
                    <Link
                      href={`/posts?${new URLSearchParams({
                        ...(category && { category }),
                        ...(tag && { tag }),
                        page: (page - 1).toString(),
                      })}`}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Trước
                    </Link>
                  )}

                  <span className="px-3 py-2 text-sm font-medium text-white bg-pink-600 border border-pink-600 rounded-md">
                    {postsData.pagination.page}
                  </span>

                  {postsData.pagination.hasNext && (
                    <Link
                      href={`/posts?${new URLSearchParams({
                        ...(category && { category }),
                        ...(tag && { tag }),
                        page: (page + 1).toString(),
                      })}`}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Sau
                    </Link>
                  )}
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
