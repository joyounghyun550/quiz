"use client";

import { useCallback, useEffect, useState } from "react";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { getTierInfo } from "@/entities/user/lib/tier.util";

type Author = {
  id: string;
  name: string;
  profile_image_url: string | null;
  current_lp: number;
  current_tier: string;
};

type PostDetail = {
  id: string;
  user_id: string;
  type: "question" | "discussion" | "comment";
  title: string | null;
  content: string;
  created_at: string;
  author: Author | null;
};

type Reply = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author: Author | null;
};

export default function CommunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPost = useCallback(async () => {
    try {
      const res = await fetch(`/api/community/${postId}`);
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (res.status === 404) {
        router.replace("/community");
        return;
      }
      const data = await res.json();
      setPost(data.post);
      setReplies(data.replies ?? []);
      setCurrentUserId(data.currentUserId);
    } catch {
      router.replace("/community");
    } finally {
      setIsLoading(false);
    }
  }, [postId, router]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: post?.type ?? "discussion",
          content: replyContent,
          parentId: postId,
        }),
      });
      if (res.ok) {
        setReplyContent("");
        loadPost();
      }
    } catch {
      // error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/community/${postId}`, { method: "DELETE" });
    if (res.ok) {
      router.replace("/community");
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 pb-24 pt-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        뒤로가기
      </button>

      {/* Post */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-5">
        <div className="mb-3 flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              post.type === "question" ? "bg-blue-500/15 text-blue-400" : "bg-purple-500/15 text-purple-400"
            }`}
          >
            {post.type === "question" ? "질문" : "토론"}
          </span>
          <span className="text-[10px] text-gray-600">{formatDate(post.created_at)}</span>
          {post.user_id === currentUserId && (
            <button onClick={handleDelete} className="ml-auto text-[10px] text-red-500 hover:text-red-400">
              삭제
            </button>
          )}
        </div>

        <h1 className="mb-3 text-lg font-bold text-white">{post.title}</h1>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">{post.content}</p>

        {/* Author */}
        {post.author && <AuthorBadge author={post.author} isMe={post.user_id === currentUserId} />}
      </div>

      {/* Replies */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-white">답글</h2>
        <span className="text-xs text-gray-500">{replies.length}개</span>
      </div>

      {replies.length === 0 ? (
        <p className="py-8 text-center text-xs text-gray-600">아직 답글이 없습니다. 첫 번째로 답글을 달아보세요!</p>
      ) : (
        <div className="flex flex-col gap-2">
          {replies.map((reply) => (
            <div key={reply.id} className="rounded-xl border border-gray-800 bg-gray-900/20 p-4">
              <p className="whitespace-pre-wrap text-sm text-gray-300">{reply.content}</p>
              <div className="mt-2 flex items-center justify-between">
                {reply.author && <AuthorBadge author={reply.author} isMe={reply.user_id === currentUserId} small />}
                <span className="text-[10px] text-gray-600">{formatDate(reply.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="답글을 입력하세요..."
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && handleSubmitReply()}
          className="flex-1 rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-500"
        />
        <button
          onClick={handleSubmitReply}
          disabled={isSubmitting || !replyContent.trim()}
          className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-600 disabled:opacity-40"
        >
          {isSubmitting ? "..." : "등록"}
        </button>
      </div>
    </div>
  );
}

function AuthorBadge({ author, isMe, small = false }: { author: Author; isMe: boolean; small?: boolean }) {
  const tierInfo = getTierInfo(author.current_lp);

  return (
    <div className={`flex items-center gap-1.5 ${small ? "" : "mt-4 border-t border-gray-800 pt-3"}`}>
      <div className={`overflow-hidden rounded-full bg-gray-800 ${small ? "h-5 w-5" : "h-6 w-6"}`}>
        {author.profile_image_url ? (
          <Image
            src={author.profile_image_url}
            alt=""
            width={small ? 20 : 24}
            height={small ? 20 : 24}
            className="object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-bold"
            style={{ color: tierInfo.color, backgroundColor: tierInfo.bgColor, fontSize: small ? 8 : 10 }}
          >
            {author.name.charAt(0)}
          </div>
        )}
      </div>
      <span
        className={`font-semibold ${isMe ? "text-cyan-400" : "text-gray-400"} ${small ? "text-[10px]" : "text-xs"}`}
      >
        {author.name}
      </span>
      <span className="text-[8px] font-bold" style={{ color: tierInfo.color }}>
        {tierInfo.label}
      </span>
    </div>
  );
}
