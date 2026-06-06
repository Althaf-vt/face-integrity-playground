import { useCallback, useEffect, useRef, useState } from 'react';

function getBrowserName() {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  return 'Unknown';
}

function mapMediaError(error) {
  const name = error?.name ?? '';

  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return {
      type: 'permission_denied',
      title: 'Camera Permission Denied',
      message:
        'Camera access was blocked. Please allow camera permissions in your browser settings and refresh the page.',
    };
  }

  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return {
      type: 'no_camera',
      title: 'No Camera Available',
      message:
        'No camera device was found on this system. Connect a webcam and try again.',
    };
  }

  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return {
      type: 'camera_blocked',
      title: 'Camera Unavailable',
      message:
        'The camera is in use by another application or could not be started. Close other apps using the camera and retry.',
    };
  }

  return {
    type: 'unknown',
    title: 'Camera Error',
    message: error?.message ?? 'An unexpected error occurred while accessing the camera.',
  };
}

function stopStreamTracks(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function useCamera() {
  const webcamRef = useRef(null);
  const streamRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [resolution, setResolution] = useState({ width: 0, height: 0 });
  const [error, setError] = useState(null);
  const [browserName] = useState(getBrowserName);

  useEffect(() => {
    let cancelled = false;

    async function checkPermission() {
      if (!navigator.permissions?.query) return;

      try {
        const result = await navigator.permissions.query({ name: 'camera' });
        if (!cancelled) {
          setPermissionStatus(result.state);
        }

        result.onchange = () => {
          if (!cancelled) {
            setPermissionStatus(result.state);
          }
        };
      } catch {
        // Permissions API may not support camera query in all browsers
      }
    }

    checkPermission();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      stopStreamTracks(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  const handleUserMedia = useCallback((stream) => {
    stopStreamTracks(streamRef.current);
    streamRef.current = stream;

    setError(null);
    setIsConnected(true);
    setPermissionStatus('granted');

    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      const settings = videoTrack.getSettings();
      setResolution({
        width: settings.width ?? 0,
        height: settings.height ?? 0,
      });
    }
  }, []);

  const handleUserMediaError = useCallback((err) => {
    stopStreamTracks(streamRef.current);
    streamRef.current = null;

    setIsConnected(false);
    setResolution({ width: 0, height: 0 });

    if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
      setPermissionStatus('denied');
    }

    setError(mapMediaError(err));
  }, []);

  const updateResolutionFromVideo = useCallback(() => {
    const video = webcamRef.current?.video;
    if (video?.videoWidth && video?.videoHeight) {
      setResolution({
        width: video.videoWidth,
        height: video.videoHeight,
      });
    }
  }, []);

  const getVideoElement = useCallback(() => {
    return webcamRef.current?.video ?? null;
  }, []);

  return {
    webcamRef,
    isConnected,
    permissionStatus,
    resolution,
    error,
    browserName,
    handleUserMedia,
    handleUserMediaError,
    updateResolutionFromVideo,
    getVideoElement,
  };
}
