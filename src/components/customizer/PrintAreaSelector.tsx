"use client";

import type { PrintArea } from "@/data/customizer";

/**
 * Logo placement picker. Rendered only when a product actually has more than
 * one area, so single-area products stay uncluttered while the architecture
 * already supports front / back / sleeve placements.
 *
 * The active chip is one of the three places green is spent in this dialog.
 * There is deliberately no "already placed" marker: uploading artwork seeds a
 * placement on every area at once, so such a marker would tick all of them and
 * say nothing.
 */

export function PrintAreaSelector({
  printAreas,
  activeId,
  onSelect,
}: {
  printAreas: PrintArea[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  if (printAreas.length < 2) return null;

  return (
    <fieldset>
      <legend className="sr-only">Logo placement</legend>
      <div className="flex flex-wrap gap-2">
        {printAreas.map((area) => {
          const isActive = area.id === activeId;
          return (
            <button
              key={area.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(area.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 font-inter text-[13px] transition-colors ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-hairline bg-raised text-white/80 hover:border-white/25 hover:bg-white/[0.09] hover:text-white"
              }`}
            >
              {area.name}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
