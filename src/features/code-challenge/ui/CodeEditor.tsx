"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-xl bg-gray-900">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
    </div>
  ),
});

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
};

const CodeEditor = ({
  value,
  onChange,
  language = "javascript",
  readOnly = false,
  height = "300px",
}: CodeEditorProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-800">
      <MonacoEditor
        height={height}
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(val) => onChange(val ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          wordWrap: "on",
          readOnly,
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          renderLineHighlight: "line",
          tabSize: 2,
          automaticLayout: true,
          padding: { top: 12 },
        }}
      />
    </div>
  );
};

export default CodeEditor;
