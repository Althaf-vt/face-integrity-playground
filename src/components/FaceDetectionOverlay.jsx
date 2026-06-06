import { useEffect, useRef } from 'react';
import { mapBoundingBoxToDisplay } from '../utils/objectCoverMetrics';

export default function FaceDetectionOverlay({ detections, videoWidth, videoHeight }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const draw = () => {
      const { width: containerWidth, height: containerHeight } =
        container.getBoundingClientRect();

      if (!containerWidth || !containerHeight) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(containerWidth * dpr);
      canvas.height = Math.round(containerHeight * dpr);
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, containerWidth, containerHeight);

      if (!detections?.length || !videoWidth || !videoHeight) return;

      detections.forEach((detection) => {
        const box = detection.boundingBox;
        if (!box) return;

        const { x, y, width, height } = mapBoundingBoxToDisplay(
          box,
          videoWidth,
          videoHeight,
          containerWidth,
          containerHeight,
        );

        const score = detection.score?.[0] ?? 0;
        const confidenceLabel = `${Math.round(score * 100)}%`;

        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        const labelWidth = ctx.measureText(confidenceLabel).width + 12;
        const labelHeight = 22;
        const labelY = Math.max(0, y - labelHeight);

        ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
        ctx.fillRect(x, labelY, labelWidth, labelHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText(confidenceLabel, x + 6, labelY + 15);
      });
    };

    draw();

    const observer = new ResizeObserver(draw);
    observer.observe(container);

    return () => observer.disconnect();
  }, [detections, videoWidth, videoHeight]);

  if (!videoWidth || !videoHeight) return null;

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
