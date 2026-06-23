"use client";
import { useEffect, useRef, useState } from "react";

export default function SpringNum({
  target,
  prefix = "",
  suffix = "",
  dec = 2,
  delay = 0,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  dec?: number;
  delay?: number;
}) {
  const [v, setV] = useState(0);
  const frame = useRef(0);
  useEffect(() => {
    const tid = setTimeout(() => {
      const dur = 1100;
      const t0 = performance.now();
      function tick(now: number) {
        const p = Math.min((now - t0) / dur, 1);
        const e = 1 - Math.pow(2, -10 * p);
        setV(target * e);
        if (p < 1) frame.current = requestAnimationFrame(tick);
      }
      frame.current = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(tid);
      cancelAnimationFrame(frame.current);
    };
  }, [target, delay]);
  return (
    <span>
      {prefix}
      {dec > 0 ? v.toFixed(dec) : Math.round(v).toLocaleString()}
      {suffix}
    </span>
  );
}
