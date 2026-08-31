"use client";

import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCcw,
} from "lucide-react";
import type { PrintArea } from "@/data/customizer";
import type { LogoTransform } from "@/lib/customizer-geometry";

/**
 * Size / rotation / position controls. Every control is a real slider or button
 * so it is keyboard operable, and each one reports its value as text as well as
 * position - state is never communicated by colour alone.
 */

const NUDGE_STEP = 2;

function Slider({
  id,
  label,
  value,
  displayValue,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-white">
          {label}
        </label>
        <span className="text-sm tabular-nums text-white/70">{displayValue}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[var(--color-primary)]"
      />
    </div>
  );
}

function NudgeButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-primary-line)] text-white transition-colors hover:bg-primary hover:text-primary-foreground ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function LogoControls({
  transform,
  printArea,
  sizePercent,
  onSizeChange,
  onRotationChange,
  onNudge,
  onCenterX,
  onCenterY,
}: {
  transform: LogoTransform;
  printArea: PrintArea;
  sizePercent: number;
  onSizeChange: (percent: number) => void;
  onRotationChange: (degrees: number) => void;
  onNudge: (deltaX: number, deltaY: number) => void;
  onCenterX: () => void;
  onCenterY: () => void;
}) {
  // Position is reported relative to the print area, which is what a customer
  // (and later the print shop) actually cares about.
  const offsetX = Math.round(transform.x - printArea.x);
  const offsetY = Math.round(transform.y - printArea.y);

  return (
    <div className="space-y-5">
      <Slider
        id="logo-size"
        label="Logo size"
        value={Math.round(sizePercent)}
        displayValue={`${Math.round(sizePercent)}%`}
        min={0}
        max={100}
        step={1}
        onChange={onSizeChange}
      />

      <div>
        <Slider
          id="logo-rotation"
          label="Rotation"
          value={Math.round(transform.rotation)}
          displayValue={`${Math.round(transform.rotation)}°`}
          min={0}
          max={359}
          step={1}
          onChange={onRotationChange}
        />
        <button
          type="button"
          onClick={() => onRotationChange(0)}
          className="mt-1 inline-flex min-h-9 items-center gap-1.5 py-2 text-sm text-white/70 underline transition-colors hover:text-primary"
        >
          <RotateCcw size={13} aria-hidden="true" />
          Straighten
        </button>
      </div>

      <div>
        <p className="text-sm font-medium text-white">Position</p>
        <p className="mt-1 text-sm tabular-nums text-white/70">
          <span className="sr-only">Offset from the top left of the print area: </span>
          X {offsetX} · Y {offsetY}
        </p>

        <div className="mt-3 flex flex-wrap items-start gap-4">
          <div className="grid grid-cols-3 grid-rows-3 gap-1.5">
            <NudgeButton
              label="Move logo up"
              onClick={() => onNudge(0, -NUDGE_STEP)}
              className="col-start-2 row-start-1"
            >
              <ArrowUp size={16} aria-hidden="true" />
            </NudgeButton>
            <NudgeButton
              label="Move logo left"
              onClick={() => onNudge(-NUDGE_STEP, 0)}
              className="col-start-1 row-start-2"
            >
              <ArrowLeft size={16} aria-hidden="true" />
            </NudgeButton>
            <NudgeButton
              label="Move logo right"
              onClick={() => onNudge(NUDGE_STEP, 0)}
              className="col-start-3 row-start-2"
            >
              <ArrowRight size={16} aria-hidden="true" />
            </NudgeButton>
            <NudgeButton
              label="Move logo down"
              onClick={() => onNudge(0, NUDGE_STEP)}
              className="col-start-2 row-start-3"
            >
              <ArrowDown size={16} aria-hidden="true" />
            </NudgeButton>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <button
              type="button"
              onClick={onCenterX}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-primary-line)] px-3 py-2.5 text-sm text-white transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <AlignCenterVertical size={15} aria-hidden="true" />
              Center horizontally
            </button>
            <button
              type="button"
              onClick={onCenterY}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-primary-line)] px-3 py-2.5 text-sm text-white transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <AlignCenterHorizontal size={15} aria-hidden="true" />
              Center vertically
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
