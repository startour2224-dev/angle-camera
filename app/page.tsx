"use client";

import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, Download, RefreshCcw } from 'lucide-react';

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const [overlayImg, setOverlayImg] = useState<string | null>(null);
  const [opacity, setOpacity] = useState<number>(0.5);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);

  // 1. 過去の写真を読み込む処理
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setOverlayImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 2. 写真を撮影する処理
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) setCapturedImg(imageSrc);
  }, [webcamRef]);

  // 3. 撮影した写真を保存する処理
  const downloadImage = () => {
    if (!capturedImg) return;
    const a = document.createElement('a');
    a.href = capturedImg;
    a.download = 'reproduced-angle.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center justify-center font-sans">
      <h1 className="text-2xl font-bold mb-4">あの場所の角度カメラ</h1>

      {!capturedImg ? (
        <div className="w-full max-w-md flex flex-col items-center gap-4">
          {/* カメラ＆オーバーレイ表示エリア */}
          <div className="relative w-full aspect-[3/4] bg-black rounded-xl overflow-hidden shadow-lg border border-gray-700">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              // スマホのアウトカメラを優先的に起動する設定
              videoConstraints={{ facingMode: "environment" }}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {overlayImg && (
              <img
                src={overlayImg}
                alt="Overlay"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-200"
                style={{ opacity: opacity }}
              />
            )}
          </div>

          {/* コントロールパネル */}
          <div className="w-full bg-gray-800 p-4 rounded-xl shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg cursor-pointer transition">
                <Upload size={20} />
                <span className="text-sm font-medium">昔の写真を読込</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            {overlayImg && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">透かし具合の調整</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            )}

            <button
              onClick={capture}
              className="w-full bg-white text-black py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition"
            >
              <Camera size={24} />
              撮影する
            </button>
          </div>
        </div>
      ) : (
        /* 撮影後のプレビュー画面 */
        <div className="w-full max-w-md flex flex-col items-center gap-4">
          <div className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-gray-700">
            <img src={capturedImg} alt="Captured" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-4 w-full">
            <button
              onClick={() => setCapturedImg(null)}
              className="flex-1 bg-gray-700 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-600 transition"
            >
              <RefreshCcw size={20} />
              撮り直す
            </button>
            <button
              onClick={downloadImage}
              className="flex-1 bg-green-600 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-500 transition font-bold"
            >
              <Download size={20} />
              保存する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}