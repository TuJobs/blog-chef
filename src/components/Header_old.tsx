"use client";

import Link from "next/link";
import { Heart, User, RefreshCw, Menu, X, Edit, PenTool } from "lucide-react";
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

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <img 
                    src={user.avatar} 
                    alt={user.nickname}
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    {user.nickname}
                  </span>
                </div>
                <button
                  onClick={regenerateNickname}
                  title="Đổi bí danh ngẫu nhiên"
                  className="flex items-center space-x-1 text-gray-500 hover:text-pink-600 px-2 py-1 rounded-md text-xs"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Đổi tên</span>
                </button>
              </div>
            )}
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
              
              {/* Mobile User Info */}
              {user && (
                <div className="px-3 py-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <img 
                      src={user.avatar} 
                      alt={user.nickname}
                      className="h-6 w-6 rounded-full"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      {user.nickname}
                    </span>
                  </div>
                  <button
                    onClick={regenerateNickname}
                    className="flex items-center space-x-1 text-gray-500 hover:text-pink-600 text-xs"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Đổi tên ngẫu nhiên</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

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

            {session && (
              <>
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
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    Xin chào, {session.user.name}!
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-600 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="text-gray-600 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Đăng ký
                </Link>
              </div>
            )}
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

              {session ? (
                <>
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
                  <div className="px-3 py-2 text-sm text-gray-600">
                    Xin chào, {session.user.name}!
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-pink-600 text-sm font-medium"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="block px-3 py-2 text-gray-700 hover:text-pink-600 text-sm font-medium"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded-md ml-3 mr-3"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
