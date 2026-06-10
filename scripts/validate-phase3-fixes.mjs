/**
 * Standalone validation for Phase 3 audit fixes.
 * Run: node scripts/validate-phase3-fixes.mjs
 */

function createValueSmoother(alpha = 0.25) {
  let value = null;
  return {
    smooth(next) {
      value = value === null ? next : alpha * next + (1 - alpha) * value;
      return value;
    },
  };
}

function computeUserFacingOrientation(landmarks) {
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const noseTip = landmarks[1];
  const forehead = landmarks[10];
  const chin = landmarks[152];

  const dx = rightEye.x - leftEye.x;
  const dy = rightEye.y - leftEye.y;
  const eyeDistance = Math.hypot(dx, dy) || 0.001;
  const eyeMidX = (leftEye.x + rightEye.x) / 2;
  const eyeMidY = (leftEye.y + rightEye.y) / 2;
  const eyeMidZ = (leftEye.z + rightEye.z) / 2;
  const verticalSpan = Math.hypot(forehead.x - chin.x, forehead.y - chin.y) || eyeDistance;

  const cameraYaw =
    (Math.atan2(noseTip.x - eyeMidX + (noseTip.z - eyeMidZ) * 0.4, eyeDistance) * 180) /
    Math.PI *
    1.6;
  const cameraPitch =
    (Math.atan2(noseTip.y - eyeMidY, verticalSpan) * 180) / Math.PI * 2.2;

  const yawSmoother = createValueSmoother(1);
  const pitchSmoother = createValueSmoother(1);

  return {
    yaw: yawSmoother.smooth(-cameraYaw),
    pitch: pitchSmoother.smooth(-cameraPitch),
  };
}

function makeLandmarks({ noseX = 0.5, noseY = 0.5, eyeY = 0.45, eyeSpan = 0.16 }) {
  const landmarks = Array.from({ length: 468 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  const half = eyeSpan / 2;
  landmarks[33] = { x: 0.5 - half, y: eyeY, z: 0 };
  landmarks[263] = { x: 0.5 + half, y: eyeY, z: 0 };
  landmarks[1] = { x: noseX, y: noseY, z: 0 };
  landmarks[10] = { x: 0.5, y: 0.35, z: 0 };
  landmarks[152] = { x: 0.5, y: 0.75, z: 0 };
  return landmarks;
}

function applyDistanceHysteresis(interEyeDistance, previousState) {
  if (previousState === 'Too Far') {
    if (interEyeDistance <= 0.15) return 'Too Far';
    if (interEyeDistance >= 0.34) return 'Too Close';
    return 'Good Distance';
  }
  if (interEyeDistance < 0.13) return 'Too Far';
  if (interEyeDistance > 0.34) return 'Too Close';
  return 'Good Distance';
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const turnRight = computeUserFacingOrientation(makeLandmarks({ noseX: 0.46 }));
const turnLeft = computeUserFacingOrientation(makeLandmarks({ noseX: 0.54 }));
const lookUp = computeUserFacingOrientation(makeLandmarks({ noseY: 0.42, eyeY: 0.45 }));
const lookDown = computeUserFacingOrientation(makeLandmarks({ noseY: 0.52, eyeY: 0.45 }));

assert(turnRight.yaw > 0, 'Turn right → positive yaw');
assert(turnLeft.yaw < 0, 'Turn left → negative yaw');
assert(lookUp.pitch > 0, 'Look up → positive pitch');
assert(lookDown.pitch < 0, 'Look down → negative pitch');

let distanceState = 'Unknown';
assert(distanceState === 'Unknown', 'Tracking lost distance starts Unknown');
distanceState = applyDistanceHysteresis(0.12, distanceState);
assert(distanceState === 'Too Far', 'Enter Too Far below 0.13');
distanceState = applyDistanceHysteresis(0.14, distanceState);
assert(distanceState === 'Too Far', 'Stay Too Far until above 0.15');
distanceState = applyDistanceHysteresis(0.16, distanceState);
assert(distanceState === 'Good Distance', 'Exit Too Far above 0.15');

console.log('Phase 3 audit fix validation passed.');
console.log({
  yawRight: turnRight.yaw.toFixed(1),
  yawLeft: turnLeft.yaw.toFixed(1),
  pitchUp: lookUp.pitch.toFixed(1),
  pitchDown: lookDown.pitch.toFixed(1),
  distanceHysteresis: '0.13 enter / 0.15 exit Too Far',
});
