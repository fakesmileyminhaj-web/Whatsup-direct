import React, { useState, useRef } from 'react';
import { Image as ImageIcon, UploadCloud, RefreshCw, Check, Edit3, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';
import { createWorker } from 'tesseract.js';
import { TRANSLATIONS } from '../data/translations';
import { extractPhoneNumbersFromText, parseQrContent } from '../utils/phoneUtils';

interface GallerySectionProps {
  onApplyNumber: (phoneNumber: string) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  onApplyNumber,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedCandidates, setDetectedCandidates] = useState<string[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [editingCandidate, setEditingCandidate] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setImagePreview(null);
    setIsProcessing(false);
    setDetectedCandidates([]);
    setSelectedCandidate('');
    setEditingCandidate('');
    setStatusMessage(null);
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatusMessage('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      analyzeImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const analyzeImage = async (dataUrl: string) => {
    setIsProcessing(true);
    setStatusMessage(TRANSLATIONS.analyzingImage);
    setDetectedCandidates([]);
    setSelectedCandidate('');

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = dataUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const allFound: Set<string> = new Set();

      // 1. Try QR code scan on image first
      try {
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (code && code.data) {
          const parsed = parseQrContent(code.data);
          if (parsed.phoneNumber) {
            allFound.add(parsed.phoneNumber);
          }
        }
      } catch (qrErr) {
        console.warn('QR check failed on image', qrErr);
      }

      // 2. Try OCR text extraction
      try {
        const worker = await createWorker('eng');
        const ret = await worker.recognize(canvas);
        await worker.terminate();

        const ocrNumbers = extractPhoneNumbersFromText(ret.data.text);
        ocrNumbers.forEach((n) => allFound.add(n));
      } catch (ocrErr) {
        console.warn('OCR error on image', ocrErr);
      }

      const list = Array.from(allFound);
      if (list.length > 0) {
        setDetectedCandidates(list);
        setSelectedCandidate(list[0]);
        setEditingCandidate(list[0]);
        setStatusMessage(null);
      } else {
        setStatusMessage(TRANSLATIONS.noNumbersFound);
      }
    } catch (err: any) {
      console.warn('Analysis error:', err);
      setStatusMessage(TRANSLATIONS.noNumbersFound);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmCandidate = () => {
    const finalNumber = editingCandidate.trim() || selectedCandidate.trim();
    if (finalNumber) {
      onApplyNumber(finalNumber);
    }
  };

  return (
    <div id="gallery-scan-section" className="flex flex-col gap-3.5 w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Drop Zone Card */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="relative w-full rounded-2xl border-2 border-dashed border-gray-200 bg-white hover:border-[var(--theme-border)] hover:bg-[var(--theme-surface)]/30 transition-all p-6 flex flex-col items-center justify-center text-center gap-3 cursor-pointer shadow-xs min-h-[190px]"
      >
        {imagePreview ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 shadow-xs relative">
              <img
                src={imagePreview}
                alt="Selected preview"
                className="w-full h-full object-cover"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-[var(--theme-text)] font-medium underline">
                Choose another
              </span>
              <span className="text-gray-300">•</span>
              <button
                type="button"
                id="btn-cancel-gallery-image"
                onClick={handleCancel}
                className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-[var(--theme-surface)] flex items-center justify-center text-[var(--theme-color)]">
              <UploadCloud className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-gray-900">
                {TRANSLATIONS.uploadPrompt}
              </span>
              <span className="text-[11px] text-gray-400">
                {TRANSLATIONS.dragDropPrompt}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div className="p-3 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)] font-medium flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{statusMessage}</span>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="text-[11px] underline text-[var(--theme-text)] font-medium cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Candidate Numbers & Confirmation */}
      {detectedCandidates.length > 0 && (
        <div
          id="gallery-candidates-panel"
          className="p-3.5 rounded-2xl border border-[var(--theme-border)] bg-white shadow-xs flex flex-col gap-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-900">
              {TRANSLATIONS.foundNumbers}
            </span>
            <button
              type="button"
              id="btn-cancel-gallery-candidates"
              onClick={handleCancel}
              className="text-xs text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Multiple Candidates Selection */}
          {detectedCandidates.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {detectedCandidates.map((cand, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedCandidate(cand);
                    setEditingCandidate(cand);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                    selectedCandidate === cand
                      ? 'bg-[var(--theme-color)] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cand}
                </button>
              ))}
            </div>
          )}

          {/* Edit input */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="gallery-candidate-input"
              className="text-[11px] font-medium text-gray-500"
            >
              {TRANSLATIONS.editNumber}
            </label>
            <div className="relative flex items-center">
              <input
                id="gallery-candidate-input"
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
            id="btn-confirm-gallery-number"
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
