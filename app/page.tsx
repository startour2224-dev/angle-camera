"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, Download, RefreshCcw, Sun } from 'lucide-react';

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const [overlayImg, setOverlayImg] = useState<string>(""); 
  const [opacity, setOpacity] = useState<number>(0.5);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);

  // 画像読み込み：型エラーを物理的に出さない書き方
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as any;
    if (!target.files || target.files.length === 0) return;

    const file = target.files;
    const reader = new FileReader();

    reader.onload = (event: any) => {
      const result = event.target.result;
      if (result) {
        setOverlayImg(result);
      }
    };
    reader.readAsDataURL(file);
    target.value = ''; // 同じファイルを連続で選べるように
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) setCapturedImg(imageSrc);
    }
  }, []);

  const downloadImage = () => {
    if (!capturedImg) return;
    const a = document.createElement('a');
    a.href = capturedImg;
    a.download = `repro_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center font-sans overflow-hidden">
      <header className="mb-4 text-center">
        <h1 className="text-2xl font-black tracking-tighter text-blue-500 uppercase italic">Angle Reproducer</h1>
      </header>

      {!capturedImg ? (
        <div className="w-full max-w-md flex flex-col items-center gap-4">
          <div className="relative w-full aspect-[3/4] bg-neutral-900 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
            {/* 1. カメラ映像 */}
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "environment" }}
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            
            {/* 2. 重ねる画像（overlayImgがあるときだけ表示） */}
            {overlayImg && (
              <img
                src={overlayImg}
                alt="overlay"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-50"
                style={{ opacity: opacity }}
              />
            )}
            
            {!overlayImg && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                <p className="text-xs text-blue-400 font-bold tracking-widest animate-pulse">SELECT PHOTO</p>
              </div>
            )}
          </div>

          <div className="w-full bg-neutral-900/90 backdrop-blur-2xl p-6 rounded-[2.5rem] flex flex-col gap-6 border border-white/5">
            <div className="flex items-center justify-center">
              <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-2xl cursor-pointer transition-all active:scale-95 w-full justify-center">
                <Upload size={20} />
                <span className="font-bold">昔の写真を読み込む</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <div className="flex flex-col gap-3 bg-black/40 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                <span>Opacity</span>
                <span className="text-blue-400">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range" min="0" max="1" step="0.01" value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <button
              onClick={capture}
              className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${
                overlayImg ? "bg-white text-black shadow-xl" : "bg-neutral-800 text-neutral-600"
              }`}
            >
              <Camera size={28} />
              撮影
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md flex flex-col items-center gap-6">
          <img src={capturedImg} alt="Captured" className="w-full aspect-[3/4] object-cover rounded-[2rem] border border-blue-500/50" />
          <div className="flex gap-4 w-full">
            <button onClick={() => setCapturedImg(null)} className="flex-1 bg-neutral-900 border border-white/10 py-5 rounded-2xl font-bold">RETRY</button>
            <button onClick={downloadImage} className="flex-1 bg-blue-600 py-5 rounded-2xl font-black">SAVE</button>
          </div>
        </div>
      )}
    </div>
  );
}