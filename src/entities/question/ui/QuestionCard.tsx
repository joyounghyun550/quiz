"use client";

import { cn } from "@/shared/utils/cn.util";

import type { QuizQuestion } from "@/entities/question/model/types";
import CodeBlock from "@/entities/question/ui/CodeBlock";

type QuestionCardProps = {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  className?: string;
};

const FORMAT_LABELS: Record<string, string> = {
  multiple_choice: "객관식",
  code_output: "코드 출력 예측",
  true_false: "참/거짓",
};

const CATEGORY_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  react: "React",
  nextjs: "Next.js",
  css: "CSS",
  web_fundamentals: "Web 기초",
};

const QuestionCard = ({ question, questionNumber, totalQuestions, className }: QuestionCardProps) => {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-400">
            {CATEGORY_LABELS[question.category] ?? question.category}
          </span>
          <span className="rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-500">
            {FORMAT_LABELS[question.format] ?? question.format}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {questionNumber} / {totalQuestions}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold leading-relaxed text-white">{question.title}</h2>

      {/* Body */}
      {question.body && <p className="text-sm leading-relaxed text-gray-400">{question.body}</p>}

      {/* Code Snippet */}
      {question.code_snippet && <CodeBlock code={question.code_snippet} language={question.code_language} />}
    </div>
  );
};

export default QuestionCard;
