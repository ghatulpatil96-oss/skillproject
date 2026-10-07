"use client";

import { isValidElement, useState, type ReactNode } from "react";

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return extractText(props.children);
  }
  return "";
}

export default function CodeBlock({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const code = extractText(children).replace(/\n$/, "");

  // unwrap <code> child: className carries the language, e.g. language-js
  let lang = "code";
  if (isValidElement(children)) {
    const props = children.props as { className?: string };
    if (props.className?.startsWith("language-")) lang = props.className.slice(9);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="my-5 overflow-hidden rounded-lg border border-line bg-charcoal">
      <div className="flex items-center justify-between border-b border-canvas/10 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-canvas/50">{lang}</span>
        <button
          onClick={copy}
          className="rounded-md border border-canvas/20 px-2 py-1 font-mono text-[11px] text-canvas/70 transition hover:border-canvas/50 hover:text-canvas"
        >
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="nice-scroll overflow-x-auto p-4 text-[13px] leading-relaxed text-canvas/90">
        <code className="font-mono">{children}</code>
      </pre>
    </div>
  );
}
