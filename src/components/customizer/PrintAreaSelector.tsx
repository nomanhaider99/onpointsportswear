"use client";

import { Check } from "lucide-react";
import type { PrintArea } from "@/data/customizer";

/**
 * Logo placement picker. Rendered only when a product actually has more than
 * one area, so single-area products stay uncluttered while the architecture
 * already supports front / back / sleeve placements.
 */

export function PrintAreaSelector({
  printAreas,
  activeId,
  placedIds,
  onSelect,
}: {
  printAreas: PrintArea[];
  activeId: string;
  placedIds: string[];
  onSelect: (id: string) => void;
}) {
  if (printAreas.length < 2) return null;

  return (
    <fieldset>
      <legend className="text-base font-semibold uppercase tracking-wide text-white">
        Logo Placement
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {printAreas.map((area) => {
          const isActive = area.id === activeId;
          const isPlaced = placedIds.includes(area.id);
          return (
            <button
              key={area.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(area.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm transition-colors ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-[var(--color-primary-line)] text-white hover:bg-primary-soft"
              }`}
            >
              {isPlaced && <Check size={14} aria-hidden="true" />}
              {area.name}
              {isPlaced && <span className="sr-only"> (logo placed)</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
