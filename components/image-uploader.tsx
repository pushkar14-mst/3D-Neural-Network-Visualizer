"use client";

import { useRef, useState } from "react";

/**
 * ImageUploader - Upload images for real inference
 */

export default function ImageUploader({
  onImageProcessed,
  disabled = false,
}: {
  onImageProcessed: (image: HTMLImageElement, imageUrl: string) => void;
  disabled?: boolean;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Load image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      onImageProcessed(img, url);
    };
    img.src = url;
  };

  return (
    <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg text-white">
      <h3 className="font-semibold mb-3">Upload Image</h3>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className={`w-full px-4 py-2 rounded font-medium transition-colors ${
          disabled
            ? "bg-gray-700 opacity-50 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        Choose Image
      </button>

      {previewUrl && (
        <div className="mt-3">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full rounded border border-gray-600"
          />
        </div>
      )}

      {disabled && (
        <p className="text-xs text-gray-400 mt-2">
          Load a model first to enable image upload
        </p>
      )}
    </div>
  );
}
