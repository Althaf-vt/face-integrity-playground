import Webcam from 'react-webcam';
import { Camera, ShieldAlert } from 'lucide-react';
import FaceDetectionOverlay from './FaceDetectionOverlay';
import FaceMeshOverlay from './FaceMeshOverlay';

const VIDEO_CONSTRAINTS = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  facingMode: 'user',
};

export default function WebcamFeed({
  webcamRef,
  onUserMedia,
  onUserMediaError,
  onLoadedMetadata,
  error,
  detections,
  landmarks,
  resolution,
  landmarkGroups,
}) {
  if (error) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-red-500/30 bg-slate-900/80 p-8 text-center">
        <ShieldAlert className="mb-4 h-12 w-12 text-red-400" />
        <h3 className="text-lg font-semibold text-red-300">{error.title}</h3>
        <p className="mt-2 max-w-md text-sm text-slate-400">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 shadow-2xl shadow-black/40">
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored
        screenshotFormat="image/jpeg"
        videoConstraints={VIDEO_CONSTRAINTS}
        onUserMedia={onUserMedia}
        onUserMediaError={onUserMediaError}
        onLoadedMetadata={onLoadedMetadata}
        className="h-full w-full object-cover"
      />
      <FaceMeshOverlay
        landmarks={landmarks}
        videoWidth={resolution.width}
        videoHeight={resolution.height}
        landmarkGroups={landmarkGroups}
      />
      <FaceDetectionOverlay
        detections={detections}
        videoWidth={resolution.width}
        videoHeight={resolution.height}
      />
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md bg-black/60 px-3 py-1.5 text-xs text-slate-200 backdrop-blur-sm">
        <Camera className="h-3.5 w-3.5 text-emerald-400" />
        <span>Live Feed</span>
      </div>
    </div>
  );
}
