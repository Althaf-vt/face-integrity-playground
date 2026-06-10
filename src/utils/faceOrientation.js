import { createValueSmoother } from './valueSmoother';

/**
 * User-facing orientation convention (mirrored selfie view):
 * - Yaw:  turn right = positive, turn left = negative
 * - Pitch: look up = positive, look down = negative
 * - Roll:  clockwise head tilt = positive (right shoulder down)
 *
 * Raw landmark math uses camera-space coordinates; yaw and pitch are negated
 * so displayed values match what the user perceives on a mirrored feed.
 */
export const ORIENTATION_CONVENTION = {
  yaw: 'positive = turn right, negative = turn left',
  pitch: 'positive = look up, negative = look down',
  roll: 'positive = clockwise tilt (right shoulder down)',
};

const LANDMARK = {
  NOSE_TIP: 1,
  CHIN: 152,
  LEFT_EYE: 33,
  RIGHT_EYE: 263,
  FOREHEAD: 10,
};

export function createOrientationTracker() {
  const yawSmoother = createValueSmoother(0.2);
  const pitchSmoother = createValueSmoother(0.2);
  const rollSmoother = createValueSmoother(0.2);

  return {
    compute(landmarks) {
      if (!landmarks?.length) {
        return { yaw: 0, pitch: 0, roll: 0 };
      }

      const leftEye = landmarks[LANDMARK.LEFT_EYE];
      const rightEye = landmarks[LANDMARK.RIGHT_EYE];
      const noseTip = landmarks[LANDMARK.NOSE_TIP];
      const chin = landmarks[LANDMARK.CHIN];
      const forehead = landmarks[LANDMARK.FOREHEAD];

      const dx = rightEye.x - leftEye.x;
      const dy = rightEye.y - leftEye.y;
      const eyeDistance = Math.hypot(dx, dy) || 0.001;

      const rollRaw = (Math.atan2(dy, dx) * 180) / Math.PI;

      const eyeMidX = (leftEye.x + rightEye.x) / 2;
      const eyeMidY = (leftEye.y + rightEye.y) / 2;
      const eyeMidZ = (leftEye.z + rightEye.z) / 2;

      const cameraYaw =
        (Math.atan2(
          noseTip.x - eyeMidX + (noseTip.z - eyeMidZ) * 0.4,
          eyeDistance,
        ) *
          180) /
        Math.PI *
        1.6;

      const verticalSpan =
        Math.hypot(forehead.x - chin.x, forehead.y - chin.y) || eyeDistance;
      const cameraPitch =
        (Math.atan2(noseTip.y - eyeMidY, verticalSpan) * 180) / Math.PI * 2.2;

      return {
        yaw: yawSmoother.smooth(-cameraYaw),
        pitch: pitchSmoother.smooth(-cameraPitch),
        roll: rollSmoother.smooth(rollRaw),
      };
    },
    reset() {
      yawSmoother.reset();
      pitchSmoother.reset();
      rollSmoother.reset();
    },
  };
}
