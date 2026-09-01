"use client";

import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Move,
} from "lucide-react";
import type { PrintArea } from "@/data/customizer";
import type { LogoTransform } from "@/lib/customizer-geometry";

/**
 * Size / rotation / position controls. Every control is a real slider or button
 * so it is keyboard operable, and each one reports its value as text as well as
 * position - state is never communicated by colour alone.
 *
 * The sliders are native range inputs painted through .op-range, with the
 * filled portion driven by --op-fill so the track reads as a value rather than
 * a groove. The nudge pad keeps its cross layout: it mirrors the arrow keys
 * that already move the logo on the canvas.
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
  const fill = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-inter text-[13px] text-white/70">
          {label}
        </label>
        <span className="font-inter text-[13px] tabular-nums text-white">{displayValue}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="op-range mt-2"
        style={{ "--op-fill": `${fill}%` } as React.CSSProperties}
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
      className={`flex h-9 w-9 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/[0.1] hover:text-white ${
        className ?? ""
      }`}
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
  const rotation = Math.round(transform.rotation);

  const centerButton =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-hairline bg-raised px-3 py-2 font-inter text-[13px] text-white/80 transition-colors hover:border-white/25 hover:bg-white/[0.09] hover:text-white";

  return (
    <div className="space-y-5">
      <Slider
        id="logo-size"
        label="Size"
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
          value={rotation}
          displayValue={`${rotation}°`}
          min={0}
          max={359}
          step={1}
          onChange={onRotationChange}
        />
        {rotation !== 0 && (
          <button
            type="button"
            onClick={() => onRotationChange(0)}
            className="mt-1.5 inline-flex min-h-8 items-center font-inter text-[12px] text-white/50 transition-colors hover:text-primary"
          >
            Straighten to 0°
          </button>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-inter text-[13px] text-white/70">Position</p>
          <p className="font-inter text-[13px] tabular-nums text-white">
            <span className="sr-only">Offset from the top left of the print area: </span>
            {offsetX}, {offsetY}
          </p>
        </div>

        <div className="mt-2.5 flex flex-wrap items-stretch gap-2">
          <div className="grid grid-cols-3 grid-rows-3 rounded-lg border border-hairline bg-raised p-1">
            <NudgeButton
              label="Move logo up"
              onClick={() => onNudge(0, -NUDGE_STEP)}
              className="col-start-2 row-start-1"
            >
              <ArrowUp size={15} aria-hidden="true" />
            </NudgeButton>
            <NudgeButton
              label="Move logo left"
              onClick={() => onNudge(-NUDGE_STEP, 0)}
              className="col-start-1 row-start-2"
            >
              <ArrowLeft size={15} aria-hidden="true" />
            </NudgeButton>
            <span
              aria-hidden="true"
              className="col-start-2 row-start-2 flex items-center justify-center text-white/20"
            >
              <Move size={14} />
            </span>
            <NudgeButton
              label="Move logo right"
              onClick={() => onNudge(NUDGE_STEP, 0)}
              className="col-start-3 row-start-2"
            >
              <ArrowRight size={15} aria-hidden="true" />
            </NudgeButton>
            <NudgeButton
              label="Move logo down"
              onClick={() => onNudge(0, NUDGE_STEP)}
              className="col-start-2 row-start-3"
            >
              <ArrowDown size={15} aria-hidden="true" />
            </NudgeButton>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-2">
            <button type="button" onClick={onCenterX} className={centerButton}>
              <AlignCenterVertical size={14} aria-hidden="true" />
              Center horizontally
            </button>
            <button type="button" onClick={onCenterY} className={centerButton}>
              <AlignCenterHorizontal size={14} aria-hidden="true" />
              Center vertically
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
