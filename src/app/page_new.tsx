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
      title: "Cách dọn dẹp nhà cửa nhanh gọn",
      excerpt:
        "Những mẹo hay giúp bạn dọn dẹp nhà cửa một cách hiệu quả và tiết kiệm thời gian...",
      author: "Chị Hương",
      category: "home",
      likes: 18,
      comments: 5,
      image: "/api/placeholder/400/200",
      createdAt: "4 giờ trước",
    },
    {
      id: 3,
      title: "Chăm sóc da mặt tại nhà",
      excerpt:
        "Những bước cơ bản để chăm sóc da mặt tại nhà với nguyên liệu tự nhiên...",
      author: "Chị Lan",
      category: "beauty",
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
      {" "}
      <Header /> {/* Hero Section */}{" "}
      <section className="bg-gradient-to-r from-pink-500 to-orange-400 text-white py-20">
        {" "}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {" "}
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            {" "}
            Chia sẻ cuộc sống <span className="text-yellow-200">
              nội trợ
            </span>{" "}
          </h2>{" "}
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            {" "}
            Nơi các bà nội trợ chia sẻ kinh nghiệm nấu ăn, chăm sóc gia đình và
            những mẹo hay trong cuộc sống hàng ngày{" "}
          </p>{" "}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {" "}
            {session ? (
              <Link
                href="/posts/create"
                className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                {" "}
                Viết bài ngay{" "}
              </Link>
            ) : (
              <>
                {" "}
                <Link
                  href="/auth/signup"
                  className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                >
                  {" "}
                  Tham gia ngay{" "}
                </Link>{" "}
                <Link
                  href="/auth/signin"
                  className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-pink-600 transition-colors"
                >
                  {" "}
                  Đăng nhập{" "}
                </Link>{" "}
              </>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* Categories Section */}{" "}
      <section className="py-16 bg-white">
        {" "}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {" "}
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {" "}
            Chủ đề hot{" "}
          </h3>{" "}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {" "}
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 text-center border border-gray-100"
              >
                {" "}
                <div
                  className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  {" "}
                  <category.icon className="h-8 w-8" />{" "}
                </div>{" "}
                <h4 className="font-semibold text-gray-900 mb-2">
                  {" "}
                  {category.name}{" "}
                </h4>{" "}
                <p className="text-sm text-gray-600">
                  {category.count} bài viết
                </p>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* Featured Posts */}{" "}
      <section className="py-16 bg-gray-50">
        {" "}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {" "}
          <div className="flex justify-between items-center mb-12">
            {" "}
            <h3 className="text-3xl font-bold text-gray-900">
              {" "}
              Bài viết nổi bật{" "}
            </h3>{" "}
            <Link
              href="/posts"
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              {" "}
              Xem tất cả →{" "}
            </Link>{" "}
          </div>{" "}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {" "}
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {" "}
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />{" "}
                <div className="p-6">
                  {" "}
                  <h4 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {" "}
                    {post.title}{" "}
                  </h4>{" "}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {" "}
                    {post.excerpt}{" "}
                  </p>{" "}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    {" "}
                    <span>bởi {post.author}</span> <span>{post.createdAt}</span>{" "}
                  </div>{" "}
                  <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100">
                    {" "}
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-pink-600">
                      {" "}
                      <Heart className="h-4 w-4" /> <span>{post.likes}</span>{" "}
                    </button>{" "}
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
                      {" "}
                      <MessageCircle className="h-4 w-4" />{" "}
                      <span>{post.comments}</span>{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
              </article>
            ))}{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* Community Stats */}{" "}
      <section className="py-16 bg-pink-500 text-white">
        {" "}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {" "}
          <h3 className="text-3xl font-bold mb-12">
            {" "}
            Cộng đồng Blog Nội Trợ{" "}
          </h3>{" "}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {" "}
            <div>
              {" "}
              <div className="text-4xl font-bold mb-2">1,234</div>{" "}
              <div className="text-pink-100">Thành viên</div>{" "}
            </div>{" "}
            <div>
              {" "}
              <div className="text-4xl font-bold mb-2">5,678</div>{" "}
              <div className="text-pink-100">Bài viết</div>{" "}
            </div>{" "}
            <div>
              {" "}
              <div className="text-4xl font-bold mb-2">12,345</div>{" "}
              <div className="text-pink-100">Bình luận</div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* Footer */}{" "}
      <footer className="bg-gray-900 text-white py-12">
        {" "}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {" "}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {" "}
            <div>
              {" "}
              <div className="flex items-center space-x-2 mb-4">
                {" "}
                <Heart className="h-6 w-6 text-pink-500" />{" "}
                <h4 className="text-xl font-bold">Blog Nội Trợ</h4>{" "}
              </div>{" "}
              <p className="text-gray-300">
                {" "}
                Nơi chia sẻ kinh nghiệm và kết nối cộng đồng nội trợ Việt Nam.{" "}
              </p>{" "}
            </div>{" "}
            <div>
              {" "}
              <h5 className="font-semibold mb-4">Chủ đề</h5>{" "}
              <ul className="space-y-2 text-gray-300">
                {" "}
                <li>
                  {" "}
                  <Link href="/categories/cooking" className="hover:text-white">
                    {" "}
                    Nấu ăn{" "}
                  </Link>{" "}
                </li>{" "}
                <li>
                  {" "}
                  <Link href="/categories/home" className="hover:text-white">
                    {" "}
                    Chăm sóc nhà{" "}
                  </Link>{" "}
                </li>{" "}
                <li>
                  {" "}
                  <Link href="/categories/baby" className="hover:text-white">
                    {" "}
                    Chăm sóc bé{" "}
                  </Link>{" "}
                </li>{" "}
                <li>
                  {" "}
                  <Link href="/categories/beauty" className="hover:text-white">
                    {" "}
                    Làm đẹp{" "}
                  </Link>{" "}
                </li>{" "}
              </ul>{" "}
            </div>{" "}
            <div>
              {" "}
              <h5 className="font-semibold mb-4">Hỗ trợ</h5>{" "}
              <ul className="space-y-2 text-gray-300">
                {" "}
                <li>
                  {" "}
                  <Link href="/help" className="hover:text-white">
                    {" "}
                    Trợ giúp{" "}
                  </Link>{" "}
                </li>{" "}
                <li>
                  {" "}
                  <Link href="/contact" className="hover:text-white">
                    {" "}
                    Liên hệ{" "}
                  </Link>{" "}
                </li>{" "}
                <li>
                  {" "}
                  <Link href="/privacy" className="hover:text-white">
                    {" "}
                    Bảo mật{" "}
                  </Link>{" "}
                </li>{" "}
                <li>
                  {" "}
                  <Link href="/terms" className="hover:text-white">
                    {" "}
                    Điều khoản{" "}
                  </Link>{" "}
                </li>{" "}
              </ul>{" "}
            </div>{" "}
            <div>
              {" "}
              <h5 className="font-semibold mb-4">Kết nối</h5>{" "}
              <p className="text-gray-300 mb-4">
                {" "}
                Theo dõi chúng tôi để nhận thông tin mới nhất{" "}
              </p>{" "}
              <div className="flex space-x-4">
                {" "}
                <a href="#" className="text-gray-300 hover:text-white">
                  {" "}
                  Facebook{" "}
                </a>{" "}
                <a href="#" className="text-gray-300 hover:text-white">
                  {" "}
                  Instagram{" "}
                </a>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
            {" "}
            <p>&copy; 2025 Blog Nội Trợ. Tất cả quyền được bảo lưu.</p>{" "}
          </div>{" "}
        </div>{" "}
      </footer>{" "}
    </div>
  );
}
