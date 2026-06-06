import { Activity, Monitor, Camera, Maximize2 } from 'lucide-react';
import StatusCard from './StatusCard';

function getCameraStatusLabel(isConnected) {
  return isConnected ? 'Camera Connected' : 'Camera Disconnected';
}

function getPermissionLabel(permissionStatus) {
  if (permissionStatus === 'granted') return 'Permission Granted';
  if (permissionStatus === 'denied') return 'Permission Denied';
  return 'Permission Pending';
}

function getPermissionStatus(permissionStatus) {
  if (permissionStatus === 'granted') return 'success';
  if (permissionStatus === 'denied') return 'error';
  return 'warning';
}

function getCameraConnectionStatus(isConnected) {
  return isConnected ? 'success' : 'error';
}

export default function DiagnosticsPanel({
  browserName,
  isConnected,
  permissionStatus,
  fps,
  resolution,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-700/60 pb-3">
        <Activity className="h-5 w-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-slate-100">Diagnostics</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatusCard
          label="Browser"
          value={browserName}
          status="neutral"
          subtitle="Detected user agent"
          live={false}
        />
        <StatusCard
          label="Camera Status"
          value={getCameraStatusLabel(isConnected)}
          status={getCameraConnectionStatus(isConnected)}
        />
        <StatusCard
          label="Permission"
          value={getPermissionLabel(permissionStatus)}
          status={getPermissionStatus(permissionStatus)}
        />
        <StatusCard
          label="Detection FPS"
          value={`${fps} fps`}
          status={fps > 0 ? 'success' : 'neutral'}
          subtitle="Completed MediaPipe inferences per second"
        />
      </div>

      <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Maximize2 className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-300">Resolution</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500">Video Width</p>
            <p className="text-lg font-mono font-semibold text-cyan-300">
              {resolution.width || '—'}
              <span className="ml-1 text-xs text-slate-500">px</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Video Height</p>
            <p className="text-lg font-mono font-semibold text-cyan-300">
              {resolution.height || '—'}
              <span className="ml-1 text-xs text-slate-500">px</span>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Monitor className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-300">System Summary</h3>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Browser</dt>
            <dd className="font-medium text-slate-200">{browserName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Camera</dt>
            <dd className="font-medium text-slate-200">
              {getCameraStatusLabel(isConnected)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Detection FPS</dt>
            <dd className="font-mono font-medium text-slate-200">{fps}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Resolution</dt>
            <dd className="font-mono font-medium text-slate-200">
              {resolution.width && resolution.height
                ? `${resolution.width} × ${resolution.height}`
                : '—'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export function FaceDetectionMetrics({
  faceDetected,
  confidence,
  faceCount,
  facePresence,
  detectionHealth,
}) {
  const detectionStatus = faceDetected ? 'success' : 'neutral';
  const healthStatus =
    detectionHealth === 'Detection Running'
      ? 'success'
      : detectionHealth === 'Detection Error'
        ? 'error'
        : 'warning';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-700/60 pb-3">
        <Camera className="h-5 w-5 text-emerald-400" />
        <h2 className="text-lg font-semibold text-slate-100">
          Face Detection
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatusCard
          label="Detection"
          value={faceDetected ? 'Face Detected' : 'Face Not Detected'}
          status={detectionStatus}
          subtitle={`Confidence: ${confidence}%`}
        />
        <StatusCard
          label="Face Count"
          value={String(faceCount)}
          status={faceCount > 0 ? 'success' : 'neutral'}
        />
        <StatusCard
          label="Face Presence"
          value={facePresence}
          status={
            facePresence === 'Single Face'
              ? 'success'
              : facePresence === 'Multiple Faces'
                ? 'warning'
                : 'neutral'
          }
        />
        <StatusCard
          label="Detection Health"
          value={detectionHealth}
          status={healthStatus}
        />
      </div>
    </div>
  );
}
