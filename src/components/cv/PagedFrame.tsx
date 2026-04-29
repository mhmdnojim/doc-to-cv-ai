import { useEffect, useRef, useState, ReactNode } from "react";

/**
 * Wraps any CV template and renders visual page breaks every 297mm (A4 height).
 * Templates use min-h-[297mm] for page 1; if their content overflows, this
 * frame draws horizontal dividers + "Página 2/3..." labels at each A4 boundary.
 *
 * Pure visual aid - the export-to-PDF flow uses real CSS @page rules.
 */
export const PagedFrame = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    if (!ref.current) return;
    const PAGE_PX = 297 * (96 / 25.4); // 297mm -> px at 96dpi ≈ 1122.5
    const measure = () => {
      const h = ref.current?.scrollHeight ?? 0;
      setPages(Math.max(1, Math.ceil(h / PAGE_PX)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [children]);

  const PAGE_MM = 297;

  return (
    <div className="relative" ref={ref}>
      {children}
      {pages > 1 && Array.from({ length: pages - 1 }).map((_, i) => (
        <div
          key={i}
          className="pointer-events-none absolute left-0 right-0 z-50"
          style={{ top: `${PAGE_MM * (i + 1)}mm` }}
        >
          <div className="border-t-2 border-dashed border-slate-300" />
          <div className="absolute right-3 -top-3 bg-white text-[10px] text-slate-500 px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
            Página {i + 2}
          </div>
        </div>
      ))}
    </div>
  );
};
