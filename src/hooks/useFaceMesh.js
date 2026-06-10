import { useCallback, useEffect, useRef, useState } from 'react';
import { createFaceMeshTracker } from '../services/mediapipeFaceMesh';
import { createOrientationTracker } from '../utils/faceOrientation';
import { createDistanceTracker, DISTANCE_UNKNOWN } from '../utils/faceDistance';
import { createVisibilityTracker, VISIBILITY_TRACKING_LOST } from '../utils/faceVisibility';
import { getTrackingQuality } from '../utils/trackingQuality';
import { createFpsCalculator } from '../utils/fpsCalculator';

export function useFaceMesh({ getVideoElement, isCameraConnected }) {
  const [landmarks, setLandmarks] = useState(null);
  const [landmarkCount, setLandmarkCount] = useState(0);
  const [meshStatus, setMeshStatus] = useState('Face Mesh Initializing');
  const [orientation, setOrientation] = useState({ yaw: 0, pitch: 0, roll: 0 });
  const [faceVisibility, setFaceVisibility] = useState(VISIBILITY_TRACKING_LOST);
  const [faceDistance, setFaceDistance] = useState(DISTANCE_UNKNOWN);
  const [trackingQuality, setTrackingQuality] = useState('Lost');
  const [trackingFps, setTrackingFps] = useState(0);

  const meshRef = useRef(null);
  const animationRef = useRef(null);
  const fpsCalculatorRef = useRef(createFpsCalculator());
  const orientationTrackerRef = useRef(createOrientationTracker());
  const distanceTrackerRef = useRef(createDistanceTracker());
  const visibilityTrackerRef = useRef(createVisibilityTracker());
  const isRunningRef = useRef(false);
  const inFlightRef = useRef(false);
  const hasTrackedRef = useRef(false);

  const stopTrackingLoop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    isRunningRef.current = false;
    inFlightRef.current = false;
  }, []);

  const startTrackingLoop = useCallback(() => {
    const video = getVideoElement();
    if (!video || !meshRef.current || isRunningRef.current) return;

    isRunningRef.current = true;

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

      meshRef.current
        .send(currentVideo)
        .then(() => {
          if (!isRunningRef.current) return;
          setTrackingFps(fpsCalculatorRef.current.tick());
        })
        .catch(() => {
          if (!isRunningRef.current) return;
          setMeshStatus('Face Mesh Error');
          stopTrackingLoop();
        })
        .finally(() => {
          inFlightRef.current = false;
          if (isRunningRef.current) {
            animationRef.current = requestAnimationFrame(runFrame);
          }
        });
    };

    animationRef.current = requestAnimationFrame(runFrame);
  }, [getVideoElement, stopTrackingLoop]);

  useEffect(() => {
    let cancelled = false;
    const fpsCalculator = fpsCalculatorRef.current;
    const orientationTracker = orientationTrackerRef.current;
    const distanceTracker = distanceTrackerRef.current;
    const visibilityTracker = visibilityTrackerRef.current;

    async function initMesh() {
      if (!isCameraConnected) {
        setMeshStatus('Face Mesh Initializing');
        setTrackingFps(0);
        return;
      }

      setMeshStatus('Face Mesh Initializing');

      try {
        const mesh = createFaceMeshTracker();
        mesh.setOnResults((results) => {
          if (cancelled) return;

          const activeLandmarks = results.multiFaceLandmarks?.[0] ?? null;
          const count = activeLandmarks?.length ?? 0;

          setLandmarks(activeLandmarks);
          setLandmarkCount(count);

          if (count > 0) {
            hasTrackedRef.current = true;
            setMeshStatus('Tracking Active');

            const nextOrientation = orientationTracker.compute(activeLandmarks);
            const nextVisibility = visibilityTracker.compute(activeLandmarks, false);
            const nextDistance = distanceTracker.compute(activeLandmarks);

            setOrientation(nextOrientation);
            setFaceVisibility(nextVisibility);
            setFaceDistance(nextDistance);
            setTrackingQuality(
              getTrackingQuality({
                landmarks: activeLandmarks,
                visibility: nextVisibility,
                distance: nextDistance,
                meshStatus: 'Tracking Active',
              }),
            );
          } else if (hasTrackedRef.current) {
            setMeshStatus('Tracking Lost');
            setTrackingQuality('Lost');
            orientationTracker.reset();
            setOrientation({ yaw: 0, pitch: 0, roll: 0 });
            setFaceVisibility(visibilityTracker.compute(null, true));
            setFaceDistance(distanceTracker.markTrackingLost());
          } else {
            setMeshStatus('Face Mesh Loaded');
            setTrackingQuality('Lost');
            setFaceVisibility(VISIBILITY_TRACKING_LOST);
            setFaceDistance(DISTANCE_UNKNOWN);
          }
        });

        await mesh.init();
        if (cancelled) {
          mesh.close();
          return;
        }

        meshRef.current = mesh;
        setMeshStatus('Face Mesh Loaded');
        startTrackingLoop();
      } catch {
        if (!cancelled) {
          setMeshStatus('Face Mesh Error');
        }
      }
    }

    initMesh();

    return () => {
      cancelled = true;
      stopTrackingLoop();
      meshRef.current?.close();
      meshRef.current = null;
      fpsCalculator.reset();
      orientationTracker.reset();
      distanceTracker.reset();
      visibilityTracker.reset();
      hasTrackedRef.current = false;
    };
  }, [isCameraConnected, startTrackingLoop, stopTrackingLoop]);

  return {
    landmarks,
    landmarkCount: landmarkCount || (landmarks ? landmarks.length : 0),
    meshStatus,
    orientation,
    faceVisibility,
    faceDistance,
    trackingQuality,
    trackingFps,
  };
}
