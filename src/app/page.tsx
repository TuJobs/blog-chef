"use client";

import { useAnonymousUser } from "@/contexts/AnonymousUserContext";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  ChefHat,
  Home,
  Baby,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import Header from "@/components/Header";

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
  value: string;
  icon: LucideIcon;
  color: string;
  count: number;
}

export default function HomePage() {
  const { user } = useAnonymousUser();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function loadPosts() {
      try {
        // Lấy bài viết từ server
        const response = await fetch("/api/posts?limit=6");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Transform server posts to match homepage format
            const transformedPosts: Post[] = data.posts.map(
              (post: {
                id: string;
                title: string;
                excerpt: string;
                author: { nickname: string };
                category: string;
                likes?: number;
                comments?: number;
                images?: string[];
                createdAt: string;
              }) => ({
                id: parseInt(post.id),
                title: post.title,
                excerpt: post.excerpt,
                author: post.author.nickname,
                category: post.category,
                likes: post.likes || Math.floor(Math.random() * 50) + 1,
                comments: post.comments || Math.floor(Math.random() * 20) + 1,
                image:
                  post.images && post.images.length > 0
                    ? post.images[0]
                    : `https://images.unsplash.com/photo-${
                        [
                          "1586190848861-99aa4a171e90",
                          "1558618047-3c8c76ca7d13",
                          "1574645065931-2a9c4de10100",
                        ][Math.floor(Math.random() * 3)]
                      }?w=400&h=200&fit=crop`,
                createdAt: new Date(post.createdAt)
                  .toLocaleDateString("vi-VN", {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  .replace(/(\d+)\/(\d+)/, "$2/$1"),
              })
            );
            setPosts(transformedPosts);
          } else {
            throw new Error("API returned error");
          }
        } else {
          throw new Error("API failed");
        }
      } catch (error) {
        console.log("Using default posts:", error);
        // Default posts if server unavailable
        setPosts([
          {
            id: 1,
            title: "Mẹo nấu cơm ngon mỗi ngày",
            excerpt:
              "Bí quyết để có nồi cơm thơm ngon, mềm dẻo như ý muốn của mọi bà nội trợ...",
            author: "Chị Mai Xinh",
            category: "cooking",
            likes: 24,
            comments: 8,
            image:
              "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=200&fit=crop",
            createdAt: "2 giờ trước",
          },
        ]);
      }
    }

    loadPosts();
  }, []);

  const categories: Category[] = [
    {
      name: "Nấu ăn",
      value: "cooking",
      icon: ChefHat,
      color: "bg-orange-100 text-orange-600",
      count: 124,
    },
    {
      name: "Chăm sóc nhà",
      value: "household",
      icon: Home,
      color: "bg-blue-100 text-blue-600",
      count: 89,
    },
    {
      name: "Chăm sóc bé",
      value: "baby",
      icon: Baby,
      color: "bg-pink-100 text-pink-600",
      count: 67,
    },
    {
      name: "Làm đẹp",
      value: "beauty",
      icon: Sparkles,
      color: "bg-purple-100 text-purple-600",
      count: 45,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 to-orange-400 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Blog Nội Trợ</h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Chia sẻ kinh nghiệm và bí quyết làm việc nhà
          </p>
          <Link
            href="/posts/create"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-pink-700 bg-white hover:bg-pink-50 md:py-4 md:text-lg md:px-10"
          >
            <Heart className="h-5 w-5 mr-2" />
            Viết bài ngay
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Chủ đề phổ biến
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/posts?category=${category.value}`}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group"
              >
                <category.icon className={`h-8 w-8 ${category.color} mb-4`} />
                <h4 className="font-semibold text-gray-900 mb-1">
                  {category.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {category.count} bài viết
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Posts */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">
              Bài viết mới nhất
            </h3>
            <Link
              href="/posts"
              className="text-pink-600 hover:text-pink-500 font-medium"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                      {post.category === "cooking" && "Nấu ăn"}
                      {post.category === "household" && "Chăm sóc nhà"}
                      {post.category === "beauty" && "Làm đẹp"}
                      {post.category === "baby" && "Chăm sóc bé"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {post.createdAt}
                    </span>
                  </div>

                  <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-500">bởi</span>
                      <span className="text-sm font-medium text-gray-900">
                        {post.author}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center bg-white rounded-2xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Tham gia cộng đồng nội trợ
          </h3>
          <p className="text-gray-600 mb-6">
            Chia sẻ kinh nghiệm, học hỏi từ nhau và cùng nhau phát triển
          </p>
          <Link
            href="/posts/create"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
          >
            <Heart className="h-5 w-5 mr-2" />
            Bắt đầu viết bài
          </Link>
        </section>
      </div>
    </div>
  );
}
