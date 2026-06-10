const LEFT_EYE = 33;
const RIGHT_EYE = 263;

export const DISTANCE_UNKNOWN = 'Unknown';

const THRESHOLDS = {
  tooFarEnter: 0.13,
  tooFarExit: 0.15,
  tooCloseEnter: 0.34,
  tooCloseExit: 0.32,
};

function measureInterEyeDistance(landmarks) {
  const leftEye = landmarks[LEFT_EYE];
  const rightEye = landmarks[RIGHT_EYE];
  return Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y);
}

function applyDistanceHysteresis(interEyeDistance, previousState) {
  if (previousState === 'Too Far') {
    if (interEyeDistance <= THRESHOLDS.tooFarExit) {
      return 'Too Far';
    }
    if (interEyeDistance >= THRESHOLDS.tooCloseEnter) {
      return 'Too Close';
    }
    return 'Good Distance';
  }

  if (previousState === 'Too Close') {
    if (interEyeDistance >= THRESHOLDS.tooCloseExit) {
      return 'Too Close';
    }
    if (interEyeDistance <= THRESHOLDS.tooFarEnter) {
      return 'Too Far';
    }
    return 'Good Distance';
  }

  if (interEyeDistance < THRESHOLDS.tooFarEnter) {
    return 'Too Far';
  }
  if (interEyeDistance > THRESHOLDS.tooCloseEnter) {
    return 'Too Close';
  }
  return 'Good Distance';
}

export function createDistanceTracker() {
  let currentState = DISTANCE_UNKNOWN;

  return {
    compute(landmarks) {
      if (!landmarks?.length) {
        currentState = DISTANCE_UNKNOWN;
        return currentState;
      }

      const interEyeDistance = measureInterEyeDistance(landmarks);
      currentState = applyDistanceHysteresis(interEyeDistance, currentState);
      return currentState;
    },
    markTrackingLost() {
      currentState = DISTANCE_UNKNOWN;
      return currentState;
    },
    reset() {
      currentState = DISTANCE_UNKNOWN;
    },
  };
}

export { THRESHOLDS as DISTANCE_THRESHOLDS };
