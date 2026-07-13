import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CameraView({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fallbackRef = useRef(null);
  const [status, setStatus] = useState('starting'); // starting | streaming | error
  const [capturedFile, setCapturedFile] = useState(null);
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const triggerFallback = useCallback(() => {
    fallbackRef.current?.click();
  }, []);

  const startCamera = useCallback(
    async (mode) => {
      stopStream();
      setStatus('starting');

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('error');
        setTimeout(triggerFallback, 100);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus('streaming');
      } catch (err) {
        setStatus('error');
        // Auto-fallback to native camera input after a brief moment
        setTimeout(triggerFallback, 500);
      }
    },
    [stopStream, triggerFallback]
  );

  useEffect(() => {
    startCamera(facingMode);
    return stopStream;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setCapturedFile(file);
        setCapturedUrl(URL.createObjectURL(file));
      },
      'image/jpeg',
      0.92
    );
  };

  const handleConfirm = () => {
    stopStream();
    if (capturedFile) onCapture(capturedFile);
  };

  const handleRetake = () => {
    setCapturedFile(null);
    setCapturedUrl(null);
    startCamera(facingMode);
  };

  const handleSwitchCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  const handleFallbackChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      stopStream();
      onCapture(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fallbackRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFallbackChange}
      />

      {!capturedUrl ? (
        <>
          <div className="relative flex-1 overflow-hidden">
            {/* Loading state */}
            {status === 'starting' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-white/20 border-t-violet-500 rounded-full animate-spin" />
                <p className="text-white/60 text-sm">카메라 시작 중...</p>
              </div>
            )}

            {/* Error state */}
            {status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
                <p className="text-white/70 text-sm leading-relaxed">
                  카메라를 바로 열 수 없어요.<br />기기 카메라 앱으로 열고 있어요...
                </p>
                <button
                  onClick={triggerFallback}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-heading font-bold text-sm flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  카메라로 촬영하기
                </button>
              </div>
            )}

            {/* Video feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                status === 'streaming' ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent z-10">
              <button
                onClick={() => {
                  stopStream();
                  onClose();
                }}
                className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
              {status === 'streaming' && (
                <button
                  onClick={handleSwitchCamera}
                  className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Focus frame */}
            {status === 'streaming' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-3/4 aspect-square border-2 border-white/25 rounded-2xl" />
              </div>
            )}
          </div>

          {/* Capture button */}
          <div className="bg-black px-8 pt-6 pb-[calc(2rem+env(safe-area-inset-bottom))] flex items-center justify-center">
            <button
              onClick={handleCapture}
              disabled={status !== 'streaming'}
              className="rounded-full border-4 border-white p-1.5 disabled:opacity-30 transition-opacity"
              style={{ width: 76, height: 76 }}
            >
              <div className="w-full h-full rounded-full bg-white" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="relative flex-1 overflow-hidden">
            <img src={capturedUrl} alt="촬영된 사진" className="w-full h-full object-cover" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none"
            />
          </div>

          <div className="bg-black px-6 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex items-center justify-between">
            <button
              onClick={handleRetake}
              className="flex flex-col items-center gap-1 text-white/80"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <span className="text-xs">다시 촬영</span>
            </button>
            <button
              onClick={handleConfirm}
              className="flex flex-col items-center gap-1 text-white"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium">분석하기</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}