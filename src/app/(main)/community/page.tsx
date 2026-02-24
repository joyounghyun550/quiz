"use client";

import { useCallback, useEffect, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { getTierInfo } from "@/entities/user/lib/tier.util";

type PostAuthor = {
  id: string;
  name: string;
  profile_image_url: string | null;
  current_lp: number;
  current_tier: string;
};

type Post = {
  id: string;
  user_id: string;
  type: "question" | "discussion";
  title: string | null;
  content: string;
  created_at: string;
  author: PostAuthor | null;
  replyCount: number;
};

type TabKey = "all" | "question" | "discussion";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "question", label: "질문" },
  { key: "discussion", label: "토론" },
];

export default function CommunityPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<"question" | "discussion">("question");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPosts = useCallback(
    async (type: TabKey) => {
      setIsLoading(true);
      try {
        const param = type === "all" ? "" : `&type=${type}`;
        const res = await fetch(`/api/community?page=1${param}`);
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        setPosts(data.posts ?? []);
        setCurrentUserId(data.currentUserId ?? null);
      } catch {
        // error
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    loadPosts(activeTab);
  }, [activeTab, loadPosts]);

  const handleSubmitPost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: newType, title: newTitle, content: newContent }),
      });
      if (res.ok) {
        setShowNewPost(false);
        setNewTitle("");
        setNewContent("");
        loadPosts(activeTab);
      }
    } catch {
      // error
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "방금 전";
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;
    return d.toLocaleDateString("ko-KR");
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 pb-24 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">커뮤니티</h1>
          <p className="text-xs text-gray-500">질문하고 토론하고 함께 성장해요</p>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-600"
        >
          + 글쓰기
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? "bg-cyan-500/15 text-cyan-400"
                : "bg-gray-900/50 text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <h2 className="mb-4 text-lg font-bold text-white">새 글 작성</h2>

            {/* Type selector */}
            <div className="mb-3 flex gap-2">
              <button
                onClick={() => setNewType("question")}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  newType === "question" ? "bg-blue-500/20 text-blue-400" : "bg-gray-800 text-gray-500"
                }`}
              >
                질문
              </button>
              <button
                onClick={() => setNewType("discussion")}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  newType === "discussion" ? "bg-purple-500/20 text-purple-400" : "bg-gray-800 text-gray-500"
                }`}
              >
                토론
              </button>
            </div>

            <input
              type="text"
              placeholder="제목"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mb-3 w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-500"
            />
            <textarea
              placeholder="내용을 입력하세요..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={5}
              className="mb-4 w-full resize-none rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-500"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowNewPost(false)}
                className="flex-1 rounded-xl border border-gray-700 py-2.5 text-sm font-semibold text-gray-400 transition-colors hover:text-white"
              >
                취소
              </button>
              <button
                onClick={handleSubmitPost}
                disabled={isSubmitting || !newTitle.trim() || !newContent.trim()}
                className="flex-1 rounded-xl bg-cyan-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-600 disabled:opacity-40"
              >
                {isSubmitting ? "등록 중..." : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
          <span className="text-4xl">💬</span>
          <p className="text-sm">아직 게시글이 없습니다</p>
          <p className="text-xs text-gray-600">첫 번째 글을 작성해보세요!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isMe={post.user_id === currentUserId}
              formatDate={formatDate}
              onClick={() => router.push(`/community/${post.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({
  post,
  isMe,
  formatDate,
  onClick,
}: {
  post: Post;
  isMe: boolean;
  formatDate: (d: string) => string;
  onClick: () => void;
}) {
  const tierInfo = post.author ? getTierInfo(post.author.current_lp) : null;

  return (
    <button
      onClick={onClick}
      className="flex w-full flex-col gap-2 rounded-xl border border-gray-800 bg-gray-900/30 p-4 text-left transition-colors hover:border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            post.type === "question" ? "bg-blue-500/15 text-blue-400" : "bg-purple-500/15 text-purple-400"
          }`}
        >
          {post.type === "question" ? "질문" : "토론"}
        </span>
        <span className="text-[10px] text-gray-600">{formatDate(post.created_at)}</span>
        {post.replyCount > 0 && <span className="ml-auto text-[10px] text-gray-500">💬 {post.replyCount}</span>}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-white">{post.title}</h3>

      {/* Content preview */}
      <p className="line-clamp-2 text-xs text-gray-400">{post.content}</p>

      {/* Author */}
      {post.author && (
        <div className="flex items-center gap-1.5 pt-1">
          <div className="h-5 w-5 overflow-hidden rounded-full bg-gray-800">
            {post.author.profile_image_url ? (
              <Image src={post.author.profile_image_url} alt="" width={20} height={20} className="object-cover" />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-[8px] font-bold"
                style={{ color: tierInfo?.color, backgroundColor: tierInfo?.bgColor }}
              >
                {post.author.name.charAt(0)}
              </div>
            )}
          </div>
          <span className={`text-[10px] font-semibold ${isMe ? "text-cyan-400" : "text-gray-500"}`}>
            {post.author.name}
          </span>
        </div>
      )}
    </button>
  );
}
