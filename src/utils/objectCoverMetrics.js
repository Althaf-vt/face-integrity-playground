/**
 * Computes scale and offset for a video displayed with CSS object-fit: cover.
 * Maps native video pixel coordinates to container display coordinates.
 */
export function getObjectCoverMetrics(containerWidth, containerHeight, videoWidth, videoHeight) {
  if (!containerWidth || !containerHeight || !videoWidth || !videoHeight) {
    return { scale: 1, offsetX: 0, offsetY: 0 };
  }

  const videoAspect = videoWidth / videoHeight;
  const containerAspect = containerWidth / containerHeight;

  if (videoAspect > containerAspect) {
    const scale = containerHeight / videoHeight;
    return {
      scale,
      offsetX: (containerWidth - videoWidth * scale) / 2,
      offsetY: 0,
    };
  }

  const scale = containerWidth / videoWidth;
  return {
    scale,
    offsetX: 0,
    offsetY: (containerHeight - videoHeight * scale) / 2,
  };
}

/**
 * Converts a normalized MediaPipe bounding box to mirrored display coordinates
 * under object-fit: cover (matching a horizontally mirrored webcam feed).
 */
export function mapBoundingBoxToDisplay(box, videoWidth, videoHeight, containerWidth, containerHeight) {
  const { scale, offsetX, offsetY } = getObjectCoverMetrics(
    containerWidth,
    containerHeight,
    videoWidth,
    videoHeight,
  );

  const nativeX = (box.xCenter - box.width / 2) * videoWidth;
  const nativeY = (box.yCenter - box.height / 2) * videoHeight;
  const nativeWidth = box.width * videoWidth;
  const nativeHeight = box.height * videoHeight;

  const displayX = nativeX * scale + offsetX;
  const displayY = nativeY * scale + offsetY;
  const displayWidth = nativeWidth * scale;
  const displayHeight = nativeHeight * scale;

  // Mirror horizontally to match react-webcam mirrored={true}
  const mirroredX = containerWidth - displayX - displayWidth;

  return {
    x: mirroredX,
    y: displayY,
    width: displayWidth,
    height: displayHeight,
  };
}
