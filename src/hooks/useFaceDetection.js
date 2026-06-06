import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createFaceDetector,
  getDetectionConfidence,
  getFacePresenceStatus,
} from '../services/mediapipeFaceDetection';
import { createFpsCalculator } from '../utils/fpsCalculator';

export function useFaceDetection({ getVideoElement, isCameraConnected }) {
  const [detections, setDetections] = useState([]);
  const [confidence, setConfidence] = useState(0);
  const [faceCount, setFaceCount] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [facePresence, setFacePresence] = useState('No Face');
  const [detectionHealth, setDetectionHealth] = useState('Detection Paused');
  const [detectionFps, setDetectionFps] = useState(0);

  const detectorRef = useRef(null);
  const animationRef = useRef(null);
  const fpsCalculatorRef = useRef(createFpsCalculator());
  const isRunningRef = useRef(false);
  const inFlightRef = useRef(false);

  const stopDetectionLoop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    isRunningRef.current = false;
    inFlightRef.current = false;
  }, []);

  const startDetectionLoop = useCallback(() => {
    const video = getVideoElement();
    if (!video || !detectorRef.current || isRunningRef.current) return;

    isRunningRef.current = true;
    setDetectionHealth('Detection Running');

    const runFrame = () => {
      if (!isRunningRef.current) return;

      const currentVideo = getVideoElement();
      if (
        !currentVideo ||
        currentVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        animationRef.current = requestAnimationFrame(runFrame);
        return;
      }

      if (inFlightRef.current) {
        animationRef.current = requestAnimationFrame(runFrame);
        return;
      }

      inFlightRef.current = true;

      detectorRef.current
        .detect(currentVideo)
        .then(() => {
          if (!isRunningRef.current) return;
          setDetectionFps(fpsCalculatorRef.current.tick());
        })
        .catch(() => {
          if (!isRunningRef.current) return;
          setDetectionHealth('Detection Error');
          stopDetectionLoop();
        })
        .finally(() => {
          inFlightRef.current = false;
          if (isRunningRef.current) {
            animationRef.current = requestAnimationFrame(runFrame);
          }
        });
    };

    animationRef.current = requestAnimationFrame(runFrame);
  }, [getVideoElement, stopDetectionLoop]);

  useEffect(() => {
    let cancelled = false;
    const fpsCalculator = fpsCalculatorRef.current;

    async function initDetector() {
      if (!isCameraConnected) {
        setDetectionHealth('Detection Paused');
        setDetectionFps(0);
        return;
      }

      try {
        const detector = createFaceDetector();
        detector.setOnResults((results) => {
          if (cancelled) return;

          const currentDetections = results.detections ?? [];
          const count = currentDetections.length;

          setDetections(currentDetections);
          setFaceCount(count);
          setFaceDetected(count > 0);
          setConfidence(getDetectionConfidence(currentDetections));
          setFacePresence(getFacePresenceStatus(count));
        });

        await detector.init();
        if (cancelled) {
          detector.close();
          return;
        }

        detectorRef.current = detector;
        startDetectionLoop();
      } catch {
        if (!cancelled) {
          setDetectionHealth('Detection Error');
        }
      }
    }

    initDetector();

    return () => {
      cancelled = true;
      stopDetectionLoop();
      detectorRef.current?.close();
      detectorRef.current = null;
      fpsCalculator.reset();
    };
  }, [isCameraConnected, startDetectionLoop, stopDetectionLoop]);

  return {
    detections,
    confidence,
    faceCount,
    faceDetected,
    facePresence,
    detectionHealth,
    detectionFps,
  };
}
