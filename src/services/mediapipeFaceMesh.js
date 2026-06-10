import '@mediapipe/face_mesh/face_mesh.js';

const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh';

export const FACE_MESH_CONFIG = {
  packageName: '@mediapipe/face_mesh',
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
};

export const FACE_MESH_LANDMARK_COUNT = 468;

function getFaceMeshClass() {
  const FaceMesh = globalThis.FaceMesh;
  if (!FaceMesh) {
    throw new Error('MediaPipe FaceMesh failed to load');
  }
  return FaceMesh;
}

export function createFaceMeshTracker() {
  let mesh = null;
  let onResultsCallback = null;

  const init = async () => {
    const FaceMesh = getFaceMeshClass();

    mesh = new FaceMesh({
      locateFile: (file) => `${MEDIAPIPE_CDN}/${file}`,
    });

    mesh.setOptions({
      maxNumFaces: FACE_MESH_CONFIG.maxNumFaces,
      refineLandmarks: FACE_MESH_CONFIG.refineLandmarks,
      minDetectionConfidence: FACE_MESH_CONFIG.minDetectionConfidence,
      minTrackingConfidence: FACE_MESH_CONFIG.minTrackingConfidence,
    });

    mesh.onResults((results) => {
      if (onResultsCallback) {
        onResultsCallback(results);
      }
    });

    await mesh.initialize();
    return mesh;
  };

  const send = async (image) => {
    if (!mesh) {
      throw new Error('Face mesh not initialized');
    }
    await mesh.send({ image });
  };

  const setOnResults = (callback) => {
    onResultsCallback = callback;
  };

  const close = () => {
    if (mesh) {
      mesh.close();
      mesh = null;
    }
    onResultsCallback = null;
  };

  return { init, send, setOnResults, close };
}
