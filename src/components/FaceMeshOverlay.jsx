import { useEffect, useRef } from 'react';
import { mapNormalizedPointToDisplay } from '../utils/objectCoverMetrics';
import { getActiveConnectionGroups, getMeshConnectionSets } from '../utils/landmarkGroups';

function drawConnections(ctx, landmarks, connections, color, lineWidth, metrics) {
  const { videoWidth, videoHeight, containerWidth, containerHeight } = metrics;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();

  connections.forEach(([start, end]) => {
    const from = landmarks[start];
    const to = landmarks[end];
    if (!from || !to) return;

    const p1 = mapNormalizedPointToDisplay(
      from,
      videoWidth,
      videoHeight,
      containerWidth,
      containerHeight,
    );
    const p2 = mapNormalizedPointToDisplay(
      to,
      videoWidth,
      videoHeight,
      containerWidth,
      containerHeight,
    );

    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
  });

  ctx.stroke();
}

function drawLandmarkPoints(ctx, landmarks, metrics) {
  const { videoWidth, videoHeight, containerWidth, containerHeight } = metrics;

  ctx.fillStyle = 'rgba(244, 114, 182, 0.85)';

  landmarks.forEach((landmark) => {
    const { x, y } = mapNormalizedPointToDisplay(
      landmark,
      videoWidth,
      videoHeight,
      containerWidth,
      containerHeight,
    );
    ctx.beginPath();
    ctx.arc(x, y, 1.2, 0, Math.PI * 2);
    ctx.fill();
  });
}

export default function FaceMeshOverlay({
  landmarks,
  videoWidth,
  videoHeight,
  landmarkGroups,
  showPoints = false,
}) {
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

      if (!landmarks?.length || !videoWidth || !videoHeight) return;

      const metrics = { videoWidth, videoHeight, containerWidth, containerHeight };
      const connectionSets = getMeshConnectionSets();
      const activeGroups = getActiveConnectionGroups(landmarkGroups, connectionSets);

      activeGroups.forEach(({ connections, color, lineWidth }) => {
        if (connections?.length) {
          drawConnections(ctx, landmarks, connections, color, lineWidth, metrics);
        }
      });

      if (showPoints) {
        drawLandmarkPoints(ctx, landmarks, metrics);
      }
    };

    draw();

    const observer = new ResizeObserver(draw);
    observer.observe(container);

    return () => observer.disconnect();
  }, [landmarks, videoWidth, videoHeight, landmarkGroups, showPoints]);

  if (!videoWidth || !videoHeight) return null;

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
