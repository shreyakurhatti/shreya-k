import { CollectionPoint, RecyclingActivity } from '../types/plastic';

export async function fetchCollectionPoints(): Promise<CollectionPoint[]> {
  try {
    const res = await fetch('/api/collection-points');
    const data = await res.json();
    return data.collectionPoints || [];
  } catch (err) {
    console.error('Failed to fetch collection points:', err);
    return [];
  }
}

export async function validateQrToken(tokenOrCode: string): Promise<{ success: boolean; collectionPoint?: CollectionPoint; error?: string; alternative?: CollectionPoint }> {
  try {
    const res = await fetch('/api/collection-points/validate-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenOrCode.includes('cp-') ? { code: tokenOrCode } : { token: tokenOrCode }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Invalid or expired QR code', alternative: data.alternative };
    }
    return { success: true, collectionPoint: data.collectionPoint };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error validating QR token' };
  }
}

export async function submitRecyclingActivityPayload(payload: {
  cpId: string;
  userLocation?: { lat: number; lng: number };
  items: Array<{ plasticType: string; resinCode: number; weightKg: number; source: 'scan' | 'photo' | 'manual'; scanId?: string }>;
  photoBase64?: string;
  deviceFingerprintHash?: string;
  uid?: string;
}): Promise<{ success: boolean; activity?: RecyclingActivity; collectionPoint?: CollectionPoint; error?: string }> {
  try {
    const res = await fetch('/api/collection-points/submit-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to record recycling activity' };
    }
    return { success: true, activity: data.activity, collectionPoint: data.collectionPoint };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error submitting activity' };
  }
}

export async function fetchCollectionPointQr(cpId: string): Promise<{
  qrDataUrl: string;
  qrPayloadUrl: string;
  token: string;
  collectionPoint: CollectionPoint;
} | null> {
  try {
    const res = await fetch(`/api/collection-points/${cpId}/qr`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to get QR code for collection point:', err);
    return null;
  }
}

export async function registerCollectionPoint(pointData: Partial<CollectionPoint>): Promise<CollectionPoint | null> {
  try {
    const res = await fetch('/api/collection-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pointData),
    });
    const data = await res.json();
    return data.collectionPoint || null;
  } catch (err) {
    console.error('Failed to register collection point:', err);
    return null;
  }
}

export async function updateCollectionPointFill(cpId: string, fillLevelPercent: number, status?: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/collection-points/${cpId}/fill-level`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fillLevelPercent, status }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchPendingReviews(): Promise<RecyclingActivity[]> {
  try {
    const res = await fetch('/api/collection-points/pending-reviews');
    const data = await res.json();
    return data.pendingActivities || [];
  } catch {
    return [];
  }
}

export async function resolvePendingReview(activityId: string, action: 'approve' | 'reject', reason?: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/collection-points/pending-reviews/${activityId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
