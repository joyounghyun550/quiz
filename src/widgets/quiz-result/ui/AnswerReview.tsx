"use client";

import { useState } from "react";

import { cn } from "@/shared/utils/cn.util";

import CodeBlock from "@/entities/question/ui/CodeBlock";

type AnswerReviewItem = {
  questionId: string;
  title: string;
  category: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  options: { id: string; text: string }[] | null;
  explanation: string;
  explanationCode?: string | null;
  codeSnippet?: string | null;
  codeLanguage?: string;
  lpChange: number;
};

type AnswerReviewProps = {
  items: AnswerReviewItem[];
};

const CATEGORY_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  react: "React",
  nextjs: "Next.js",
  css: "CSS",
  web_fundamentals: "Web 기초",
};

const AnswerReview = ({ items }: AnswerReviewProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-semibold text-white">문제별 리뷰</h3>
      {items.map((item, index) => {
        const userOption = item.options?.find((o) => o.id === item.userAnswer);
        const correctOption = item.options?.find((o) => o.id === item.correctAnswer);

        return (
          <div key={item.questionId} className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800/30">
            <button
              type="button"
              onClick={() => handleToggle(index)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                  item.isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                )}
              >
                {item.isCorrect ? "O" : "X"}
              </span>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm text-white">{item.title}</p>
                <p className="text-xs text-gray-500">{CATEGORY_LABELS[item.category] ?? item.category}</p>
              </div>
              <span
                className={cn(
                  "text-xs font-semibold",
                  item.lpChange >= 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                {item.lpChange >= 0 ? "+" : ""}
                {item.lpChange}
              </span>
            </button>

            {expandedIndex === index && (
              <div className="border-t border-gray-700 p-4">
                {item.codeSnippet && (
                  <CodeBlock code={item.codeSnippet} language={item.codeLanguage} className="mb-3" />
                )}

                <div className="mb-3 flex flex-col gap-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 text-gray-500">내 답:</span>
                    <span className={item.isCorrect ? "text-emerald-400" : "text-red-400"}>
                      {userOption?.text ?? item.userAnswer}
                    </span>
                  </div>
                  {!item.isCorrect && (
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 text-gray-500">정답:</span>
                      <span className="text-emerald-400">{correctOption?.text ?? item.correctAnswer}</span>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-gray-900/50 p-3">
                  <p className="mb-1 text-xs font-semibold text-gray-400">해설</p>
                  <p className="text-sm leading-relaxed text-gray-300">{item.explanation}</p>
                  {item.explanationCode && (
                    <pre className="mt-2 overflow-x-auto rounded bg-gray-900 p-2">
                      <code className="text-xs text-gray-300">{item.explanationCode}</code>
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AnswerReview;
