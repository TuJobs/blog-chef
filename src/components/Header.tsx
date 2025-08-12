"use client";

import Link from "next/link";
import { Heart, RefreshCw, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAnonymousUser } from "@/contexts/AnonymousUserContext";

export default function Header() {
  const { user, regenerateNickname } = useAnonymousUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-pink-500" />
            <span className="text-xl font-bold text-gray-900">
              Blog Nội Trợ
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Trang chủ
            </Link>
            <Link
              href="/posts/create"
              className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Viết bài
            </Link>
            <Link
              href="/profile"
              className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Hồ sơ
            </Link>
          </div>

          {/* User Section - Hidden for anonymous users */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Không hiển thị thông tin user để giao diện gọn gàng */}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-pink-600"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 text-gray-700 hover:text-pink-600 text-sm font-medium"
              >
                Trang chủ
              </Link>
              <Link
                href="/posts/create"
                className="block px-3 py-2 text-gray-700 hover:text-pink-600 text-sm font-medium"
              >
                Viết bài
              </Link>
              <Link
                href="/profile"
                className="block px-3 py-2 text-gray-700 hover:text-pink-600 text-sm font-medium"
              >
                Hồ sơ
              </Link>

              {/* Mobile User Info - Hidden for cleaner look */}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
