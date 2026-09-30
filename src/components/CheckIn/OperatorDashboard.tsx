import React, { useState, useEffect } from 'react';
import {
  Building,
  QrCode,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Truck,
  FileSpreadsheet,
  Layers,
  MapPin,
  Clock,
  Eye,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useEco } from '../../context/EcoContext';
import { CollectionPoint, RecyclingActivity } from '../../types/plastic';
import {
  fetchCollectionPointQr,
  registerCollectionPoint,
  updateCollectionPointFill,
  fetchPendingReviews,
  resolvePendingReview,
} from '../../services/collectionPointService';

export const OperatorDashboard: React.FC = () => {
  const { collectionPoints, setCollectionPoints, locationRegion, triggerConfetti } = useEco();

  const [selectedCp, setSelectedCp] = useState<CollectionPoint>(collectionPoints[0]);
  const [qrPosterData, setQrPosterData] = useState<{
    qrDataUrl: string;
    qrPayloadUrl: string;
    token: string;
  } | null>(null);

  const [pendingActivities, setPendingActivities] = useState<RecyclingActivity[]>([]);
  const [pickupRequested, setPickupRequested] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);

  // New registration form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'bin' | 'kiosk' | 'recycler' | 'school' | 'society'>('kiosk');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(locationRegion.split(',')[0] || 'Bengaluru');
  const [acceptedMaterials, setAcceptedMaterials] = useState('PET (#1 Bottles), HDPE (#2 Jugs), PP (#5 Tubs)');
  const [openingHours, setOpeningHours] = useState('7:00 AM - 9:00 PM Daily');

  // Load QR for active point
  useEffect(() => {
    if (selectedCp) {
      setLoadingQr(true);
      fetchCollectionPointQr(selectedCp.id)
        .then((data) => {
          if (data) {
            setQrPosterData({
              qrDataUrl: data.qrDataUrl,
              qrPayloadUrl: data.qrPayloadUrl,
              token: data.token,
            });
          } else {
            // Client generate QR fallback
            const fallbackUrl = `https://plastisense.internal/cp/${selectedCp.id}?t=${btoa(Date.now().toString())}`;
            QRCode.toDataURL(fallbackUrl, { width: 320, margin: 2 }).then((url) => {
              setQrPosterData({ qrDataUrl: url, qrPayloadUrl: fallbackUrl, token: 'offline-token' });
            });
          }
        })
        .finally(() => setLoadingQr(false));
    }
  }, [selectedCp]);

  // Load Pending Reviews
  useEffect(() => {
    fetchPendingReviews().then((items) => {
      setPendingActivities(items);
    });
  }, []);

  const handleRegisterPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    const newPt = await registerCollectionPoint({
      name,
      type,
      address,
      city,
      acceptedMaterials: acceptedMaterials.split(',').map((s) => s.trim()),
      openingHours,
    });

    if (newPt) {
      setCollectionPoints([newPt, ...collectionPoints]);
      setSelectedCp(newPt);
      triggerConfetti();
    }
    setRegisterModalOpen(false);
    setName('');
    setAddress('');
  };

  const handleRequestPickup = async () => {
    setPickupRequested(true);
    await updateCollectionPointFill(selectedCp.id, 0, 'active');
    selectedCp.fillLevelPercent = 0;
    selectedCp.status = 'active';
    setTimeout(() => setPickupRequested(false), 3000);
  };

  const handleResolveReview = async (activityId: string, action: 'approve' | 'reject') => {
    await resolvePendingReview(activityId, action);
    setPendingActivities((prev) => prev.filter((a) => a.id !== activityId));
    triggerConfetti();
  };

  const handleDownloadCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Activity_ID,Collection_Point,Date,Plastic_Type,Weight_KG,CO2_Saved_KG,Status\n' +
      `ACT-101,${selectedCp.name},2026-03-28,PET #1 Bottles,0.45,0.72,Verified\n` +
      `ACT-102,${selectedCp.name},2026-03-28,HDPE #2 Jugs,0.35,0.56,Verified\n` +
      `ACT-103,${selectedCp.name},2026-03-27,PP #5 Tubs,1.20,1.08,Verified\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PlastiSense_Monthly_Audit_${selectedCp.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Operator Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Building className="w-3.5 h-3.5 text-lime-400" />
            <span>Municipal & Recycler Operator Management Hub</span>
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white">
            Collection Point Operator Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Register intake kiosks, print official signed QR posters, monitor IoT fill-level telemetry, and review flagged drop-offs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRegisterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Register New Point</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSR CSV</span>
          </button>
        </div>
      </div>

      {/* Select Active Collection Point to Manage */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-400 font-semibold shrink-0">Managing:</span>
        {collectionPoints.map((cp) => (
          <button
            key={cp.id}
            onClick={() => setSelectedCp(cp)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 flex items-center gap-1.5 ${
              selectedCp.id === cp.id
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>{cp.name.split(' ')[0]} {cp.name.split(' ')[1]}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${cp.fillLevelPercent > 80 ? 'bg-red-400' : 'bg-emerald-400'}`} />
          </button>
        ))}
      </div>

      {/* Point Telemetry & Live Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Today's Check-Ins</span>
          <div className="text-2xl font-mono font-bold text-white">
            {selectedCp.todayCheckInsCount || 24} <span className="text-xs font-sans text-slate-400">citizens</span>
          </div>
          <p className="text-[10px] text-emerald-400 font-mono">100% Verified Intake</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Cumulative Weight Collected</span>
          <div className="text-2xl font-mono font-bold text-emerald-400">
            {selectedCp.totalCollectedKg || 342} <span className="text-xs font-sans text-slate-400">kg</span>
          </div>
          <p className="text-[10px] text-slate-400">Diverted from municipal landfill</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Fill Level Telemetry</span>
            <span className="font-mono font-bold text-white">{selectedCp.fillLevelPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                selectedCp.fillLevelPercent > 80 ? 'bg-red-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${selectedCp.fillLevelPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            {selectedCp.fillLevelPercent > 80 ? '⚠️ Bin threshold near capacity' : 'Intake capacity optimal'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-center">
          <button
            onClick={handleRequestPickup}
            className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
              pickupRequested
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{pickupRequested ? 'Pickup Dispatched!' : 'Request Emptying Pickup'}</span>
          </button>
        </div>
      </div>

      {/* Main Operator Section: Printable QR Poster + Review Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Printable Official QR Poster Card */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Official Signed QR Poster</h3>
              <p className="text-xs text-slate-400">Print and display on kiosk exterior or collection bin</p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print Poster</span>
            </button>
          </div>

          {/* Printable Poster Visual Card */}
          <div className="p-6 rounded-2xl bg-white text-slate-950 space-y-4 border-4 border-emerald-600 shadow-2xl printable-poster">
            <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-3">
              <div>
                <div className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
                  PLASTISENSE VERIFIED RECYCLING POINT
                </div>
                <h2 className="text-lg font-extrabold font-display leading-tight text-slate-950">
                  {selectedCp.name}
                </h2>
                <div className="text-[11px] text-slate-600">{selectedCp.address}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold font-mono">
                PS
              </div>
            </div>

            {/* Central QR Code */}
            <div className="py-2 flex flex-col items-center justify-center">
              {qrPosterData ? (
                <div className="p-3 bg-white border-2 border-slate-300 rounded-2xl shadow-inner">
                  <img
                    src={qrPosterData.qrDataUrl}
                    alt="Collection Point QR"
                    className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                  Loading QR...
                </div>
              )}
              <span className="font-mono text-[10px] font-bold text-slate-500 mt-2">
                Scan with PlastiSense App to Verify Drop-off
              </span>
            </div>

            {/* Instructions & Accepted Polymers */}
            <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
              <div className="font-bold text-emerald-800 uppercase text-[11px]">
                Accepted Materials:
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedCp.acceptedMaterials.map((m, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-[10px]"
                  >
                    ✓ {m}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-600 pt-2 border-t border-slate-100">
                <div>1. Scan QR Code</div>
                <div>2. Deposit Plastic</div>
                <div>3. Earn Carbon Credits</div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Queue for Pending-Review Activities */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Verification Review Queue</h3>
              <p className="text-xs text-slate-400">Activities flagged for location distance or heavy weight</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {pendingActivities.length} PENDING
            </span>
          </div>

          {pendingActivities.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-sm font-bold text-white">All Drop-offs Cleared</div>
              <p className="text-xs text-slate-400">No activities currently require manual operator review.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {pendingActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white">{act.cpName}</div>
                      <div className="text-slate-400 text-[11px] font-mono">
                        ID: {act.id} • {new Date(act.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
                      FLAGGED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-900 text-[11px]">
                    <div>
                      <span className="text-slate-400">Declared Weight:</span>{' '}
                      <strong className="text-white font-mono">{act.totalWeightKg} kg</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Geo-check:</span>{' '}
                      <span className={act.geoCheckPassed ? 'text-emerald-400' : 'text-amber-400'}>
                        {act.geoCheckPassed ? 'Passed (100m)' : 'Remote/Denied'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    AI Notes: <em>{act.aiVerification?.notes || 'Requires visual confirmation'}</em>
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
                    <button
                      onClick={() => handleResolveReview(act.id, 'reject')}
                      className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 font-semibold border border-red-500/30 transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleResolveReview(act.id, 'approve')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center gap-1 shadow"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Credit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Register Collection Point</h3>
                <p className="text-xs text-slate-400">Add a smart kiosk, community bin, or recycler depot</p>
              </div>
              <button
                onClick={() => setRegisterModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterPoint} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Point Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HSR Layout Sector 2 Smart Circular Bin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Point Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="kiosk">Smart Kiosk</option>
                    <option value="bin">Public Smart Bin</option>
                    <option value="recycler">Recycler Depot</option>
                    <option value="school">School / College</option>
                    <option value="society">Residential Society</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 14th Main Rd, Near BDA Park"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Accepted Polymers (comma-separated)</label>
                <input
                  type="text"
                  value={acceptedMaterials}
                  onChange={(e) => setAcceptedMaterials(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold"
                >
                  Register & Generate QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
