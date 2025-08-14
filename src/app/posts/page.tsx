"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { Heart, MessageCircle, Eye, Hash } from "lucide-react";
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

function PostsContent() {
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
        setError(null);

        const params = new URLSearchParams();
        if (category) params.append("category", category);
        if (tag) params.append("tag", tag);
        params.append("page", page.toString());
        params.append("limit", "12");

        const response = await fetch(`/api/posts?${params}`);
        const result = await response.json();

        if (result.success) {
          setPostsData(result);
        } else {
          setError(result.message || "Lỗi khi tải bài viết");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError("Không thể kết nối đến server");
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [category, tag, page]);

  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      cooking: "Nấu ăn",
      home: "Chăm sóc nhà",
      household: "Gia đình",
      beauty: "Làm đẹp",
      baby: "Chăm sóc bé",
      parenting: "Nuôi con",
      health: "Sức khỏe",
      lifestyle: "Lối sống",
      other: "Khác",
    };
    return categoryMap[category] || category;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-16 bg-gray-200 rounded mb-4"></div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-pink-600 transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span>Bài viết</span>
            {category && (
              <>
                <span>/</span>
                <span className="text-pink-600 font-medium">
                  {getCategoryName(category)}
                </span>
              </>
            )}
            {tag && (
              <>
                <span>/</span>
                <span className="text-pink-600 font-medium">#{tag}</span>
              </>
            )}
          </nav>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {category
              ? `${getCategoryName(category)}`
              : tag
              ? `Bài viết với tag #${tag}`
              : "Tất cả bài viết"}
          </h1>
          {postsData && (
            <p className="text-gray-600">
              Tìm thấy {postsData.pagination.total} bài viết
            </p>
          )}
        </div>

        {/* Posts Grid */}
        {postsData?.posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Chưa có bài viết nào
            </h2>
            <p className="text-gray-600 mb-6">
              {category || tag
                ? "Không tìm thấy bài viết phù hợp với bộ lọc này."
                : "Hãy là người đầu tiên đăng bài viết!"}
            </p>
            <Link
              href="/posts/create"
              className="inline-flex items-center px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
            >
              Viết bài mới
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postsData?.posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <Link href={`/posts/${post.id}`}>
                  {/* Post Image */}
                  {post.images.length > 0 ? (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.images[0]}
                        alt={post.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center">
                      <div className="text-4xl opacity-50">
                        {post.category === "cooking"
                          ? "🍳"
                          : post.category === "beauty"
                          ? "💄"
                          : post.category === "baby"
                          ? "👶"
                          : post.category === "parenting"
                          ? "👶"
                          : post.category === "health"
                          ? "🏥"
                          : post.category === "home"
                          ? "🏠"
                          : post.category === "household"
                          ? "🏠"
                          : post.category === "lifestyle"
                          ? "✨"
                          : "📝"}
                      </div>
                    </div>
                  )}
                </Link>

                <div className="p-6">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <Link href={`/posts?category=${post.category}`}>
                      <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium hover:bg-pink-200 transition-colors">
                        {getCategoryName(post.category)}
                      </span>
                    </Link>
                    <span className="text-gray-500 text-sm">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  {/* Post Title */}
                  <Link href={`/posts/${post.id}`}>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-pink-600 transition-colors">
                      {post.title}
                    </h2>
                  </Link>

                  {/* Post Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt || post.content.slice(0, 150) + "..."}
                  </p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <Link key={index} href={`/posts?tag=${tag}`}>
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">
                            <Hash className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        </Link>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-gray-500 text-xs">
                          +{post.tags.length - 3} khác
                        </span>
                      )}
                    </div>
                  )}

                  {/* Author and Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={post.author.avatar}
                        alt={post.author.nickname}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium text-gray-800">
                        {post.author.nickname}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-gray-500 text-sm">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {postsData && postsData.pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12">
            {/* Previous button */}
            {postsData.pagination.hasPrev && (
              <Link
                href={`?${new URLSearchParams({
                  ...(category && { category }),
                  ...(tag && { tag }),
                  page: (page - 1).toString(),
                })}`}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Trước
              </Link>
            )}

            {/* Page numbers */}
            {Array.from(
              { length: Math.min(5, postsData.pagination.totalPages) },
              (_, i) => {
                const pageNum = Math.max(1, page - 2) + i;
                if (pageNum > postsData.pagination.totalPages) return null;

                return (
                  <Link
                    key={pageNum}
                    href={`?${new URLSearchParams({
                      ...(category && { category }),
                      ...(tag && { tag }),
                      page: pageNum.toString(),
                    })}`}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      pageNum === page
                        ? "bg-pink-500 text-white"
                        : "bg-white border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              }
            )}

            {/* Next button */}
            {postsData.pagination.hasNext && (
              <Link
                href={`?${new URLSearchParams({
                  ...(category && { category }),
                  ...(tag && { tag }),
                  page: (page + 1).toString(),
                })}`}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Tiếp →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-4">
                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <PostsContent />
    </Suspense>
  );
}
