import { ScanFace, Circle } from 'lucide-react';
import WebcamFeed from '../components/WebcamFeed';
import DiagnosticsPanel, { FaceDetectionMetrics } from '../components/DiagnosticsPanel';
import { useCamera } from '../hooks/useCamera';
import { useFaceDetection } from '../hooks/useFaceDetection';

function getSystemStatus(isConnected, detectionHealth, error) {
  if (error) return { label: 'Error', color: 'text-red-400', dot: 'bg-red-400' };
  if (!isConnected) return { label: 'Initializing', color: 'text-amber-400', dot: 'bg-amber-400' };
  if (detectionHealth === 'Detection Running') {
    return { label: 'Operational', color: 'text-emerald-400', dot: 'bg-emerald-400' };
  }
  if (detectionHealth === 'Detection Error') {
    return { label: 'Detection Error', color: 'text-red-400', dot: 'bg-red-400' };
  }
  return { label: 'Standby', color: 'text-slate-400', dot: 'bg-slate-400' };
}

export default function Dashboard() {
  const {
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
  } = useCamera();

  const {
    detections,
    confidence,
    faceCount,
    faceDetected,
    facePresence,
    detectionHealth,
    detectionFps,
  } = useFaceDetection({
    getVideoElement,
    isCameraConnected: isConnected,
  });

  const systemStatus = getSystemStatus(isConnected, detectionHealth, error);

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/30">
              <ScanFace className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-50">
                Face Integrity Playground
              </h1>
              <p className="text-sm text-slate-400">
                Phase 1 &amp; 2 — Camera &amp; Face Detection R&amp;D
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/50 px-4 py-2">
            <Circle className={`h-2.5 w-2.5 fill-current ${systemStatus.dot} ${systemStatus.color}`} />
            <span className="text-sm text-slate-400">System Status:</span>
            <span className={`text-sm font-semibold ${systemStatus.color}`}>
              {systemStatus.label}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3">
            <div className="mb-4">
              <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
                Webcam Feed
              </h2>
            </div>
            <WebcamFeed
              webcamRef={webcamRef}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              onLoadedMetadata={updateResolutionFromVideo}
              error={error}
              detections={detections}
              resolution={resolution}
            />
          </section>

          <aside className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-5">
              <DiagnosticsPanel
                browserName={browserName}
                isConnected={isConnected}
                permissionStatus={permissionStatus}
                fps={detectionFps}
                resolution={resolution}
              />
            </div>

            <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-5">
              <FaceDetectionMetrics
                faceDetected={faceDetected}
                confidence={confidence}
                faceCount={faceCount}
                facePresence={facePresence}
                detectionHealth={detectionHealth}
              />
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-600">
        Face Integrity Playground — Research &amp; Experimentation Only
      </footer>
    </div>
  );
}
