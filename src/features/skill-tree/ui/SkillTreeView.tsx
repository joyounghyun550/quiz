"use client";

import { SKILL_CATEGORIES } from "@/shared/constants/skill-tree.constant";

import type { SkillNodeWithProgress } from "@/entities/skill/model/types";

import SkillNode from "./SkillNode";

type SkillTreeViewProps = {
  nodes: SkillNodeWithProgress[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  onNodeClick: (node: SkillNodeWithProgress) => void;
};

const SkillTreeView = ({ nodes, activeCategory, onCategoryChange, onNodeClick }: SkillTreeViewProps) => {
  const filteredNodes = nodes.filter((n) => n.category === activeCategory);
  const unlockedCount = filteredNodes.filter((n) => n.status === "unlocked").length;
  const totalCount = filteredNodes.length;
  const activeCatInfo = SKILL_CATEGORIES.find((c) => c.key === activeCategory);

  return (
    <div className="flex flex-col gap-4">
      {/* 카테고리 탭 */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
        {SKILL_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => onCategoryChange(cat.key)}
            className={`flex flex-shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
              activeCategory === cat.key
                ? "border-opacity-50 bg-opacity-10"
                : "border-gray-800 bg-gray-900/30 text-gray-400 hover:border-gray-700 hover:text-gray-300"
            }`}
            style={
              activeCategory === cat.key
                ? { borderColor: `${cat.color}80`, backgroundColor: `${cat.color}18`, color: cat.color }
                : {}
            }
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* 카테고리 진행 현황 */}
      <div className="flex items-center justify-between rounded-2xl border border-gray-800 bg-gray-900/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{activeCatInfo?.icon}</span>
          <span className="text-sm font-semibold text-white">{activeCatInfo?.label} 스킬</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: activeCatInfo?.color }}>
            {unlockedCount}/{totalCount}
          </span>
          <span className="text-xs text-gray-500">해금</span>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%`,
            backgroundColor: activeCatInfo?.color ?? "#3B82F6",
          }}
        />
      </div>

      {/* 노드 그리드 */}
      {filteredNodes.length > 0 ? (
        <div className="flex flex-col gap-3">
          {/* 부모가 없는 루트 노드들 먼저, 그 후 자식 노드들 */}
          {(() => {
            const rootNodes = filteredNodes.filter((n) => !n.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
            const childNodesByParent = new Map<string, SkillNodeWithProgress[]>();

            filteredNodes
              .filter((n): n is SkillNodeWithProgress & { parentId: string } => n.parentId !== null)
              .forEach((n) => {
                const children = childNodesByParent.get(n.parentId) ?? [];
                children.push(n);
                childNodesByParent.set(n.parentId, children);
              });

            // 순서대로 렌더링: 루트 -> 자식
            const orderedGroups: { parent: SkillNodeWithProgress | null; nodes: SkillNodeWithProgress[] }[] = [];

            rootNodes.forEach((root) => {
              const children = (childNodesByParent.get(root.id) ?? []).sort((a, b) => a.sortOrder - b.sortOrder);
              orderedGroups.push({ parent: null, nodes: [root] });
              if (children.length > 0) {
                orderedGroups.push({ parent: root, nodes: children });
              }
            });

            // 부모가 삭제되었거나 없는 자식 노드
            const orphans = filteredNodes.filter((n) => n.parentId && !filteredNodes.find((p) => p.id === n.parentId));
            if (orphans.length > 0) {
              orderedGroups.push({ parent: null, nodes: orphans });
            }

            return orderedGroups.map((group, gi) => (
              <div key={gi} className="flex flex-col gap-2">
                {group.parent && (
                  <div className="flex items-center gap-2 px-1">
                    <div className="h-4 w-px bg-gray-700" />
                    <span className="text-[10px] text-gray-600">↳ {group.parent.name} 하위 스킬</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {group.nodes.map((node) => (
                    <SkillNode key={node.id} node={node} onClick={() => onNodeClick(node)} />
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
          <span className="text-4xl">🌳</span>
          <p className="text-sm">이 카테고리에 스킬 노드가 없습니다</p>
        </div>
      )}
    </div>
  );
};

export default SkillTreeView;
