import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import {
  QrCode,
  Camera,
  Flashlight,
  FlashlightOff,
  X,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Scale,
  Sparkles,
  Share2,
  Download,
  ShieldCheck,
  Package,
  Layers,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Phone,
  Upload,
} from 'lucide-react';
import { useEco } from '../../context/EcoContext';
import { CollectionPoint, RecyclingActivityItem } from '../../types/plastic';
import { validateQrToken, submitRecyclingActivityPayload } from '../../services/collectionPointService';

export const QrCheckInModal: React.FC = () => {
  const {
    qrModalOpen,
    setQrModalOpen,
    collectionPoints,
    scans,
    recordVerifiedDropoff,
    activeCheckInPoint,
    setActiveCheckInPoint,
  } = useEco();

  // Step flow: 'scan' | 'point-card' | 'deposit' | 'confirm' | 'success'
  const [step, setStep] = useState<'scan' | 'point-card' | 'deposit' | 'confirm' | 'success'>('scan');
  const [torchOn, setTorchOn] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);
  const [alternativePoint, setAlternativePoint] = useState<CollectionPoint | null>(null);

  // Deposit method: 'scans' | 'photo' | 'manual'
  const [depositMethod, setDepositMethod] = useState<'scans' | 'photo' | 'manual'>('scans');
  const [selectedScanIds, setSelectedScanIds] = useState<string[]>([]);
  const [depositPhoto, setDepositPhoto] = useState<string | null>(null);
  const [manualPlasticType, setManualPlasticType] = useState('PET (#1 Bottles)');
  const [manualResinCode, setManualResinCode] = useState(1);
  const [manualWeightKg, setManualWeightKg] = useState<number>(1.2);

  // Processing & Success State
  const [submitting, setSubmitting] = useState(false);
  const [completedActivity, setCompletedActivity] = useState<any>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  // Camera & Video Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const scanLoopRef = useRef<number | null>(null);
  const isScanningRef = useRef(false);

  // When modal opens or activeCheckInPoint changes
  useEffect(() => {
    if (activeCheckInPoint) {
      setSelectedPoint(activeCheckInPoint);
      setStep('point-card');
    } else if (qrModalOpen) {
      setStep('scan');
      setSelectedPoint(null);
      setErrorMessage(null);
    }
  }, [qrModalOpen, activeCheckInPoint]);

  // Real-time camera QR decoding loop
  const startScanLoop = () => {
    isScanningRef.current = true;
    const scanFrame = () => {
      if (!isScanningRef.current) return;
      const video = videoRef.current;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });
            if (code && code.data && code.data.trim()) {
              isScanningRef.current = false;
              handleValidateCode(code.data.trim());
              return;
            }
          }
        } catch {
          // ignore frame read errors
        }
      }
      scanLoopRef.current = requestAnimationFrame(scanFrame);
    };
    scanLoopRef.current = requestAnimationFrame(scanFrame);
  };

  const stopScanLoop = () => {
    isScanningRef.current = false;
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
  };

  // Start QR Camera Viewfinder
  const startCamera = async () => {
    setErrorMessage(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().then(() => {
          startScanLoop();
        }).catch(() => {});
      }
    } catch {
      // Fallback
    }
  };

  const stopCamera = () => {
    stopScanLoop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (qrModalOpen && step === 'scan' && !activeCheckInPoint) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [qrModalOpen, step, activeCheckInPoint]);

  // Toggle Torch if supported
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    const imageCaptureCapabilities = (track.getCapabilities && (track.getCapabilities() as any).torch) || false;
    if (imageCaptureCapabilities) {
      try {
        await (track as any).applyConstraints({
          advanced: [{ torch: !torchOn }],
        });
        setTorchOn(!torchOn);
      } catch {
        // ignore
      }
    } else {
      setTorchOn(!torchOn);
    }
  };

  // Handle uploaded QR image file
  const handleQrFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleValidateCode(code.data.trim());
          } else {
            setErrorMessage('No readable QR code found in the uploaded image. Please try a clearer screenshot or enter code manually below.');
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Validate scanned QR code or manual entry
  const handleValidateCode = async (codeToTest: string) => {
    setErrorMessage(null);
    setAlternativePoint(null);
    stopCamera();

    const result = await validateQrToken(codeToTest);
    if (result.success && result.collectionPoint) {
      setSelectedPoint(result.collectionPoint);
      setStep('point-card');
    } else {
      setErrorMessage(result.error || 'Invalid or expired collection point QR code.');
      if (result.alternative) {
        setAlternativePoint(result.alternative);
      }
      if (step === 'scan') {
        startCamera();
      }
    }
  };

  // Quick manual submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleValidateCode(manualCode.trim());
  };

  // Build items array from selected deposit method
  const getPreparedDepositItems = (): RecyclingActivityItem[] => {
    if (depositMethod === 'scans') {
      const chosen = scans.filter((s) => selectedScanIds.includes(s.id));
      if (chosen.length === 0) {
        return [{ plasticType: 'PET (#1 Bottles)', resinCode: 1, weightKg: 0.5, source: 'scan' }];
      }
      return chosen.map((s) => ({
        plasticType: s.plasticType || 'PET (#1 Bottles)',
        resinCode: s.resinCode || 1,
        weightKg: parseFloat(((s.items ? s.items.reduce((a, b) => a + (b.approximateWeightGrams || 25), 0) : 250) / 1000).toFixed(2)),
        source: 'scan' as const,
        scanId: s.id,
      }));
    }

    if (depositMethod === 'photo') {
      return [{
        plasticType: selectedPoint?.acceptedMaterials[0] || 'Mixed Clean Plastic',
        resinCode: 1,
        weightKg: 0.8,
        source: 'photo' as const,
      }];
    }

    // Manual weight
    return [{
      plasticType: manualPlasticType,
      resinCode: manualResinCode,
      weightKg: manualWeightKg,
      source: 'manual' as const,
    }];
  };

  // Submit drop-off
  const handleSubmitDeposit = async () => {
    if (!selectedPoint) return;
    setSubmitting(true);
    setErrorMessage(null);

    const items = getPreparedDepositItems();

    // Check device location
    let userLocation: { lat: number; lng: number } | undefined;
    try {
      if ('geolocation' in navigator) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
        });
        userLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
      }
    } catch {
      // location denied or timeout -> will trigger pending-review with lower reward
    }

    const res = await submitRecyclingActivityPayload({
      cpId: selectedPoint.id,
      userLocation,
      items,
      photoBase64: depositPhoto || undefined,
      uid: 'user-curr',
    });

    setSubmitting(false);

    if (res.success && res.activity) {
      setCompletedActivity(res.activity);
      recordVerifiedDropoff(res.activity);
      setStep('success');
    } else {
      setErrorMessage(res.error || 'Failed to record check-in.');
    }
  };

  const handleShareReceipt = () => {
    if (completedActivity && navigator.clipboard) {
      navigator.clipboard.writeText(
        `🌱 Verified Recycling Drop-off at ${completedActivity.cpName}! Recycled ${completedActivity.totalWeightKg}kg of plastic and avoided ${completedActivity.co2SavedKg}kg CO2! Check-in ID: ${completedActivity.id} via PlastiSense.`
      );
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  if (!qrModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-lime-400 p-[1.5px] flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <QrCode className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Collection Point Check-In</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Verified Smart Drop-Off • Anti-Fraud Security
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setQrModalOpen(false);
              setActiveCheckInPoint(null);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Step Machine */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
                {alternativePoint && (
                  <div className="mt-2 pt-2 border-t border-red-900/60 flex items-center justify-between">
                    <span className="text-white font-medium">Nearest Available Alternative: {alternativePoint.name}</span>
                    <button
                      onClick={() => handleValidateCode(alternativePoint.id)}
                      className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px]"
                    >
                      Switch Here
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 1: SCAN QR CODE */}
          {step === 'scan' && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border-2 border-emerald-500/30">
                <video
                  ref={(node) => {
                    videoRef.current = node;
                    if (node && streamRef.current && node.srcObject !== streamRef.current) {
                      node.srcObject = streamRef.current;
                      node.play().catch(() => {});
                    }
                  }}
                  playsInline
                  muted
                  autoPlay
                  className="w-full h-full object-cover"
                />

                {/* Reticle Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                  <div className="relative w-48 h-48 border-2 border-emerald-400/50 rounded-2xl flex items-center justify-center">
                    <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400" />
                    <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400" />
                    <div className="h-0.5 w-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-scanline" />
                  </div>
                  <span className="mt-3 font-mono text-[10px] text-emerald-300 bg-slate-950/80 px-2.5 py-0.5 rounded-full backdrop-blur">
                    Align printed QR code on kiosk or bin
                  </span>
                </div>

                {/* Camera controls: Torch and File Upload */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleQrFileUpload(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1 text-[11px]"
                    title="Upload QR Image from files/gallery"
                  >
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">Upload QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleTorch}
                    className="p-2 rounded-xl bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700 transition"
                    title="Toggle Torch Light"
                  >
                    {torchOn ? <Flashlight className="w-4 h-4 text-amber-400" /> : <FlashlightOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Preset Collection Points (1-Click Test for convenience) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400">
                  Or Test Scan a Demo Collection Point:
                </span>
                <div className="flex flex-wrap gap-2">
                  {collectionPoints.slice(0, 3).map((cp) => (
                    <button
                      key={cp.id}
                      onClick={() => handleValidateCode(cp.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-200 text-xs transition truncate max-w-[240px]"
                    >
                      📍 {cp.name.split(' ')[0]} {cp.name.split(' ')[1]} ({cp.city})
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Code Fallback Form */}
              <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-800 space-y-2">
                <label className="text-xs text-slate-300 font-semibold block">
                  Manual Code / Kiosk URL Fallback:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. cp-blr-01 or paste signed URL"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-400 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                  >
                    Enter
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: COLLECTION POINT CARD */}
          {step === 'point-card' && selectedPoint && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {selectedPoint.type} • VERIFIED INTAKE
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      {selectedPoint.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {selectedPoint.address}
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                    selectedPoint.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}>
                    {selectedPoint.status === 'active' ? 'Open & Ready' : selectedPoint.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Operating Hours</span>
                    <span className="text-slate-300 font-mono flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {selectedPoint.openingHours}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Current Bin Fill Level</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            selectedPoint.fillLevelPercent > 80 ? 'bg-red-400' : selectedPoint.fillLevelPercent > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${selectedPoint.fillLevelPercent}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {selectedPoint.fillLevelPercent}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <span className="text-slate-400 font-semibold block">Accepted Polymers at this Point:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPoint.acceptedMaterials.map((mat, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-medium"
                      >
                        ✓ {mat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep('scan')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Scan Different Point
                </button>

                <button
                  type="button"
                  onClick={() => setStep('deposit')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-slate-950 font-bold text-xs shadow-lg transition flex items-center gap-1.5"
                >
                  <span>Proceed to Deposit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DEPOSIT DECLARATION (Link Scans / Quick Photo / Manual Weight) */}
          {step === 'deposit' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">How would you like to log your deposit?</h4>
                <p className="text-xs text-slate-400">
                  Select items from recent scans, take a quick verification photo, or enter estimated weight.
                </p>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setDepositMethod('scans')}
                  className={`py-2 rounded-lg font-medium transition ${
                    depositMethod === 'scans' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  Link Past Scans ({scans.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDepositMethod('photo')}
                  className={`py-2 rounded-lg font-medium transition ${
                    depositMethod === 'photo' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  Photo Verify
                </button>
                <button
                  type="button"
                  onClick={() => setDepositMethod('manual')}
                  className={`py-2 rounded-lg font-medium transition ${
                    depositMethod === 'manual' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  Manual Weight
                </button>
              </div>

              {/* Method A: Link Scans */}
              {depositMethod === 'scans' && (
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-400">
                    Select the scanned items you are depositing into this bin:
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {scans.slice(0, 8).map((sc) => {
                      const isSelected = selectedScanIds.includes(sc.id);
                      return (
                        <div
                          key={sc.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedScanIds(selectedScanIds.filter((id) => id !== sc.id));
                            } else {
                              setSelectedScanIds([...selectedScanIds, sc.id]);
                            }
                          }}
                          className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                            isSelected
                              ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="accent-emerald-500 rounded"
                            />
                            <div>
                              <div className="font-semibold">{sc.itemName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{sc.plasticType}</div>
                            </div>
                          </div>
                          <span className="font-mono text-emerald-400 font-bold text-[11px]">
                            {sc.resinSymbol} #{sc.resinCode}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Method B: Quick Photo */}
              {depositMethod === 'photo' && (
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={photoInputRef}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => setDepositPhoto(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }}
                  />

                  {depositPhoto ? (
                    <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-emerald-500/40">
                      <img src={depositPhoto} alt="Deposit preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setDepositPhoto(null)}
                        className="absolute top-2 right-2 px-2 py-1 rounded bg-black/80 text-white text-[10px]"
                      >
                        Retake
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => photoInputRef.current?.click()}
                      className="w-full h-36 rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-400 flex flex-col items-center justify-center p-4 cursor-pointer text-center bg-slate-950"
                    >
                      <Camera className="w-7 h-7 text-emerald-400 mb-1" />
                      <span className="text-xs font-bold text-white">Snap Photo of Deposit Items</span>
                      <span className="text-[10px] text-slate-400">Gemini will verify intake acceptance against bin criteria</span>
                    </div>
                  )}
                </div>
              )}

              {/* Method C: Manual Weight */}
              {depositMethod === 'manual' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Plastic Type</label>
                    <select
                      value={manualPlasticType}
                      onChange={(e) => {
                        setManualPlasticType(e.target.value);
                        if (e.target.value.includes('PET')) setManualResinCode(1);
                        else if (e.target.value.includes('HDPE')) setManualResinCode(2);
                        else if (e.target.value.includes('PP')) setManualResinCode(5);
                        else setManualResinCode(4);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                    >
                      <option value="PET (#1 Bottles)">PET (#1 Bottles / Containers)</option>
                      <option value="HDPE (#2 Jugs)">HDPE (#2 Milk & Detergent Jugs)</option>
                      <option value="PP (#5 Tubs)">PP (#5 Meal Boxes & Takeaway Tubs)</option>
                      <option value="LDPE (#4 Film)">LDPE (#4 Clean Packaging Films)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Estimated Deposit Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="25"
                      value={manualWeightKg}
                      onChange={(e) => setManualWeightKg(parseFloat(e.target.value) || 0.5)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Anti-fraud notice: deposits above 20kg are automatically routed to manual operator review.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep('point-card')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => setStep('confirm')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-slate-950 font-bold text-xs shadow-lg transition flex items-center gap-1.5"
                >
                  <span>Review Summary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION SUMMARY */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white">Deposit Activity Summary</h4>

                <div className="space-y-2 text-xs divide-y divide-slate-800/80">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Target Collection Point:</span>
                    <strong className="text-emerald-400">{selectedPoint?.name}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Total Declared Weight:</span>
                    <strong className="text-white font-mono">
                      {getPreparedDepositItems().reduce((a, b) => a + b.weightKg, 0).toFixed(2)} kg
                    </strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">CO2 Emissions Saved:</span>
                    <strong className="text-teal-300 font-mono">
                      +{(getPreparedDepositItems().reduce((a, b) => a + b.weightKg, 0) * 0.9).toFixed(2)} kg CO₂e
                    </strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Points to be Earned:</span>
                    <strong className="text-lime-300 font-mono">
                      +{Math.round(150 + getPreparedDepositItems().reduce((a, b) => a + b.weightKg, 0) * 60)} XP
                    </strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Location Geofence Check:</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> 100m Proximity Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep('deposit')}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Back
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitDeposit}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-slate-950 font-bold text-xs shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying with AI...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Deposit Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS & VERIFIED RECEIPT */}
          {step === 'success' && completedActivity && (
            <div className="space-y-5 text-center py-2 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  VERIFIED RECYCLING ACTIVITY
                </span>
                <h3 className="text-xl font-display font-extrabold text-white">
                  Drop-Off Verified & Credited!
                </h3>
                <p className="text-xs text-slate-300">
                  {completedActivity.pointsAwarded} XP awarded and {completedActivity.carbonCreditsAwarded} kg CO₂ added to your Carbon Wallet.
                </p>
              </div>

              {/* Receipt Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-[11px] text-slate-400 font-mono">Activity ID: {completedActivity.id}</span>
                  <span className="text-[11px] font-mono text-emerald-400">Status: {completedActivity.verificationStatus.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Location:</span>
                  <span className="font-semibold text-white">{completedActivity.cpName}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Total Diverted:</span>
                  <span className="font-mono font-bold text-emerald-400">{completedActivity.totalWeightKg} kg</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>AI Intake Match:</span>
                  <span className="text-slate-200">{completedActivity.aiVerification?.notes}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleShareReceipt}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{copiedShare ? 'Copied Receipt!' : 'Share "I Recycled" Card'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQrModalOpen(false);
                    setActiveCheckInPoint(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 text-xs font-bold transition shadow"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
