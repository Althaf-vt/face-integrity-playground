import { DISTANCE_UNKNOWN } from './faceDistance';
import { VISIBILITY_TRACKING_LOST } from './faceVisibility';

export function getTrackingQuality({ landmarks, visibility, distance, meshStatus }) {
  if (
    meshStatus === 'Face Mesh Error' ||
    meshStatus === 'Tracking Lost' ||
    visibility === VISIBILITY_TRACKING_LOST ||
    !landmarks?.length
  ) {
    return 'Lost';
  }

  if (visibility === 'Out Of Frame') {
    return 'Lost';
  }

  if (
    visibility === 'Partially Visible' ||
    distance === DISTANCE_UNKNOWN ||
    distance !== 'Good Distance'
  ) {
    return 'Poor';
  }

  if (landmarks.length >= 468) {
    return 'Excellent';
  }

  return 'Good';
}

export function getTrackingQualityStatus(quality) {
  if (quality === 'Excellent') return 'success';
  if (quality === 'Good') return 'success';
  if (quality === 'Poor') return 'warning';
  return 'error';
}
