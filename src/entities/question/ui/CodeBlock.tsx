"use client";

import { cn } from "@/shared/utils/cn.util";

type CodeBlockProps = {
  code: string;
  language?: string;
  className?: string;
};

const CodeBlock = ({ code, language = "typescript", className }: CodeBlockProps) => {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-gray-700 bg-gray-900", className)}>
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
        <span className="text-xs text-gray-500">{language}</span>
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="text-sm leading-relaxed text-gray-300">{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
