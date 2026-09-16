import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, X, Check, Image as ImageIcon, QrCode, CreditCard, AlertTriangle, Edit3, ArrowRight } from 'lucide-react';
import jsQR from 'jsqr';
import { createWorker } from 'tesseract.js';
import { ActionOption, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { extractPhoneNumbersFromText, parseQrContent } from '../utils/phoneUtils';

interface ScannerModalProps {
  mode: ActionOption; // 'scan_card' | 'scan_qr' | 'gallery'
  isOpen: boolean;
  onClose: () => void;
  onSelectNumber: (phoneNumber: string) => void;
  language: Language;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  mode,
  isOpen,
  onClose,
  onSelectNumber,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<string>('');
  const [detectedNumbers, setDetectedNumbers] = useState<string[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [editingCandidate, setEditingCandidate] = useState<string>('');
  const [scannedQrResult, setScannedQrResult] = useState<{ raw: string; phoneNumber?: string; isWhatsApp: boolean } | null>(null);
  const [capturedImagePreview, setCapturedImagePreview] = useState<string | null>(null);

  // Stop camera stream utility
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Start Camera
  const startCamera = async () => {
    stopStream();
    setCameraError(null);
    setIsProcessing(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraPermission('denied');
        setCameraError('Camera API is not supported on this device/browser.');
        return;
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(newStream);
      setCameraPermission('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraPermission('denied');
      setCameraError(t.cameraDeniedNotice);
    }
  };

  // Switch between front & back camera
  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // When modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setDetectedNumbers([]);
      setSelectedCandidate('');
      setEditingCandidate('');
      setScannedQrResult(null);
      setCapturedImagePreview(null);

      if (mode === 'scan_card' || mode === 'scan_qr') {
        startCamera();
      }
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen, mode, facingMode]);

  // QR Code Continuous Scanning Loop
  useEffect(() => {
    if (!isOpen || mode !== 'scan_qr' || !stream || scannedQrResult) return;

    let animId: number;
    const scanFrame = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            const parsed = parseQrContent(code.data);
            setScannedQrResult(parsed);
            if (parsed.phoneNumber) {
              setSelectedCandidate(parsed.phoneNumber);
              setEditingCandidate(parsed.phoneNumber);
            }
            return; // Stop scanning once detected
          }
        }
      }
      animId = requestAnimationFrame(scanFrame);
    };

    animId = requestAnimationFrame(scanFrame);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, mode, stream, scannedQrResult]);

  // Capture Card from Video Feed & Run On-Device OCR
  const handleCaptureCard = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImagePreview(dataUrl);

    stopStream();
    await processImageWithOCR(dataUrl);
  };

  // Handle Image File Selection (From Gallery)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setCapturedImagePreview(dataUrl);

      // Check if image is a QR code first
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            const parsed = parseQrContent(code.data);
            setScannedQrResult(parsed);
            if (parsed.phoneNumber) {
              setSelectedCandidate(parsed.phoneNumber);
              setEditingCandidate(parsed.phoneNumber);
              return;
            }
          }
        }
        // If not QR or no phone in QR, proceed to OCR
        await processImageWithOCR(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Run On-Device OCR via Tesseract.js (100% private, client-side only)
  const processImageWithOCR = async (imageSrc: string) => {
    setIsProcessing(true);
    setProcessStatus(t.detectingNumbers);

    try {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(imageSrc);
      await worker.terminate();

      const ocrText = ret.data.text || '';
      const numbers = extractPhoneNumbersFromText(ocrText);

      setDetectedNumbers(numbers);
      if (numbers.length > 0) {
        setSelectedCandidate(numbers[0]);
        setEditingCandidate(numbers[0]);
      }
    } catch (err) {
      console.error('OCR error:', err);
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  // Confirmation to apply the number to the main input
  const handleApplyNumber = () => {
    const numberToApply = editingCandidate || selectedCandidate;
    if (numberToApply) {
      onSelectNumber(numberToApply);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="scanner-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="scanner-modal-container"
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-gray-100 dark:border-gray-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface)] text-[var(--theme-text)] dark:text-white flex items-center justify-center">
              {mode === 'scan_card' && <CreditCard className="w-4 h-4" />}
              {mode === 'scan_qr' && <QrCode className="w-4 h-4" />}
              {mode === 'gallery' && <ImageIcon className="w-4 h-4" />}
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {mode === 'scan_card' && t.scanCard}
              {mode === 'scan_qr' && t.scanQr}
              {mode === 'gallery' && t.fromGallery}
            </h2>
          </div>

          <button
            id="btn-close-scanner"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
          {/* CAMERA FEED VIEW (For Scan Card & Scan QR) */}
          {(mode === 'scan_card' || mode === 'scan_qr') && !capturedImagePreview && !scannedQrResult && (
            <div className="w-full flex flex-col items-center gap-3">
              {cameraPermission === 'denied' ? (
                <div className="w-full p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    {t.cameraAccessNeeded}
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-300 max-w-xs leading-relaxed">
                    {cameraError || t.cameraDeniedNotice}
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-[var(--theme-color)] text-white text-xs font-semibold hover:opacity-95 transition shadow-xs"
                  >
                    {t.retryCamera}
                  </button>
                </div>
              ) : (
                <div className="relative w-full aspect-4/3 sm:aspect-16/10 bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Scanning Overlay Reticle */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                    {mode === 'scan_card' ? (
                      <div className="w-full h-44 sm:h-48 border-2 border-dashed border-[var(--theme-color)] rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[11px] font-medium text-white bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full whitespace-nowrap">
                          {t.scanningCard}
                        </span>
                      </div>
                    ) : (
                      <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-[var(--theme-color)] rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex items-center justify-center">
                        <div className="w-40 h-0.5 bg-[var(--theme-color)] animate-pulse shadow-sm" />
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[11px] font-medium text-white bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full whitespace-nowrap">
                          {t.scanningQr}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Switch Camera Button */}
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    title={t.switchCamera}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition active:scale-95 z-10"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Action buttons for camera mode */}
              {cameraPermission === 'granted' && mode === 'scan_card' && (
                <button
                  type="button"
                  id="btn-capture-card-photo"
                  onClick={handleCaptureCard}
                  className="w-full py-3 px-4 rounded-xl bg-[var(--theme-color)] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition active:scale-98"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t.capturePhoto}</span>
                </button>
              )}
            </div>
          )}

          {/* GALLERY UPLOAD VIEW */}
          {mode === 'gallery' && !capturedImagePreview && !scannedQrResult && (
            <div className="w-full flex flex-col items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="gallery-file-input"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    const fakeEvent = { target: { files: [file] } } as any;
                    handleFileChange(fakeEvent);
                  }
                }}
                className="w-full py-12 px-6 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[var(--theme-color)] dark:hover:border-[var(--theme-color)] rounded-2xl flex flex-col items-center justify-center text-center gap-3 cursor-pointer bg-gray-50/50 dark:bg-gray-800/30 transition group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--theme-surface)] text-[var(--theme-text)] dark:text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {t.dragDropImage}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Supports PNG, JPG, WEBP visiting cards and screenshots
                  </p>
                </div>
                <span className="px-3.5 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold group-hover:bg-[var(--theme-color)] group-hover:text-white transition-colors">
                  {t.uploadImage}
                </span>
              </div>
            </div>
          )}

          {/* PROCESSING SPINNER */}
          {isProcessing && (
            <div className="py-8 flex flex-col items-center gap-3 text-center">
              <div className="w-8 h-8 border-3 border-[var(--theme-color)] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 animate-pulse">
                {processStatus || t.detectingNumbers}
              </p>
            </div>
          )}

          {/* QR CODE SCAN RESULT REVIEW */}
          {scannedQrResult && !isProcessing && (
            <div className="w-full flex flex-col gap-3.5 animate-in fade-in">
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
                <Check className="w-5 h-5 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold">
                    {scannedQrResult.isWhatsApp ? 'WhatsApp QR Code Detected' : 'QR Code Phone Number Extracted'}
                  </div>
                  <div className="font-mono text-[11px] truncate mt-0.5 opacity-80">
                    {scannedQrResult.raw}
                  </div>
                </div>
              </div>

              {scannedQrResult.phoneNumber ? (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {t.editNumberBeforeUse}
                  </label>
                  <input
                    type="tel"
                    value={editingCandidate}
                    onChange={(e) => setEditingCandidate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono text-gray-900 dark:text-white focus:border-[var(--theme-color)] focus:outline-none"
                  />
                </div>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 rounded-xl">
                  This QR code contains non-phone data: <span className="font-mono font-medium">{scannedQrResult.raw}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setScannedQrResult(null);
                    setCapturedImagePreview(null);
                    if (mode !== 'gallery') startCamera();
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Scan Again
                </button>
                {scannedQrResult.phoneNumber && (
                  <button
                    type="button"
                    onClick={handleApplyNumber}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[var(--theme-color)] text-white text-xs font-semibold hover:opacity-95 transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>{t.applyNumber}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* OCR RESULTS (FROM CARD OR GALLERY PHOTO) */}
          {capturedImagePreview && !scannedQrResult && !isProcessing && (
            <div className="w-full flex flex-col gap-3.5 animate-in fade-in">
              {/* Thumbnail of captured image */}
              <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={capturedImagePreview}
                  alt="Captured review"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => {
                    setCapturedImagePreview(null);
                    setDetectedNumbers([]);
                    setSelectedCandidate('');
                    if (mode !== 'gallery') startCamera();
                  }}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[11px] px-2.5 py-1 rounded-lg transition"
                >
                  Retake
                </button>
              </div>

              {/* Detected candidates list */}
              {detectedNumbers.length === 0 ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-center flex flex-col items-center gap-2">
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    {t.noNumbersFound}
                  </p>
                  <div className="w-full flex flex-col gap-1.5 text-left mt-2">
                    <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                      Or type number manually:
                    </span>
                    <input
                      type="tel"
                      value={editingCandidate}
                      onChange={(e) => setEditingCandidate(e.target.value)}
                      placeholder="Type phone number..."
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {t.foundNumbers} ({detectedNumbers.length})
                  </span>
                  <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                    {detectedNumbers.map((num, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedCandidate(num);
                          setEditingCandidate(num);
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-mono text-left transition ${
                          selectedCandidate === num
                            ? 'border-[var(--theme-color)] bg-[var(--theme-surface)] text-[var(--theme-text)] dark:text-white font-semibold'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span>{num}</span>
                        {selectedCandidate === num && <Check className="w-3.5 h-3.5 text-[var(--theme-color)]" />}
                      </button>
                    ))}
                  </div>

                  {/* Manual correction field */}
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                      <Edit3 className="w-3 h-3" />
                      <span>{t.editNumberBeforeUse}</span>
                    </div>
                    <input
                      type="tel"
                      value={editingCandidate}
                      onChange={(e) => setEditingCandidate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-[var(--theme-color)]"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  disabled={!editingCandidate && !selectedCandidate}
                  onClick={handleApplyNumber}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[var(--theme-color)] text-white text-xs font-semibold hover:opacity-95 transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{t.applyNumber}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
