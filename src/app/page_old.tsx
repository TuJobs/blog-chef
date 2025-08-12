"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Users,
  ChefHat,
  Home,
  Baby,
  Sparkles,
} from "lucide-react";

import { LucideIcon } from "lucide-react";

interface Post {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  likes: number;
  comments: number;
  image: string;
  createdAt: string;
}

interface Category {
  name: string;
  icon: LucideIcon;
  color: string;
  count: number;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [posts] = useState<Post[]>([
    {
      id: 1,
      title: "Mẹo nấu cơm ngon mỗi ngày",
      excerpt:
        "Bí quyết để có nồi cơm thơm ngon, mềm dẻo như ý muốn của mọi bà nội trợ...",
      author: "Chị Mai",
      category: "cooking",
      likes: 24,
      comments: 8,
      image: "/api/placeholder/400/200",
      createdAt: "2 giờ trước",
    },
    {
      id: 2,
      title: "Cách sắp xếp tủ quần áo gọn gàng",
      excerpt:
        "Hướng dẫn chi tiết cách sắp xếp tủ quần áo để tiết kiệm không gian và dễ tìm kiếm...",
      author: "Chị Lan",
      category: "homecare",
      likes: 18,
      comments: 5,
      image: "/api/placeholder/400/200",
      createdAt: "5 giờ trước",
    },
    {
      id: 3,
      title: "Chăm sóc bé sơ sinh ban đêm",
      excerpt:
        "Những lưu ý quan trọng khi chăm sóc bé sơ sinh vào ban đêm để cả mẹ và bé đều ngủ ngon...",
      author: "Cô Hương",
      category: "childcare",
      likes: 32,
      comments: 12,
      image: "/api/placeholder/400/200",
      createdAt: "1 ngày trước",
    },
  ]);

  const categories: Category[] = [
    {
      name: "Nấu ăn",
      icon: ChefHat,
      color: "bg-orange-100 text-orange-600",
      count: 124,
    },
    {
      name: "Chăm sóc nhà",
      icon: Home,
      color: "bg-blue-100 text-blue-600",
      count: 89,
    },
    {
      name: "Chăm sóc bé",
      icon: Baby,
      color: "bg-pink-100 text-pink-600",
      count: 67,
    },
    {
      name: "Làm đẹp",
      icon: Sparkles,
      color: "bg-purple-100 text-purple-600",
      count: 45,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-pink-500" />
              <h1 className="text-2xl font-bold text-gray-900">Blog Nội Trợ</h1>
            </div>

            <nav className="hidden md:flex space-x-8">
              <Link
                href="/"
                className="text-gray-900 hover:text-pink-600 font-medium"
              >
                Trang chủ
              </Link>
              <Link href="/posts" className="text-gray-600 hover:text-pink-600">
                Bài viết
              </Link>
              <Link
                href="/categories"
                className="text-gray-600 hover:text-pink-600"
              >
                Chủ đề
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-pink-600">
                Giới thiệu
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {session ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/posts/new"
                    className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition"
                  >
                    Viết bài
                  </Link>
                  <div className="flex items-center space-x-2">
                    <img
                      src={session.user.avatar || "/api/placeholder/32/32"}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-gray-700">{session.user.name}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/auth/signin"
                    className="text-gray-600 hover:text-pink-600"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 to-orange-400 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Cộng đồng nội trợ Việt Nam
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-pink-100">
            Chia sẻ kinh nghiệm, mẹo hay và kết nối với các bà mẹ, bà nội trợ
            trên khắp cả nước
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/posts"
              className="bg-white text-pink-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Khám phá bài viết
            </Link>
            {!session && (
              <Link
                href="/auth/signup"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-pink-500 transition"
              >
                Tham gia ngay
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Chủ đề phổ biến
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/categories/${category.name.toLowerCase()}`}
                className="group p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <category.icon className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {category.name}
                </h4>
                <p className="text-gray-600 text-sm">
                  {category.count} bài viết
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-bold text-gray-900">
              Bài viết mới nhất
            </h3>
            <Link
              href="/posts"
              className="text-pink-500 hover:text-pink-600 font-medium"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-r from-pink-200 to-orange-200 flex items-center justify-center">
                  <ChefHat className="h-16 w-16 text-pink-400" />
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-pink-100 text-pink-600 text-xs font-medium rounded-full">
                      {post.category === "cooking"
                        ? "Nấu ăn"
                        : post.category === "homecare"
                        ? "Chăm sóc nhà"
                        : "Chăm sóc bé"}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {post.createdAt}
                    </span>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h4>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Heart className="h-4 w-4" />
                        <span className="text-sm">{post.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">{post.comments}</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{post.author}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-16 bg-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              Cộng đồng đang phát triển
            </h3>
            <p className="text-pink-100 text-lg">
              Tham gia cùng hàng nghìn bà mẹ, bà nội trợ trên khắp Việt Nam
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Users className="h-12 w-12 mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">2,547</div>
              <div className="text-pink-100">Thành viên</div>
            </div>
            <div>
              <MessageCircle className="h-12 w-12 mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">8,432</div>
              <div className="text-pink-100">Bài viết</div>
            </div>
            <div>
              <Heart className="h-12 w-12 mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">15,689</div>
              <div className="text-pink-100">Lượt thích</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-pink-500" />
                <span className="font-bold text-lg">Blog Nội Trợ</span>
              </div>
              <p className="text-gray-400 text-sm">
                Cộng đồng chia sẻ kinh nghiệm và kết nối các bà mẹ, bà nội trợ
                Việt Nam.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Chủ đề</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/categories/cooking" className="hover:text-white">
                    Nấu ăn
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories/homecare"
                    className="hover:text-white"
                  >
                    Chăm sóc nhà
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories/childcare"
                    className="hover:text-white"
                  >
                    Chăm sóc bé
                  </Link>
                </li>
                <li>
                  <Link href="/categories/beauty" className="hover:text-white">
                    Làm đẹp
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Về chúng tôi</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white">
                    Giới thiệu
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Liên hệ
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Chính sách
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Điều khoản
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Kết nối</h4>
              <p className="text-gray-400 text-sm mb-4">
                Theo dõi chúng tôi để nhận tin tức mới nhất
              </p>
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs">
                  f
                </div>
                <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-xs">
                  ig
                </div>
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-xs">
                  yt
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Blog Nội Trợ. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
