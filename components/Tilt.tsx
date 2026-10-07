"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** 3D hover tilt (perspective rotateX/rotateY) for cards. Skips under reduced motion. */
export default function Tilt({
  children,
  className = "",
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);
  const [t, setT] = useState("");

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  function onMove(e: React.MouseEvent) {
    if (reduced.current || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setT(`perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`);
  }

  function onLeave() {
    setT("");
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
      style={{ transform: t }}
    >
      {children}
    </div>
  );
}
