import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Layers,
  CheckCircle,
  HelpCircle,
  Zap,
  SwitchCamera,
  Smartphone,
  Eye,
} from 'lucide-react';
import { useEco } from '../../context/EcoContext';
import { scanWasteImage } from '../../services/geminiService';
import { TEST_SAMPLE_PRESETS } from '../../data/mockData';
import { ScanResult } from '../../types/plastic';

interface ScannerViewProps {
  onScanComplete?: (result: ScanResult) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({ onScanComplete }) => {
  const { addScan, locationRegion, language, t } = useEco();

  const [scanMode, setScanMode] = useState<'single' | 'pile'>('single');
  const [activeTabInput, setActiveTabInput] = useState<'camera' | 'upload' | 'presets'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shutterFlash, setShutterFlash] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Attach stream to video element safely
  const attachStreamToVideo = useCallback((stream: MediaStream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current
        .play()
        .then(() => {
          setCameraActive(true);
          setCameraError(null);
        })
        .catch((playErr) => {
          console.warn('Video play caught:', playErr);
          // Auto-play might need user gesture, but muted helps bypass
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});
          }
          setCameraActive(true);
        });
    }
  }, []);

  // Robust multi-constraint Camera Starter
  const startCamera = useCallback(async () => {
    setCameraError(null);

    // Stop existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError('WebRTC camera is not supported or restricted in this browser context. Please use "Snap with Phone Camera" or "Upload Image".');
      setCameraActive(false);
      return;
    }

    // Tier 1: Try ideal facingMode
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      attachStreamToVideo(stream);
      return;
    } catch (err1: any) {
      console.warn('Tier 1 camera constraint failed, attempting Tier 2:', err1);
    }

    // Tier 2: Try basic facingMode without resolution constraints
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      streamRef.current = stream;
      attachStreamToVideo(stream);
      return;
    } catch (err2: any) {
      console.warn('Tier 2 camera constraint failed, attempting Tier 3 fallback:', err2);
    }

    // Tier 3: Universal fallback (any available camera on device)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      attachStreamToVideo(stream);
    } catch (err3: any) {
      console.error('All camera attempts failed:', err3);
      setCameraError(
        'Camera permission was denied or no camera device was detected. You can click "Snap with Phone Camera", upload a photo, or choose from our 1-click test samples.'
      );
      setCameraActive(false);
    }
  }, [facingMode, attachStreamToVideo]);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Manage camera lifecycle
  useEffect(() => {
    if (activeTabInput === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTabInput, startCamera, stopCamera]);

  // Flip Camera between back and front
  const toggleFlipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Capture from live camera
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Trigger visual shutter flash
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPreviewImage(dataUrl);
    analyzeImagePayload(dataUrl);
  };

  // Handle uploaded file or native camera capture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewImage(dataUrl);
      analyzeImagePayload(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPreviewImage(dataUrl);
        analyzeImagePayload(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Analyze Image using Gemini
  const analyzeImagePayload = async (base64Image: string) => {
    setAnalyzing(true);
    setErrorMessage(null);
    setApiNotice(null);

    const steps = [
      'Scanning polymer spectral signatures...',
      'Recognizing Resin Identification Code (♳-♹)...',
      'Assessing toxic additives & health risk factors...',
      'Computing microbial biodegradation pathways...',
      'Synthesizing circular segregation & upcycle plans...',
    ];

    let stepIndex = 0;
    setAnalysisStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setAnalysisStep(steps[stepIndex]);
      }
    }, 600);

    try {
      const response = await scanWasteImage(base64Image, {
        scanMode,
        location: locationRegion,
        language,
      });

      clearInterval(stepInterval);

      if (response && response.result) {
        if (response.notice) {
          setApiNotice(response.notice);
        }
        addScan(response.result);
        if (onScanComplete) {
          onScanComplete(response.result);
        }
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      console.warn('Scan analysis handled:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Test preset selected
  const handleSelectPreset = async (preset: typeof TEST_SAMPLE_PRESETS[0]) => {
    setPreviewImage(preset.imageUrl);
    try {
      setAnalyzing(true);
      setAnalysisStep('Loading preset specimen into optical pipeline...');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = preset.imageUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 600;
        canvas.height = img.height || 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          analyzeImagePayload(dataUrl);
        }
      };
      img.onerror = () => {
        analyzeImagePayload('data:image/jpeg;base64,/9j/4AAQSkZJRg==');
      };
    } catch {
      setAnalyzing(false);
    }
  };

  return (
    <div id="scanner-section" className="space-y-6">
      {/* Hidden inputs for Native Device Camera and File Upload */}
      <input
        type="file"
        ref={nativeCameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Notice Banner (e.g. smart offline fallback active) */}
      {apiNotice && (
        <div className="p-3.5 rounded-2xl bg-teal-950/70 border border-teal-500/40 text-teal-200 text-xs flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{apiNotice}</span>
          </div>
          <button
            onClick={() => setApiNotice(null)}
            className="text-[10px] text-teal-300 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Scanner Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-md">
        {/* Input Mode Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTabInput('camera')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeTabInput === 'camera'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>

          <button
            onClick={() => setActiveTabInput('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeTabInput === 'upload'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>

          <button
            onClick={() => setActiveTabInput('presets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeTabInput === 'presets'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-lime-300" />
            <span>1-Click Samples</span>
          </button>
        </div>

        {/* Scan Mode Switch (Single Item vs Pile) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Detection Mode:</span>
          <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setScanMode('single')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                scanMode === 'single'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Single Item
            </button>
            <button
              onClick={() => setScanMode('pile')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
                scanMode === 'pile'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Multi-Item Pile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 border-2 border-emerald-500/30 shadow-2xl shadow-emerald-950/50 min-h-[420px] flex flex-col justify-center items-center">
        {/* Visual Shutter Flash */}
        {shutterFlash && (
          <div className="absolute inset-0 z-50 bg-white opacity-80 pointer-events-none transition-opacity duration-200" />
        )}

        {/* LIVE CAMERA MODE */}
        {activeTabInput === 'camera' && (
          <div className="relative w-full h-[450px] bg-black flex items-center justify-center overflow-hidden">
            {/* The video element is ALWAYS mounted to allow stream attachment */}
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
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                cameraActive ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Overlays and HUD when Camera is Active */}
            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
                {/* Top HUD */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur px-3 py-1 rounded-full border border-emerald-500/40 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    LIVE OPTICAL DETECTOR
                  </div>

                  {/* Camera Control Shortcuts (Flip camera & Native Camera) */}
                  <div className="flex items-center gap-2 pointer-events-auto">
                    <button
                      onClick={toggleFlipCamera}
                      className="flex items-center gap-1 bg-slate-950/80 hover:bg-slate-900 backdrop-blur px-2.5 py-1 rounded-lg text-slate-300 border border-slate-700 text-xs transition"
                      title="Flip between front and rear camera"
                    >
                      <SwitchCamera className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Flip</span>
                    </button>

                    <button
                      onClick={() => nativeCameraInputRef.current?.click()}
                      className="flex items-center gap-1 bg-slate-950/80 hover:bg-slate-900 backdrop-blur px-2.5 py-1 rounded-lg text-slate-300 border border-slate-700 text-xs transition"
                      title="Open device native camera app"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-lime-400" />
                      <span className="hidden sm:inline">Native Snap</span>
                    </button>
                  </div>
                </div>

                {/* Center Target Box / Reticle */}
                <div className="relative mx-auto my-auto w-60 h-60 sm:w-72 sm:h-72 border-2 border-emerald-400/40 rounded-2xl flex items-center justify-center">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br" />

                  {/* Scanning Laser Beam */}
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-scanline" />

                  <div className="text-center font-mono text-[11px] text-emerald-300/90 bg-slate-950/70 px-3 py-1 rounded-full backdrop-blur">
                    Center plastic item or resin code
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center justify-center gap-4 pointer-events-auto">
                  <button
                    onClick={captureSnapshot}
                    disabled={analyzing}
                    className="group flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border-4 border-emerald-400 hover:border-lime-300 p-1.5 transition-all shadow-xl shadow-emerald-500/30 active:scale-95 disabled:opacity-50"
                    title="Capture and scan item"
                    aria-label="Capture waste photo"
                  >
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-400 to-lime-300 group-hover:scale-95 transition-transform flex items-center justify-center">
                      <Camera className="w-8 h-8 text-slate-950 stroke-[2.5]" />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Placeholder state when camera is initializing or permission needed */}
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-950">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="text-slate-200 font-bold text-sm">
                  {cameraError ? 'Camera Access Notice' : 'Connecting to Video Camera...'}
                </div>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  {cameraError ||
                    'Please grant camera permission in your browser pop-up. If blocked by browser settings or an iframe, tap "Snap with Phone Camera" below.'}
                </p>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    onClick={startCamera}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Connecting Camera</span>
                  </button>

                  <button
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-lime-400 hover:from-teal-400 hover:to-lime-300 text-slate-950 font-bold text-xs transition shadow"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Snap with Phone Camera</span>
                  </button>

                  <button
                    onClick={() => setActiveTabInput('presets')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                  >
                    Use Sample Presets
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* UPLOAD FILE MODE */}
        {activeTabInput === 'upload' && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="w-full h-[420px] flex flex-col items-center justify-center p-8 text-center cursor-pointer border-2 border-dashed border-emerald-500/30 hover:border-emerald-400 transition bg-slate-900/30"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Drop waste photo here, or browse
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Upload clear photos of bottles, containers, bags, packaging, or mixed curbside waste piles (JPG, PNG, WebP up to 25MB).
            </p>
            <div className="flex gap-2">
              <button className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition">
                Select Photo from Device
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nativeCameraInputRef.current?.click();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5 text-lime-400" />
                <span>Camera Snap</span>
              </button>
            </div>
          </div>
        )}

        {/* 1-CLICK TEST PRESETS MODE */}
        {activeTabInput === 'presets' && (
          <div className="w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Instant Polymer Test Samples</h3>
                <p className="text-xs text-slate-400">
                  Select any specimen to test polymer classification, health risks, and circular upcycling steps.
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/30">
                5 PRE-LOADED SPECIMENS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TEST_SAMPLE_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="group p-3 rounded-2xl bg-slate-900/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer flex items-center gap-3.5"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700 relative">
                    <img
                      src={preset.imageUrl}
                      alt={preset.label}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    <span className="absolute bottom-1 right-1 font-mono text-[10px] font-bold px-1 rounded bg-black/80 text-emerald-300">
                      {preset.resinSymbol}
                    </span>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition truncate">
                      {preset.label}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {preset.description}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="font-mono text-emerald-400">{preset.polymer}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{preset.badge}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOADING & AI ANALYSIS OVERLAY */}
        {analyzing && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-emerald-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-emerald-400">
                <RefreshCw className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div className="text-center space-y-2 max-w-md">
              <div className="font-display text-lg font-bold text-white">
                Multimodal Polymer Analysis in Progress
              </div>
              <p className="text-xs font-mono text-emerald-400 animate-pulse">
                {analysisStep || 'Analyzing visual spectra with Gemini vision model...'}
              </p>
              <div className="w-64 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-300 animate-[pulse_1.5s_ease-in-out_infinite] w-full" />
              </div>
            </div>
          </div>
        )}

        {/* ERROR NOTIFICATION BANNER */}
        {errorMessage && (
          <div className="absolute bottom-4 left-4 right-4 z-40 p-4 rounded-xl bg-red-950/90 border border-red-500/40 text-red-200 text-xs flex items-center justify-between gap-3 shadow-xl backdrop-blur">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="px-2.5 py-1 rounded bg-red-900/60 hover:bg-red-800 text-white font-medium"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
