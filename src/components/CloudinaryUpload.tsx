"use client";

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader } from "lucide-react";

interface CloudinaryUploadProps {
  onUpload: (imageData: {
    url: string;
    publicId: string;
    width: number;
    height: number;
  }) => void;
  onRemove?: (publicId: string) => void;
  maxFiles?: number;
  currentImages?: Array<{
    url: string;
    publicId: string;
    alt?: string;
  }>;
}

export default function CloudinaryUpload({
  onUpload,
  onRemove,
  maxFiles = 5,
  currentImages = [],
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      if (currentImages.length + files.length > maxFiles) {
        alert(`Chỉ có thể upload tối đa ${maxFiles} hình ảnh`);
        return;
      }

      setUploading(true);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith("image/")) {
          alert("Chỉ chấp nhận file hình ảnh");
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          alert("File quá lớn. Tối đa 10MB");
          continue;
        }

        try {
          setUploadProgress((i / files.length) * 100);

          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload-cloudinary", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const result = await response.json();

          if (result.success) {
            onUpload({
              url: result.url,
              publicId: result.publicId,
              width: result.width,
              height: result.height,
            });
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          console.error("Upload error:", error);
          alert("Upload thất bại. Vui lòng thử lại.");
        }
      }

      setUploading(false);
      setUploadProgress(0);
    },
    [currentImages.length, maxFiles, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files);
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileUpload(files);
      }
    },
    [handleFileUpload]
  );

  const handleRemoveImage = useCallback(
    (publicId: string) => {
      if (onRemove) {
        onRemove(publicId);
      }
    },
    [onRemove]
  );

  return (
    <div className="space-y-4">
      {/* Current Images */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentImages.map((image, index) => (
            <div key={image.publicId || index} className="relative group">
              <img
                src={image.url}
                alt={image.alt || `Image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              {onRemove && (
                <button
                  onClick={() => handleRemoveImage(image.publicId)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {currentImages.length < maxFiles && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${
              uploading
                ? "border-blue-300 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 bg-gray-50"
            }
          `}
        >
          <input
            type="file"
            id="file-upload"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />

          {uploading ? (
            <div className="space-y-4">
              <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Đang upload... {Math.round(uploadProgress)}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Kéo thả hình ảnh vào đây hoặc{" "}
                  <label
                    htmlFor="file-upload"
                    className="text-blue-500 hover:text-blue-600 cursor-pointer font-medium"
                  >
                    chọn file
                  </label>
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WEBP up to 10MB ({currentImages.length}/{maxFiles}{" "}
                  hình)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Button Alternative */}
      {currentImages.length < maxFiles && !uploading && (
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
        >
          <Upload className="w-4 h-4 mr-2" />
          Thêm hình ảnh
        </label>
      )}
    </div>
  );
}
