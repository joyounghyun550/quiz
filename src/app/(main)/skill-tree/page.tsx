"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import type { SkillNodeWithProgress } from "@/entities/skill/model/types";

import SkillNodeDetail from "@/features/skill-tree/ui/SkillNodeDetail";
import SkillTreeView from "@/features/skill-tree/ui/SkillTreeView";

export default function SkillTreePage() {
  const router = useRouter();
  const [nodes, setNodes] = useState<SkillNodeWithProgress[]>([]);
  const [activeCategory, setActiveCategory] = useState("javascript");
  const [selectedNode, setSelectedNode] = useState<SkillNodeWithProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/skill-tree");
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        setNodes(data.nodes ?? []);
      } catch {
        // 에러
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [router]);

  const totalNodes = nodes.length;
  const totalUnlocked = nodes.filter((n) => n.status === "unlocked").length;
  const overallPercent = totalNodes > 0 ? Math.round((totalUnlocked / totalNodes) * 100) : 0;

  // 선택된 노드의 부모 이름 찾기
  const parentName = selectedNode?.parentId ? (nodes.find((n) => n.id === selectedNode.parentId)?.name ?? null) : null;

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 pb-24 pt-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white">스킬 트리</h1>
          <p className="text-xs text-gray-500">카테고리별 스킬을 해금하세요</p>
        </div>
        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-400">
          전체 해금: {totalUnlocked}/{totalNodes} ({overallPercent}%)
        </span>
      </div>

      {/* 전체 진행 바 */}
      <div className="h-2 overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
          style={{ width: `${overallPercent}%` }}
        />
      </div>

      {/* 스킬 트리 뷰 */}
      <SkillTreeView
        nodes={nodes}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onNodeClick={setSelectedNode}
      />

      {/* 노드 디테일 모달 */}
      {selectedNode && (
        <SkillNodeDetail node={selectedNode} parentName={parentName} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
}
