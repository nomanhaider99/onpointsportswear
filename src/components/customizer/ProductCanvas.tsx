"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type Konva from "konva";
import type { Box } from "konva/lib/shapes/Transformer";
import { Image as KonvaImage, Layer, Rect, Stage, Transformer } from "react-konva";
import type { PrintArea, ResolvedCustomizerConfig } from "@/data/customizer";
import { useImageElement } from "@/hooks/useImageElement";
import {
  type LogoTransform,
  centerOf,
  clamp,
  clampCenter,
  maxWidthForArea,
  minWidthForArea,
} from "@/lib/customizer-geometry";

/**
 * Konva stage for the live preview.
 *
 * Layering follows the brief: product base -> print area -> logo -> optional
 * product overlay. Every node is positioned in design space (the coordinate
 * system the print areas are authored in) and the Stage carries a single scale
 * factor, so nothing in the interaction maths has to know about screen pixels
 * and the product keeps its aspect ratio at any viewport size.
 *
 * The logo node is centre-origin (offset = half its size), which makes rotation
 * pivot about the middle and keeps the containment maths in one convention.
 */

const PRIMARY = "#00ac3b";

interface Props {
  config: ResolvedCustomizerConfig;
  printArea: PrintArea;
  logoUrl: string | null;
  aspectRatio: number;
  transform: LogoTransform | null;
  isSelected: boolean;
  zoom: number;
  productName: string;
  stageRef: React.RefObject<Konva.Stage | null>;
  onSelect: (selected: boolean) => void;
  onTransformChange: (next: LogoTransform) => void;
  onNudge: (deltaX: number, deltaY: number) => void;
}

export default function ProductCanvas({
  config,
  printArea,
  logoUrl,
  aspectRatio,
  transform,
  isSelected,
  zoom,
  productName,
  stageRef,
  onSelect,
  onTransformChange,
  onNudge,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  const base = useImageElement(config.baseImage);
  const overlay = useImageElement(config.overlayImage);
  const logo = useImageElement(logoUrl ?? undefined);

  // Track the available box so the stage can scale with the layout.
  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      setBox({ width: rect?.width ?? 0, height: rect?.height ?? 0 });
    });
    observer.observe(element);
    setBox({ width: element.clientWidth, height: element.clientHeight });

    return () => observer.disconnect();
  }, []);

  /*
   * Fit to the shorter axis rather than to width alone. On a short viewport the
   * pane is wide and flat, and a width-driven stage would push the proof bar
   * off the bottom - the readout has to stay visible while the logo moves.
   * Below lg the wrapper carries the design aspect ratio, so both axes agree
   * and this collapses back to the width-driven fit.
   */
  const widthFit = box.width > 0 ? box.width / config.baseWidth : 0;
  const heightFit = box.height > 0 ? box.height / config.baseHeight : Infinity;
  const scale = widthFit > 0 ? Math.min(widthFit, heightFit) * zoom : 0;
  const stageWidth = config.baseWidth * scale;
  const stageHeight = config.baseHeight * scale;

  // Attach the transformer whenever selection or the underlying node changes.
  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;

    const shouldAttach = isSelected && Boolean(logo.image) && Boolean(transform);
    transformer.nodes(shouldAttach && logoRef.current ? [logoRef.current] : []);
    transformer.getLayer()?.batchDraw();
  }, [isSelected, logo.image, transform]);

  const handleDragBound = useCallback(
    (position: Konva.Vector2d): Konva.Vector2d => {
      if (!transform || scale === 0) return position;
      // dragBoundFunc works in absolute pixels; the maths lives in design space.
      const pinned = clampCenter(
        position.x / scale,
        position.y / scale,
        transform.width,
        transform.height,
        transform.rotation,
        printArea,
      );
      return { x: pinned.x * scale, y: pinned.y * scale };
    },
    [transform, scale, printArea],
  );

  const handleDragEnd = useCallback(() => {
    const node = logoRef.current;
    if (!node || !transform) return;
    onTransformChange({
      ...transform,
      x: node.x() - transform.width / 2,
      y: node.y() - transform.height / 2,
    });
  }, [transform, onTransformChange]);

  /**
   * Resize/rotate. Konva reports the change as a scale on the node, so it is
   * baked back into width/height (keeping the aspect ratio), clamped to what
   * fits the print area, and written straight onto the node before the frame
   * paints - the React state update follows for the sliders.
   */
  const handleTransform = useCallback(() => {
    const node = logoRef.current;
    if (!node || !transform) return;

    const rotation = node.rotation();
    const maxWidth = maxWidthForArea(printArea, aspectRatio, rotation);
    const minWidth = Math.min(minWidthForArea(printArea), maxWidth);

    const width = clamp(node.width() * node.scaleX(), minWidth, maxWidth);
    const height = width / aspectRatio;

    node.scaleX(1);
    node.scaleY(1);
    node.width(width);
    node.height(height);
    node.offsetX(width / 2);
    node.offsetY(height / 2);

    const pinned = clampCenter(node.x(), node.y(), width, height, rotation, printArea);
    node.x(pinned.x);
    node.y(pinned.y);

    onTransformChange({
      x: pinned.x - width / 2,
      y: pinned.y - height / 2,
      width,
      height,
      rotation,
    });
  }, [transform, printArea, aspectRatio, onTransformChange]);

  /** Stops the resize handles before the logo can outgrow the print area. */
  const handleBoundBox = useCallback(
    (oldBox: Box, newBox: Box): Box => {
      if (scale === 0) return newBox;
      const width = Math.abs(newBox.width) / scale;
      const maxWidth = maxWidthForArea(printArea, aspectRatio, newBox.rotation ?? 0);
      const minWidth = Math.min(minWidthForArea(printArea), maxWidth);
      if (width > maxWidth || width < minWidth) return oldBox;
      return newBox;
    },
    [scale, printArea, aspectRatio],
  );

  const handleStageClick = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      // A press that misses the logo clears the selection.
      if (event.target.name() !== "logo") onSelect(false);
    },
    [onSelect],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!transform) return;
      const step = event.shiftKey ? 10 : 2;
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const move = moves[event.key];
      if (!move) return;
      event.preventDefault();
      onSelect(true);
      onNudge(move[0], move[1]);
    },
    [transform, onSelect, onNudge],
  );

  const center = transform ? centerOf(transform) : null;
  // Keep handles a comfortable touch size regardless of how the stage scales.
  const anchorSize = scale > 0 ? clamp(11 / scale, 7, 22) : 11;
  const hairline = scale > 0 ? 1 / scale : 1;

  return (
    <div
      ref={containerRef}
      className="op-scroll flex h-full w-full overflow-auto bg-stage"
      role="application"
      aria-label={productName + " customization preview. Use the arrow keys to move your logo."}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {scale > 0 && base.status === "loaded" ? (
        // `m-auto` centres the stage but still lets it overflow when zoomed in,
        // which flex centring alone would clip.
        <div className="m-auto">
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={handleStageClick}
          onTouchStart={handleStageClick}
          style={{ display: "block" }}
        >
          {/* Product base */}
          <Layer listening={false}>
            <KonvaImage
              image={base.image}
              width={config.baseWidth}
              height={config.baseHeight}
            />
          </Layer>

          {/* Print area guide + logo */}
          <Layer>
            {/*
              * The print-area guide is drawn as marching ants - a dark line
              * under a white dashed one - so it stays readable over a black
              * hoodie and a white tee alike, and it is deliberately not green:
              * green marks the thing you are acting on, and the area is a
              * passive boundary.
              */}
            <Rect
              x={printArea.x}
              y={printArea.y}
              width={printArea.width}
              height={printArea.height}
              stroke="#0b1020"
              strokeWidth={hairline * 2.5}
              opacity={0.3}
              listening={false}
            />
            <Rect
              x={printArea.x}
              y={printArea.y}
              width={printArea.width}
              height={printArea.height}
              stroke="#ffffff"
              strokeWidth={hairline}
              dash={[5 * hairline, 4 * hairline]}
              opacity={0.8}
              listening={false}
            />

            {logo.image && transform && center && (
              <KonvaImage
                ref={logoRef}
                name="logo"
                image={logo.image}
                x={center.x}
                y={center.y}
                width={transform.width}
                height={transform.height}
                offsetX={transform.width / 2}
                offsetY={transform.height / 2}
                rotation={transform.rotation}
                draggable
                dragBoundFunc={handleDragBound}
                onDragStart={() => onSelect(true)}
                onDragEnd={handleDragEnd}
                onTransform={handleTransform}
                onTransformEnd={handleTransform}
                onMouseDown={() => onSelect(true)}
                onTouchStart={() => onSelect(true)}
              />
            )}
          </Layer>

          {/* Optional product overlay (highlights/shadow) above the logo */}
          {overlay.status === "loaded" && (
            <Layer listening={false}>
              <KonvaImage
                image={overlay.image}
                width={config.baseWidth}
                height={config.baseHeight}
              />
            </Layer>
          )}

          {/* Handles live in their own layer so they are easy to hide on export */}
          <Layer>
            <Transformer
              ref={transformerRef}
              keepRatio
              rotateEnabled
              flipEnabled={false}
              enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
              rotationSnaps={[0, 90, 180, 270]}
              rotationSnapTolerance={4}
              anchorSize={anchorSize}
              anchorCornerRadius={anchorSize / 2}
              anchorFill="#ffffff"
              anchorStroke={PRIMARY}
              anchorStrokeWidth={hairline * 1.5}
              borderStroke={PRIMARY}
              borderStrokeWidth={hairline * 1.5}
              rotateAnchorOffset={26 * hairline}
              boundBoxFunc={handleBoundBox}
            />
          </Layer>
        </Stage>
        </div>
      ) : (
        <div
          style={{ aspectRatio: config.baseWidth + " / " + config.baseHeight }}
          className="m-auto flex w-full items-center justify-center font-inter text-[13px] text-black/40"
        >
          {base.status === "failed" ? "Preview image unavailable." : "Loading preview…"}
        </div>
      )}
    </div>
  );
}
