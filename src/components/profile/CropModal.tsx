"use client";

import { useRef, useState, useCallback } from "react";
import Cropper from "react-easy-crop";

interface Props {
  imageSrc: string;
  onClose: () => void;
  onCropDone: (croppedUrl: string) => void;
  uploadToCloudinary: (file: File) => Promise<string>;
}

export default function CropModal({
  imageSrc,
  onClose,
  onCropDone,
  uploadToCloudinary,
}: Props) {
  const cropContainerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [cropSize, setCropSize] = useState<{ width: number; height: number } | null>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);

  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((_: any, area: any) => {
    setCroppedAreaPixels(area);
  }, []);

  const onMediaLoaded = useCallback((mediaSize: { width: number; height: number }) => {
    const container = cropContainerRef.current;
    if (!container) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;

    // largest square inside container
    const square = Math.min(cw, ch);

    setCropSize({ width: square, height: square });

    // compute zoom needed to make image COVER the crop square
    const scaleX = square / mediaSize.width;
    const scaleY = square / mediaSize.height;

    const computed = Math.max(scaleX, scaleY);

    // do NOT auto upscale above 1
    const initialZoom = Math.min(computed, 1);

    setMinZoom(initialZoom);
    setZoom(initialZoom);
  }, []);




  // Convert crop → File Blob
  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = document.createElement("img");
      img.crossOrigin = "anonymous";

      img.onload = () => resolve(img);
      img.onerror = (e: Event | string) => reject(e);

      img.src = imageSrc;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const size = Math.max(pixelCrop.width, pixelCrop.height);
    canvas.width = size;
    canvas.height = size;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      size,
      size
    );

    return new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
        },
        "image/jpeg",
        0.92
      );
    });
  };

  const handleApply = async () => {
    if (!croppedAreaPixels) return;

    setLoading(true);     // 🔥 Start UX loader

    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

      const url = await uploadToCloudinary(file);
      setLoading(false);
      onCropDone(url);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center backdrop-blur-xl bg-black/40">
      <div className="w-[92%] max-w-3xl rounded-3xl p-[2px] bg-gradient-to-br 
        from-white/20 to-white/5 dark:from-white/10 dark:to-white/5 shadow-xl">

        <div className="rounded-3xl p-6 bg-white/10 dark:bg-black/20 border border-white/20">

          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Crop Avatar</h3>

            <button
              onClick={() => setZoom(minZoom)}
              className="px-3 py-1 rounded-md text-sm bg-white/10 text-white/80 border border-white/10"
            >
              Fit to square
            </button>
          </div>

          {/* Cropper */}
          <div
            ref={cropContainerRef}
            className="relative w-full h-[420px] bg-black/20 rounded-2xl overflow-hidden"
          >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropSize={cropSize ?? undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onMediaLoaded={onMediaLoaded}
            minZoom={minZoom}
            maxZoom={3}
            showGrid={false}
            restrictPosition={false}
            objectFit="contain"
          />
          </div>

          {/* Zoom Slider */}
          <div className="mt-4 flex items-center gap-4">
            <label className="text-sm text-white/80">Zoom</label>

            <input
              type="range"
              min={minZoom}
              max={1}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
              disabled
            />
          </div>

          {/* Bottom Buttons */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-black dark:text-white 
                bg-white/20 dark:bg-white/10 border border-white/20"
            >
              Cancel
            </button>

            <button
              onClick={handleApply}
              disabled={loading}
              className={`px-6 py-2 rounded-xl font-semibold shadow-lg 
                bg-primary-light text-black
                dark:bg-primary-dark dark:text-white
                ${loading ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {loading ? "Uploading..." : "Apply & Upload"}
            </button>
          </div>
        </div>
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-3xl z-[9999]">
          <div className="w-10 h-10 border-4 border-white/40 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
