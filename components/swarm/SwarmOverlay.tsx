"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SwarmEngine, type CursorShape } from "./engine";

const ARROW =
  "M4.6 3.9 C4.2 3.1 4.9 2.4 5.7 2.8 L20.6 9.4 C21.5 9.8 21.4 11.1 20.4 11.3 L13.9 12.9 C13.4 13 13 13.4 12.9 13.9 L11.3 20.4 C11.1 21.4 9.8 21.5 9.4 20.6 Z";

const IBEAM =
  "M8.5 4.5 H10.5 Q12 4.5 12 6 Q12 4.5 13.5 4.5 H15.5 M12 6 V18 M8.5 19.5 H10.5 Q12 19.5 12 18 Q12 19.5 13.5 19.5 H15.5";

const HOTSPOT: Record<CursorShape, [number, number]> = {
  arrow: [5, 3.5],
  cross: [12, 12],
  ibeam: [12, 12],
};

function CursorGlyph({ shape, color }: { shape: CursorShape; color: string }) {
  if (shape === "cross") {
    return (
      <g strokeLinecap="round">
        <path d="M12 3.5 V20.5 M3.5 12 H20.5" stroke="#fff" strokeWidth="3.6" />
        <path d="M12 3.5 V20.5 M3.5 12 H20.5" stroke={color} strokeWidth="1.5" />
      </g>
    );
  }
  if (shape === "ibeam") {
    return (
      <g fill="none" strokeLinecap="round">
        <path d={IBEAM} stroke="#fff" strokeWidth="3.6" />
        <path d={IBEAM} stroke={color} strokeWidth="1.5" />
      </g>
    );
  }
  return (
    <path
      d={ARROW}
      fill={color}
      stroke="#fff"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  );
}

export function SwarmOverlay() {
  const engineRef = useRef<SwarmEngine | null>(null);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      document.documentElement.dataset.swarmLive = "1";
      document.querySelectorAll<HTMLElement>("[data-swarm]").forEach((el) => {
        el.dataset.built = "1";
      });
      return;
    }

    const engine = new SwarmEngine();
    engineRef.current = engine;
    let alive = true;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      if (!alive) return;
      const dt = (now - last) / 1000;
      last = now;
      engine.step(dt);
      setFrame((value) => (value + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      engine.destroy();
      if (engineRef.current === engine) engineRef.current = null;
    };
  }, []);

  const engine = engineRef.current;
  if (!engine || frame === 0 || typeof document === "undefined") return null;

  const boxes = engine.tasks.filter(
    (task) => task.showSelection || task.showProxy
  );

  return createPortal(
    <div aria-hidden="true">
      <div className="swarm-layer" style={{ height: engine.pageHeight }}>
        <svg
          className="swarm-svg"
          width={Math.max(engine.pageWidth, 1)}
          height={Math.max(engine.pageHeight, 1)}>
          {boxes.map((task) => {
            const box = task.draw ?? {
              x: task.x,
              y: task.y,
              w: task.w,
              h: task.h,
            };
            if (box.w < 1 || box.h < 1) return null;
            return (
              <g key={task.id}>
                {task.showProxy && (
                  <rect
                    x={box.x}
                    y={box.y}
                    width={box.w}
                    height={box.h}
                    rx={task.radius}
                    fill="#ffffff"
                    stroke="#D7DADE"
                    strokeWidth="1.5"
                  />
                )}
                {task.showSelection && (
                  <rect
                    x={box.x}
                    y={box.y}
                    width={box.w}
                    height={box.h}
                    fill="none"
                    stroke="#0D99FF"
                    strokeWidth="1"
                  />
                )}
                {task.showSelection &&
                  task.handles &&
                  [
                    [box.x, box.y],
                    [box.x + box.w, box.y],
                    [box.x, box.y + box.h],
                    [box.x + box.w, box.y + box.h],
                  ].map(([x, y]) => (
                    <rect
                      key={`${x}-${y}`}
                      x={x - 3.5}
                      y={y - 3.5}
                      width="7"
                      height="7"
                      fill="#fff"
                      stroke="#0D99FF"
                      strokeWidth="1"
                    />
                  ))}
              </g>
            );
          })}
        </svg>
        {boxes.map((task) => {
          if (!task.showSelection || !task.handles) return null;
          const box = task.draw ?? task;
          if (box.w < 16 || box.h < 12) return null;
          return (
            <div
              key={`badge-${task.id}`}
              className="swarm-badge"
              style={{
                left: box.x + box.w / 2,
                top: box.y + box.h + 8,
              }}>
              {Math.round(box.w)} × {Math.round(box.h)}
            </div>
          );
        })}
        {engine.tasks.map((task) =>
          task.caret ? (
            <div
              key={`caret-${task.id}`}
              className="swarm-caret"
              style={{
                left: task.caret.x,
                top: task.caret.y,
                height: task.caret.h,
                background: task.caret.color,
              }}
            />
          ) : null
        )}
        {engine.cursors.map((cursor) => {
          const [ox, oy] = HOTSPOT[cursor.shape];
          const scale = 1 - cursor.press * 0.12;
          return (
            <div
              key={cursor.id}
              className="swarm-cursor"
              style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                style={{
                  transform: `translate(${-ox}px, ${-oy}px) rotate(${cursor.angle}deg) scale(${scale})`,
                  transformOrigin: `${ox}px ${oy}px`,
                }}>
                <CursorGlyph shape={cursor.shape} color={cursor.color} />
              </svg>
            </div>
          );
        })}
      </div>
    </div>,
    document.body
  );
}
