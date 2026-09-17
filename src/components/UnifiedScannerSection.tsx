import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Check, Edit3, AlertCircle, ScanLine, ArrowRight } from 'lucide-react';
import jsQR from 'jsqr';
import { createWorker } from 'tesseract.js';
import { TRANSLATIONS } from '../data/translations';
import { extractPhoneNumbersFromText, parseQrContent } from '../utils/phoneUtils';

interface UnifiedScannerSectionProps {
  isActive: boolean;
  onApplyNumber: (phoneNumber: string) => void;
}

export const UnifiedScannerSection: React.FC<UnifiedScannerSectionProps> = ({
  isActive,
  onApplyNumber,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [detectedCandidates, setDetectedCandidates] = useState<string[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [editingCandidate, setEditingCandidate] = useState<string>('');
  const [detectionNotice, setDetectionNotice] = useState<string | null>(null);

  // Stop camera helper
  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Start Camera Helper
  const startCameraStream = async () => {
    stopCameraStream();
    setCameraError(null);
    setDetectionNotice(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera is not supported on this device/browser.');
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
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError(TRANSLATIONS.cameraDeniedNotice);
    }
  };

  // Switch facing mode
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // If facingMode changes while camera is running, restart
  useEffect(() => {
    if (isCameraActive && isActive) {
      startCameraStream();
    }
  }, [facingMode]);

  // Turn off camera when user leaves the Scan tab
  useEffect(() => {
    if (!isActive) {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [isActive]);

  // Continuous QR Code Scanning Loop
  useEffect(() => {
    if (!isActive || !isCameraActive || !stream || selectedCandidate) return;

    let animId: number;
    const scanQrFrame = () => {
      if (
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
      ) {
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
            if (parsed.phoneNumber) {
              setDetectedCandidates([parsed.phoneNumber]);
              setSelectedCandidate(parsed.phoneNumber);
              setEditingCandidate(parsed.phoneNumber);
              setDetectionNotice('WhatsApp QR Code Detected!');
              return;
            }
          }
        }
      }
      animId = requestAnimationFrame(scanQrFrame);
    };

    animId = requestAnimationFrame(scanQrFrame);
    return () => cancelAnimationFrame(animId);
  }, [isActive, isCameraActive, stream, selectedCandidate]);

  // Capture frame & Run On-Device OCR
  const handleCaptureOcr = async () => {
    if (!videoRef.current || isProcessingOcr) return;

    setIsProcessingOcr(true);
    setDetectionNotice(TRANSLATIONS.analyzingImage);
    setDetectedCandidates([]);
    setSelectedCandidate('');

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create canvas context');

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Run Tesseract OCR on canvas
      const worker = await createWorker('eng');
      const ret = await worker.recognize(canvas);
      await worker.terminate();

      const text = ret.data.text;
      const foundNumbers = extractPhoneNumbersFromText(text);

      if (foundNumbers.length > 0) {
        setDetectedCandidates(foundNumbers);
        setSelectedCandidate(foundNumbers[0]);
        setEditingCandidate(foundNumbers[0]);
        setDetectionNotice(null);
      } else {
        setDetectionNotice(TRANSLATIONS.noNumbersFound);
      }
    } catch (err: any) {
      console.warn('OCR error:', err);
      setDetectionNotice(TRANSLATIONS.noNumbersFound);
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const handleConfirmCandidate = () => {
    const finalNumber = editingCandidate.trim() || selectedCandidate.trim();
    if (finalNumber) {
      stopCameraStream();
      onApplyNumber(finalNumber);
    }
  };

  const handleCancelOperation = () => {
    setIsProcessingOcr(false);
    setDetectedCandidates([]);
    setSelectedCandidate('');
    setEditingCandidate('');
    setDetectionNotice(null);
  };

  return (
    <div id="unified-scan-section" className="flex flex-col gap-3.5 w-full">
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Camera Viewport Card */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 shadow-xs flex items-center justify-center">
        {/* Video feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
        />

        {/* Minimalist framing reticle (No distracting text overlays) */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            <div className="w-3/4 h-3/4 max-w-[280px] max-h-[220px] border border-white/20 rounded-2xl relative shadow-sm">
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-[var(--theme-color)] rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-[var(--theme-color)] rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-[var(--theme-color)] rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-[var(--theme-color)] rounded-br-lg" />
            </div>
          </div>
        )}

        {/* Natural ready state / starting indication (No fake paused overlay) */}
        {!isCameraActive && !cameraError && (
          <div className="flex flex-col items-center justify-center p-6 text-center gap-2 text-white">
            <RefreshCw className="w-6 h-6 animate-spin text-[var(--theme-color)]" />
            <span className="text-xs text-gray-300">Starting camera...</span>
          </div>
        )}

        {/* Camera Error Message */}
        {cameraError && (
          <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center p-6 text-center gap-2 text-white">
            <AlertCircle className="w-8 h-8 text-amber-400" />
            <span className="text-xs text-gray-200">{cameraError}</span>
            <button
              type="button"
              onClick={startCameraStream}
              className="mt-2 px-4 py-2 rounded-xl bg-[var(--theme-color)] text-white text-xs font-medium cursor-pointer"
            >
              {TRANSLATIONS.retryCamera}
            </button>
          </div>
        )}

        {/* Camera Switch Control (Positioned in BOTTOM-RIGHT CORNER) */}
        {isCameraActive && (
          <button
            type="button"
            id="btn-switch-camera"
            onClick={toggleFacingMode}
            title={TRANSLATIONS.switchCamera}
            aria-label={TRANSLATIONS.switchCamera}
            className="absolute bottom-3 right-3 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition active:scale-90 cursor-pointer shadow-md backdrop-blur-xs"
          >
            <RefreshCw className="w-4 h-4 stroke-[2]" />
          </button>
        )}
      </div>

      {/* Camera Action Controls */}
      {isCameraActive && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-capture-ocr"
            onClick={handleCaptureOcr}
            disabled={isProcessingOcr}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[var(--theme-color)] hover:opacity-95 active:scale-[0.98] shadow-xs transition cursor-pointer ${
              isProcessingOcr ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            {isProcessingOcr ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ScanLine className="w-4 h-4 stroke-[2]" />
            )}
            <span>
              {isProcessingOcr
                ? TRANSLATIONS.analyzingImage
                : TRANSLATIONS.captureOcrText}
            </span>
          </button>

          {/* Cancel button if OCR is processing or candidate numbers are displayed */}
          {(isProcessingOcr || detectedCandidates.length > 0) && (
            <button
              type="button"
              id="btn-cancel-scan-operation"
              onClick={handleCancelOperation}
              className="py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium transition active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            id="btn-stop-camera"
            onClick={stopCameraStream}
            className="py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium transition active:scale-95 cursor-pointer"
          >
            {TRANSLATIONS.stopCamera}
          </button>
        </div>
      )}

      {/* Notice / Status Message */}
      {detectionNotice && (
        <div className="p-3 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)] font-medium flex items-center justify-between gap-2 animate-in fade-in">
          <span>{detectionNotice}</span>
          <button
            type="button"
            onClick={handleCancelOperation}
            className="text-[11px] underline text-[var(--theme-text)] font-medium cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Detected Candidates & Confirmation Panel */}
      {detectedCandidates.length > 0 && (
        <div
          id="detected-numbers-panel"
          className="p-3.5 rounded-2xl border border-[var(--theme-border)] bg-white shadow-xs flex flex-col gap-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-900">
              {TRANSLATIONS.foundNumbers}
            </span>
            <button
              type="button"
              id="btn-cancel-candidates"
              onClick={handleCancelOperation}
              className="text-xs text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Multiple Candidates selection chips */}
          {detectedCandidates.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {detectedCandidates.map((candidate, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedCandidate(candidate);
                    setEditingCandidate(candidate);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                    selectedCandidate === candidate
                      ? 'bg-[var(--theme-color)] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {candidate}
                </button>
              ))}
            </div>
          )}

          {/* Edit input for candidate */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="ocr-candidate-input"
              className="text-[11px] font-medium text-gray-500"
            >
              {TRANSLATIONS.editNumber}
            </label>
            <div className="relative flex items-center">
              <input
                id="ocr-candidate-input"
                type="tel"
                value={editingCandidate}
                onChange={(e) => setEditingCandidate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-[var(--theme-color)]"
              />
              <Edit3 className="w-4 h-4 text-gray-400 absolute right-3 pointer-events-none" />
            </div>
          </div>

          {/* Confirm & Use Button */}
          <button
            type="button"
            id="btn-confirm-scanned-number"
            onClick={handleConfirmCandidate}
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--theme-color)] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-95 active:scale-98 transition shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{TRANSLATIONS.confirmNumber}</span>
          </button>
        </div>
      )}
    </div>
  );
};
