"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAnonymousUser } from "@/contexts/AnonymousUserContext";
import Header from "@/components/Header";
import { Heart, ArrowLeft, Image as ImageIcon, Send } from "lucide-react";
import Link from "next/link";

export default function CreatePostPage() {
  const { user } = useAnonymousUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "cooking",
    image: "",
    hashtags: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: "cooking", label: "Nấu ăn" },
    { value: "home", label: "Chăm sóc nhà" },
    { value: "baby", label: "Chăm sóc bé" },
    { value: "beauty", label: "Làm đẹp" },
    { value: "tips", label: "Mẹo hay" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Vui lòng điền đầy đủ tiêu đề và nội dung!");
      return;
    }

    if (!user) {
      alert("Lỗi: Không tìm thấy thông tin người dùng!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Gửi bài viết lên server để lưu trữ chung
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          image: formData.image,
          hashtags: formData.hashtags,
          authorId: user.id,
          authorName: user.nickname,
          authorAvatar: user.avatar,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Bài viết "${formData.title}" đã được đăng thành công! 🎉`);
        // Reset form
        setFormData({
          title: "",
          content: "",
          category: "cooking",
          image: "",
          hashtags: "",
        });
        router.push("/posts");
      } else {
        throw new Error(result.message || "API error");
      }
    } catch (error) {
      console.log("Database unavailable, saving to localStorage:", error);

      // Fallback: Lưu vào localStorage
      try {
        const post = {
          id: Date.now().toString(),
          title: formData.title.trim(),
          content: formData.content.trim(),
          excerpt:
            formData.content.length > 150
              ? formData.content.substring(0, 150) + "..."
              : formData.content,
          category: formData.category,
          tags: formData.hashtags
            ? formData.hashtags
                .split(/[\s,]+/)
                .map((tag: string) => tag.replace("#", "").trim())
                .filter((tag: string) => tag.length > 0)
            : [],
          author: user.nickname,
          authorAvatar: user.avatar,
          image: formData.image,
          likes: 0,
          comments: 0,
          views: 0,
          createdAt: new Date().toISOString(),
        };

        // Lấy posts hiện có từ localStorage
        const existingPosts = JSON.parse(
          localStorage.getItem("blog_posts") || "[]"
        );
        existingPosts.unshift(post); // Thêm vào đầu danh sách

        // Giới hạn 50 bài viết trong localStorage
        if (existingPosts.length > 50) {
          existingPosts.splice(50);
        }

        localStorage.setItem("blog_posts", JSON.stringify(existingPosts));

        alert(
          `Bài viết "${formData.title}" đã được lưu thành công! 🎉\n(Đã lưu vào thiết bị của bạn)`
        );

        // Reset form
        setFormData({
          title: "",
          content: "",
          category: "cooking",
          image: "",
          hashtags: "",
        });

        router.push("/posts");
      } catch (localError) {
        console.error("Error saving to localStorage:", localError);
        alert("Có lỗi xảy ra khi lưu bài viết. Vui lòng thử lại!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-pink-600 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Về trang chủ
          </Link>

          <div className="flex items-center space-x-3 mb-4">
            <Heart className="h-8 w-8 text-pink-500" />
            <h1 className="text-3xl font-bold text-gray-900">Viết bài mới</h1>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tiêu đề bài viết *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ví dụ: Mẹo nấu cơm ngon mỗi ngày"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Chủ đề
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Link hình ảnh (tùy chọn)
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Dán link hình ảnh từ internet hoặc để trống
              </p>
            </div>

            {/* Hashtags */}
            <div>
              <label
                htmlFor="hashtags"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Hashtags (tùy chọn)
              </label>
              <input
                type="text"
                id="hashtags"
                name="hashtags"
                value={formData.hashtags}
                onChange={handleChange}
                placeholder="Ví dụ: #nấuăn #mẹohay #nộitrợ (cách nhau bằng dấu cách)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Sử dụng # trước mỗi hashtag để phân loại bài viết
              </p>
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nội dung bài viết *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={12}
                placeholder="Hãy chia sẻ những kinh nghiệm, mẹo hay của bạn..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <Link
                href="/"
                className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Hủy
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? "Đang đăng..." : "Đăng bài"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">
            💡 Mẹo viết bài hay:
          </h3>
          <ul className="space-y-2 text-yellow-700 text-sm">
            <li>• Tiêu đề ngắn gọn, thu hút và đúng nội dung</li>
            <li>• Chia sẻ kinh nghiệm thực tế, dễ áp dụng</li>
            <li>• Viết câu ngắn, dễ hiểu</li>
            <li>• Thêm hình ảnh minh họa nếu có thể</li>
            <li>• Sử dụng hashtag để dễ tìm kiếm: #nấuăn #mẹohay #nộitrợ</li>
            <li>• Thân thiện và gần gũi với người đọc</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
