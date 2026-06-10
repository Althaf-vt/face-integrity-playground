import { Scan } from 'lucide-react';
import StatusCard from './StatusCard';
import { formatDegrees } from '../utils/valueSmoother';
import { ORIENTATION_CONVENTION } from '../utils/faceOrientation';
import { DISTANCE_UNKNOWN } from '../utils/faceDistance';
import { VISIBILITY_TRACKING_LOST } from '../utils/faceVisibility';
import { getTrackingQualityStatus } from '../utils/trackingQuality';

function getMeshStatusCard(meshStatus) {
  if (meshStatus === 'Tracking Active') {
    return { status: 'success' };
  }
  if (meshStatus === 'Face Mesh Error' || meshStatus === 'Tracking Lost') {
    return { status: 'error' };
  }
  if (meshStatus === 'Face Mesh Initializing' || meshStatus === 'Face Mesh Loaded') {
    return { status: 'warning' };
  }
  return { status: 'neutral' };
}

function getVisibilityStatus(visibility) {
  if (visibility === 'Fully Visible') return 'success';
  if (visibility === 'Partially Visible') return 'warning';
  if (visibility === VISIBILITY_TRACKING_LOST) return 'error';
  return 'error';
}

function getDistanceStatus(distance) {
  if (distance === 'Good Distance') return 'success';
  if (distance === DISTANCE_UNKNOWN) return 'neutral';
  if (distance === 'Too Close' || distance === 'Too Far') return 'warning';
  return 'neutral';
}

export default function FaceMeshMetrics({
  meshStatus,
  landmarkCount,
  trackingQuality,
  faceVisibility,
  faceDistance,
  orientation,
  trackingFps,
}) {
  const meshCard = getMeshStatusCard(meshStatus);
  const isTrackingLost =
    meshStatus === 'Tracking Lost' || faceVisibility === VISIBILITY_TRACKING_LOST;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-700/60 pb-3">
        <Scan className="h-5 w-5 text-violet-400" />
        <h2 className="text-lg font-semibold text-slate-100">Face Mesh Tracking</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatusCard
          label="Tracking Status"
          value={meshStatus}
          status={meshCard.status}
        />
        <StatusCard
          label="Landmarks"
          value={String(landmarkCount)}
          status={landmarkCount > 0 ? 'success' : 'neutral'}
          subtitle={landmarkCount > 0 ? '468-point mesh active' : 'No landmarks detected'}
        />
        <StatusCard
          label="Tracking Quality"
          value={trackingQuality}
          status={getTrackingQualityStatus(trackingQuality)}
        />
        <StatusCard
          label="Face Visibility"
          value={faceVisibility}
          status={getVisibilityStatus(faceVisibility)}
          subtitle={
            isTrackingLost ? 'Face mesh not currently tracking landmarks' : undefined
          }
        />
        <StatusCard
          label="Face Distance"
          value={faceDistance}
          status={getDistanceStatus(faceDistance)}
          subtitle={
            faceDistance === DISTANCE_UNKNOWN
              ? 'Distance unavailable while tracking is lost'
              : undefined
          }
        />
        <StatusCard
          label="Tracking FPS"
          value={`${trackingFps} fps`}
          status={trackingFps > 0 ? 'success' : 'neutral'}
          subtitle="Completed mesh inferences per second"
        />
      </div>

      <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
        <h3 className="mb-3 text-sm font-medium text-slate-300">Face Orientation</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-500">Yaw</p>
            <p className="font-mono text-lg font-semibold text-violet-300">
              {formatDegrees(orientation.yaw)}
            </p>
            <p className="text-xs text-slate-500">+ right / − left</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Pitch</p>
            <p className="font-mono text-lg font-semibold text-violet-300">
              {formatDegrees(orientation.pitch)}
            </p>
            <p className="text-xs text-slate-500">+ up / − down</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Roll</p>
            <p className="font-mono text-lg font-semibold text-violet-300">
              {formatDegrees(orientation.roll)}
            </p>
            <p className="text-xs text-slate-500">Head tilt</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Convention: {ORIENTATION_CONVENTION.yaw}; {ORIENTATION_CONVENTION.pitch}
        </p>
      </div>
    </div>
  );
}
