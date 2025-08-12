"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAnonymousUser } from "@/contexts/AnonymousUserContext";
import Link from "next/link";
import Image from "next/image";

interface Post {
  id: string;
  title: string;
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
  likes: number;
  views: number;
  comments: number;
}

interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  likes: number;
  createdAt: string;
  author: {
    id: string;
    nickname: string;
    avatar: string;
    createdAt: string;
  };
}

interface ReactionData {
  success: boolean;
  postId: string;
  totalCount: number;
  reactionCounts: {
    like: number;
  };
  userReaction: string | null;
  hasUserReacted: boolean;
}

export default function PostDetailPage() {
  const params = useParams();
  const { user } = useAnonymousUser();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactionData, setReactionData] = useState<ReactionData | null>(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch post details
  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data.post);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?postId=${postId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Fetch reactions
  const fetchReactions = async () => {
    try {
      const response = await fetch(
        `/api/reactions?postId=${postId}&userId=${user?.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setReactionData(data);
      }
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };

  // Handle like/unlike
  const handleReaction = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          userId: user.id,
          type: "like",
        }),
      });

      if (response.ok) {
        await fetchReactions();
        // Update post likes count
        if (post) {
          const updatedPost = { ...post };
          if (reactionData?.hasUserReacted) {
            updatedPost.likes = Math.max(0, updatedPost.likes - 1);
          } else {
            updatedPost.likes += 1;
          }
          setPost(updatedPost);
        }
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          content: newComment.trim(),
          authorId: user.id,
          authorName: user.nickname,
          authorAvatar: user.avatar,
        }),
      });

      if (response.ok) {
        setNewComment("");
        await fetchComments();
        // Update post comments count
        if (post) {
          setPost({ ...post, comments: post.comments + 1 });
        }
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Category mapping
  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      cooking: "Nấu ăn",
      household: "Gia đình",
      beauty: "Làm đẹp",
      parenting: "Nuôi con",
      health: "Sức khỏe",
      lifestyle: "Lối sống",
      other: "Khác",
    };
    return categoryMap[category] || category;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPost(), fetchComments(), fetchReactions()]);
      setLoading(false);
    };

    if (postId && user) {
      loadData();
    }
  }, [postId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Không tìm thấy bài viết
            </h1>
            <Link
              href="/posts"
              className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              ← Quay lại danh sách bài viết
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <div className="mb-6">
            <Link
              href="/posts"
              className="inline-flex items-center text-pink-600 hover:text-pink-700 transition-colors"
            >
              ← Quay lại danh sách bài viết
            </Link>
          </div>

          {/* Post content */}
          <article className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="p-6 md:p-8">
              {/* Post header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                    {getCategoryName(post.category)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {formatDate(post.createdAt)}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {post.title}
                </h1>

                {/* Author info */}
                <div className="flex items-center space-x-3 mb-4">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.nickname}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {post.author.nickname}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {post.views} lượt xem • {post.comments} bình luận
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Post images */}
              {post.images.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {post.images.map((image, index) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`Hình ảnh ${index + 1}`}
                        width={600}
                        height={400}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Post content */}
              <div className="prose prose-lg max-w-none mb-8">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {post.content}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t pt-6">
                <button
                  onClick={handleReaction}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    reactionData?.hasUserReacted
                      ? "bg-pink-100 text-pink-700 hover:bg-pink-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-lg">
                    {reactionData?.hasUserReacted ? "❤️" : "🤍"}
                  </span>
                  <span className="font-medium">
                    {reactionData?.reactionCounts.like || 0} Thích
                  </span>
                </button>

                <div className="flex items-center space-x-4 text-gray-600 text-sm">
                  <span>{post.views} lượt xem</span>
                  <span>{post.comments} bình luận</span>
                </div>
              </div>
            </div>
          </article>

          {/* Comments section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Bình luận ({comments.length})
              </h3>

              {/* Add comment form */}
              {user && (
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <div className="flex items-start space-x-3">
                    <Image
                      src={user.avatar}
                      alt={user.nickname}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Viết bình luận của bạn..."
                        className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        rows={3}
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          type="submit"
                          disabled={!newComment.trim() || submitting}
                          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          {submitting ? "Đang gửi..." : "Gửi bình luận"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* Comments list */}
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg mb-2">🗨️</p>
                    <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex items-start space-x-3"
                    >
                      <Image
                        src={comment.author.avatar}
                        alt={comment.author.nickname}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {comment.author.nickname}
                          </h4>
                          <span className="text-gray-500 text-sm">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        {comment.likes > 0 && (
                          <div className="flex items-center mt-2 text-gray-600 text-sm">
                            <span className="text-pink-500">❤️</span>
                            <span className="ml-1">{comment.likes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
