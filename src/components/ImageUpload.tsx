"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon } from "lucide-react";
import { useState } from "react";

interface ImageUploadProps {
  onChange: (url: string) => void;
  value: string;
  endpoint: "postImage";
}

function ImageUpload({ endpoint, onChange, value }: ImageUploadProps) {
  const [hasFile, setHasFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // --- If image is uploaded, show preview ---
  if (value) {
    return (
      <div className="relative size-40">
        <img
          src={value}
          alt="Upload"
          className="rounded-md size-40 object-cover"
        />
        <button
          onClick={() => onChange("")}
          className="absolute top-0 right-0 p-1 bg-red-500 rounded-full shadow-sm"
          type="button"
        >
          <XIcon className="h-4 w-4 text-white" />
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      appearance={{
        container:
          "flex flex-col items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900/50 p-6 transition-all hover:bg-neutral-900/70",
        label: "text-sm text-neutral-400 mt-3",
        allowedContent: "text-xs text-neutral-500 mt-1",
        button:
          "mt-4 bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors",
      }}
      content={{
        uploadIcon: () => (
          <div className="flex items-center justify-center text-4xl text-blue-500">
            ⬆️
          </div>
        ),
        label: "Choose a file or drag and drop",
        allowedContent: "Image (max 4MB)",
        button: () => {
          if (isUploading) return `Uploading… ${progress}%`;
          if (hasFile) return "Upload 1 file";
          return "Choose File";
        },
      }}
      // When upload actually begins
      onUploadBegin={() => setIsUploading(true)}
      // While uploading
      onUploadProgress={(p) => setProgress(p)}
      // When finished
      onClientUploadComplete={(res) => {
        setIsUploading(false);
        setHasFile(false);
        if (res && res[0]?.ufsUrl) {
          onChange(res[0].ufsUrl);
        }
      }}
      // Before upload starts (user picked a file)
      onBeforeUploadBegin={(files) => {
        if (files.length > 0) setHasFile(true);

        // Handle case where user opens file dialog and cancels
        setTimeout(() => {
          if (!isUploading) setHasFile(false);
        }, 2000);

        return files;
      }}
      // Handle error
      onUploadError={(error) => {
        console.error("Upload error:", error);
        setIsUploading(false);
        setHasFile(false);
      }}
    />
  );
}

export default ImageUpload;
