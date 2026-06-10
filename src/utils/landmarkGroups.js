/** Nose region connections derived from MediaPipe Face Mesh topology. */
export const NOSE_CONNECTIONS = [
  [168, 6],
  [6, 197],
  [197, 195],
  [195, 5],
  [5, 4],
  [4, 1],
  [1, 19],
  [19, 94],
  [94, 2],
  [2, 164],
  [164, 0],
  [0, 11],
  [11, 12],
  [12, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [16, 17],
  [17, 18],
  [18, 200],
  [200, 199],
  [199, 175],
];

export const DEFAULT_LANDMARK_GROUPS = {
  fullMesh: false,
  eyes: true,
  mouth: true,
  nose: true,
  faceOutline: true,
};

export function getMeshConnectionSets() {
  return {
    tesselation: globalThis.FACEMESH_TESSELATION ?? [],
    faceOval: globalThis.FACEMESH_FACE_OVAL ?? [],
    lips: globalThis.FACEMESH_LIPS ?? [],
    leftEye: globalThis.FACEMESH_LEFT_EYE ?? [],
    rightEye: globalThis.FACEMESH_RIGHT_EYE ?? [],
    nose: NOSE_CONNECTIONS,
  };
}

export function getActiveConnectionGroups(groups, connectionSets) {
  const active = [];

  if (groups.fullMesh) {
    active.push({ connections: connectionSets.tesselation, color: 'rgba(80, 200, 255, 0.35)', lineWidth: 0.5 });
  }
  if (groups.faceOutline) {
    active.push({ connections: connectionSets.faceOval, color: 'rgba(52, 211, 153, 0.9)', lineWidth: 2 });
  }
  if (groups.eyes) {
    active.push({ connections: connectionSets.leftEye, color: 'rgba(96, 165, 250, 0.9)', lineWidth: 1.5 });
    active.push({ connections: connectionSets.rightEye, color: 'rgba(96, 165, 250, 0.9)', lineWidth: 1.5 });
  }
  if (groups.mouth) {
    active.push({ connections: connectionSets.lips, color: 'rgba(251, 146, 60, 0.9)', lineWidth: 1.5 });
  }
  if (groups.nose) {
    active.push({ connections: connectionSets.nose, color: 'rgba(192, 132, 252, 0.9)', lineWidth: 1.5 });
  }

  return active;
}
