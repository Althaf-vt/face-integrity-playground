import '@mediapipe/face_detection/face_detection.js';

const MEDIAPIPE_CDN =
  'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection';

export const FACE_DETECTION_CONFIG = {
  packageName: '@mediapipe/face_detection',
  model: 'short',
  minDetectionConfidence: 0.5,
};

function getFaceDetectionClass() {
  const FaceDetection = globalThis.FaceDetection;
  if (!FaceDetection) {
    throw new Error('MediaPipe FaceDetection failed to load');
  }
  return FaceDetection;
}

export function createFaceDetector() {
  let detector = null;
  let onResultsCallback = null;

  const init = async () => {
    const FaceDetection = getFaceDetectionClass();

    detector = new FaceDetection({
      locateFile: (file) => `${MEDIAPIPE_CDN}/${file}`,
    });

    detector.setOptions({
      model: FACE_DETECTION_CONFIG.model,
      minDetectionConfidence: FACE_DETECTION_CONFIG.minDetectionConfidence,
    });

    detector.onResults((results) => {
      if (onResultsCallback) {
        onResultsCallback(results);
      }
    });

    await detector.initialize();
    return detector;
  };

  const detect = async (image) => {
    if (!detector) {
      throw new Error('Face detector not initialized');
    }
    await detector.send({ image });
  };

  const setOnResults = (callback) => {
    onResultsCallback = callback;
  };

  const close = () => {
    if (detector) {
      detector.close();
      detector = null;
    }
    onResultsCallback = null;
  };

  return { init, detect, setOnResults, close };
}

export function getDetectionConfidence(detections) {
  if (!detections || detections.length === 0) return 0;

  const topScore = detections.reduce((max, detection) => {
    const score = detection.score?.[0] ?? 0;
    return Math.max(max, score);
  }, 0);

  return Math.round(topScore * 100);
}

export function getFacePresenceStatus(faceCount) {
  if (faceCount === 0) return 'No Face';
  if (faceCount === 1) return 'Single Face';
  return 'Multiple Faces';
}
