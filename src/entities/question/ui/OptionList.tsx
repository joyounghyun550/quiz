"use client";

import { cn } from "@/shared/utils/cn.util";

import type { QuestionOption } from "@/entities/question/model/types";

type OptionListProps = {
  options: QuestionOption[];
  selectedId: string | null;
  correctId?: string | null;
  showResult?: boolean;
  disabled?: boolean;
  onSelect: (optionId: string) => void;
};

const OptionList = ({
  options,
  selectedId,
  correctId,
  showResult = false,
  disabled = false,
  onSelect,
}: OptionListProps) => {
  const isCorrectOption = (option: QuestionOption) => {
    if (correctId != null) return option.id === correctId;
    return option.isCorrect === true;
  };

  const getOptionStyle = (option: QuestionOption) => {
    if (!showResult) {
      if (selectedId === option.id) {
        return "border-cyan-500 bg-cyan-500/10 text-cyan-300";
      }
      return "border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-500";
    }

    if (isCorrectOption(option)) {
      return "border-emerald-500 bg-emerald-500/10 text-emerald-300";
    }
    if (selectedId === option.id && !isCorrectOption(option)) {
      return "border-red-500 bg-red-500/10 text-red-300";
    }
    return "border-gray-700/50 bg-gray-800/30 text-gray-500";
  };

  const getPrefix = (index: number) => {
    return String.fromCharCode(65 + index);
  };

  return (
    <div className="flex flex-col gap-3">
      {options.map((option, index) => (
        <button
          key={option.id}
          type="button"
          disabled={disabled || showResult}
          onClick={() => onSelect(option.id)}
          className={cn(
            "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
            getOptionStyle(option),
            !disabled && !showResult && "active:scale-[0.98]"
          )}
        >
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
              selectedId === option.id ? "bg-cyan-500/20" : "bg-gray-700/50"
            )}
          >
            {getPrefix(index)}
          </span>
          <span className="pt-0.5 text-sm leading-relaxed">{option.text}</span>
        </button>
      ))}
    </div>
  );
};

export default OptionList;
