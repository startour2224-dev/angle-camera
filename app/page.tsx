"use client";

import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

/**
 * 徹底的に型チェックを強化し、赤線を排除したバージョン
 */
export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const [overlayImg, setOverlayImg] = useState<string | null>(null);
  const [opacity, setOpacity] = useState<number>(0.5);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);

  // 画像読み込み処理
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. filesが存在するか、targetが存在するかを徹底確認
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 2. 1枚目を取り出す
    const firstFile = files;
    
    // 3. これが本当に「ファイル」であることを確認（これで赤線は消えます）
    if (firstFile instanceof File) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setOverlayImg(result);
        }
      };
      // ここで firstFile を使います
      reader.readAsDataURL(firstFile);
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) setCapturedImg(imageSrc);
  }, [webcamRef]);

  const downloadImage = () => {
    if (!capturedImg) return;
    const a = document.createElement('a');
    a.href = capturedImg;
    a.download = 'captured.jpg';
    a.click();
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center font-sans">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-blue-500">Angle Reproducer</h1>
      </header>

      {!capturedImg ? (
        <div className="w-full max-w-md flex flex-col gap-4">
          <div className="relative aspect-[3/4] bg-neutral-900 rounded-3xl overflow-hidden border border-white/10">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "environment" }}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {overlayImg && (
              <img
                src={overlayImg}
                alt="Overlay"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={{ opacity: opacity }}
              />
            )}
          </div>

          <div className="bg-neutral-900 p-6 rounded-3xl flex flex-col gap-4">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="text-sm text-neutral-400"
            />
            
            {overlayImg && (
              <input
                type="range" min="0" max="1" step="0.01" value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
              />
            )}

            <button
              onClick={capture}
              disabled={!overlayImg}
              className={`w-full py-4 rounded-xl font-bold ${
                overlayImg ? "bg-white text-black" : "bg-neutral-800 text-neutral-600"
              }`}
            >
              撮影する
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md flex flex-col gap-4">
          <img src={capturedImg} alt="Result" className="rounded-3xl border border-blue-500" />
          <div className="flex gap-2">
            <button onClick={() => setCapturedImg(null)} className="flex-1 bg-neutral-800 py-4 rounded-xl">戻る</button>
            <button onClick={downloadImage} className="flex-1 bg-blue-600 py-4 rounded-xl font-bold">保存</button>
          </div>
        </div>
      )}
    </div>
  );
}