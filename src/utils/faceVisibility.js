import { createDebouncedSignalTracker } from './signalHysteresis';

const KEY_LANDMARK_INDICES = [10, 152, 33, 263, 61, 291, 1, 168, 397, 172];

const FRAME_MARGIN = 0.04;
const FULL_MARGIN = 0.02;
const VISIBILITY_DEBOUNCE_FRAMES = 3;

export const VISIBILITY_TRACKING_LOST = 'Tracking Lost';

function isInBounds(landmark, margin) {
  return (
    landmark.x >= margin &&
    landmark.x <= 1 - margin &&
    landmark.y >= margin &&
    landmark.y <= 1 - margin
  );
}

/**
 * Instantaneous visibility from landmark positions (no tracking-lost handling).
 */
export function measureFaceVisibility(landmarks) {
  const keyInBounds = KEY_LANDMARK_INDICES.filter((index) =>
    isInBounds(landmarks[index], FRAME_MARGIN),
  ).length;

  if (keyInBounds === 0) {
    return 'Out Of Frame';
  }

  const allKeyVisible = keyInBounds === KEY_LANDMARK_INDICES.length;
  const allLandmarksVisible = landmarks.every((landmark) =>
    isInBounds(landmark, FULL_MARGIN),
  );

  if (allKeyVisible && allLandmarksVisible) {
    return 'Fully Visible';
  }

  if (keyInBounds < KEY_LANDMARK_INDICES.length / 2) {
    return 'Out Of Frame';
  }

  return 'Partially Visible';
}

export function createVisibilityTracker() {
  const debouncer = createDebouncedSignalTracker(
    VISIBILITY_TRACKING_LOST,
    VISIBILITY_DEBOUNCE_FRAMES,
  );

  return {
    compute(landmarks, isTrackingLost) {
      if (isTrackingLost || !landmarks?.length) {
        debouncer.reset(VISIBILITY_TRACKING_LOST);
        return VISIBILITY_TRACKING_LOST;
      }

      const rawVisibility = measureFaceVisibility(landmarks);
      return debouncer.update(rawVisibility);
    },
    reset() {
      debouncer.reset(VISIBILITY_TRACKING_LOST);
    },
  };
}
