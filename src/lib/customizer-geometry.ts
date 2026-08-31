import type { PrintArea } from "@/data/customizer";

/**
 * Geometry for keeping a rotated logo fully inside its print area.
 *
 * All values are in design-space units (the coordinate system the print areas
 * are authored in), never screen pixels, so the numbers stay stable across
 * viewport sizes and survive serialization to the backend unchanged.
 *
 * `x`/`y` is the top-left of the UNROTATED box; `rotation` is in degrees about
 * the box centre. Every helper here works on that convention.
 */

export interface LogoTransform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

/** Smallest logo we allow, as a fraction of the print area's shorter side. */
const MIN_SIZE_RATIO = 0.12;
/** Fraction of the maximum fitting size a freshly uploaded logo starts at. */
const DEFAULT_FILL_RATIO = 0.7;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Axis-aligned bounding box of a `width` x `height` rect rotated by `rotation`.
 * Containing this box guarantees the rotated logo itself is contained.
 */
export function rotatedBounds(width: number, height: number, rotation: number) {
  const rad = toRadians(rotation);
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  return {
    width: width * cos + height * sin,
    height: width * sin + height * cos,
  };
}

/**
 * Largest width whose rotated bounding box still fits the area, for a logo of
 * the given aspect ratio. Solved directly from the rotatedBounds formula with
 * height substituted as `width / aspectRatio`.
 */
export function maxWidthForArea(area: PrintArea, aspectRatio: number, rotation: number): number {
  const rad = toRadians(rotation);
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));

  const widthLimit = area.width / (cos + sin / aspectRatio);
  const heightLimit = area.height / (sin + cos / aspectRatio);

  return Math.max(minWidthForArea(area), Math.min(widthLimit, heightLimit));
}

export function minWidthForArea(area: PrintArea): number {
  return Math.min(area.width, area.height) * MIN_SIZE_RATIO;
}

/** Centre point of a transform's unrotated box. */
export function centerOf(transform: LogoTransform) {
  return {
    x: transform.x + transform.width / 2,
    y: transform.y + transform.height / 2,
  };
}

/**
 * Pins a centre point so the rotated bounding box stays inside the area. If the
 * logo is somehow larger than the area, it is centred instead of jammed into a
 * corner - defensive only, sizes are capped by `maxWidthForArea`.
 */
export function clampCenter(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  rotation: number,
  area: PrintArea,
) {
  const bounds = rotatedBounds(width, height, rotation);
  const halfWidth = bounds.width / 2;
  const halfHeight = bounds.height / 2;

  const minX = area.x + halfWidth;
  const maxX = area.x + area.width - halfWidth;
  const minY = area.y + halfHeight;
  const maxY = area.y + area.height - halfHeight;

  return {
    x: minX > maxX ? area.x + area.width / 2 : clamp(centerX, minX, maxX),
    y: minY > maxY ? area.y + area.height / 2 : clamp(centerY, minY, maxY),
  };
}

/**
 * The single funnel every transform change passes through: locks the aspect
 * ratio, caps the size to what fits at the current rotation, then pins the
 * position. Whatever goes in, what comes out is a legal transform.
 */
export function constrainTransform(
  transform: LogoTransform,
  area: PrintArea,
  aspectRatio: number,
): LogoTransform {
  const rotation = normalizeRotation(transform.rotation);
  const maxWidth = maxWidthForArea(area, aspectRatio, rotation);
  const minWidth = Math.min(minWidthForArea(area), maxWidth);

  const width = clamp(transform.width, minWidth, maxWidth);
  const height = width / aspectRatio;

  const center = centerOf(transform);
  const pinned = clampCenter(center.x, center.y, width, height, rotation, area);

  return {
    x: pinned.x - width / 2,
    y: pinned.y - height / 2,
    width,
    height,
    rotation,
  };
}

export function normalizeRotation(rotation: number): number {
  const wrapped = rotation % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/** Centred placement at a sensible starting size for a newly uploaded logo. */
export function defaultTransformFor(area: PrintArea, aspectRatio: number): LogoTransform {
  const width = maxWidthForArea(area, aspectRatio, 0) * DEFAULT_FILL_RATIO;
  const height = width / aspectRatio;

  return {
    x: area.x + (area.width - width) / 2,
    y: area.y + (area.height - height) / 2,
    width,
    height,
    rotation: 0,
  };
}

export function centerHorizontally(transform: LogoTransform, area: PrintArea): LogoTransform {
  return { ...transform, x: area.x + (area.width - transform.width) / 2 };
}

export function centerVertically(transform: LogoTransform, area: PrintArea): LogoTransform {
  return { ...transform, y: area.y + (area.height - transform.height) / 2 };
}

/** Slider position (0-100) for the current width within the legal size range. */
export function sizePercent(
  transform: LogoTransform,
  area: PrintArea,
  aspectRatio: number,
): number {
  const maxWidth = maxWidthForArea(area, aspectRatio, transform.rotation);
  const minWidth = Math.min(minWidthForArea(area), maxWidth);
  const span = maxWidth - minWidth;
  if (span <= 0) return 100;
  return clamp(((transform.width - minWidth) / span) * 100, 0, 100);
}

/** Inverse of `sizePercent` - turns a slider position back into a width. */
export function widthFromPercent(
  percent: number,
  area: PrintArea,
  aspectRatio: number,
  rotation: number,
): number {
  const maxWidth = maxWidthForArea(area, aspectRatio, rotation);
  const minWidth = Math.min(minWidthForArea(area), maxWidth);
  return minWidth + ((maxWidth - minWidth) * clamp(percent, 0, 100)) / 100;
}
