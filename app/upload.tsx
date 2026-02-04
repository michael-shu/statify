'use client';
import { useRef, useState } from 'react';

const Upload = () => {
  const [isUploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="mt-6 rounded-2xl border justify-items-center border-dashed border-white/15 bg-black/20 p-6">

      <input
        ref={fileInputRef}
        type="file"
        id="fileUpload"
        name="fileUpload"
        className="hidden"
        disabled={isUploading}
        onChange={async (e) => {
          const file = e.target.files?.[0];

          if (file) {
            setUploading(true);

            const data = new FormData();
            data.set("file", file)


            const uploadRequest = await fetch("/spotify_data", {
              method: "POST", 
              body:data
            });

          }
        }}
      />

      <button
        disabled={isUploading}
        onClick={() => {
          fileInputRef.current?.click();
        }}
        className="
          rounded-lg px-4 py-2 font-medium
          bg-white/10 text-white border border-white/10

          transition-all duration-150
          hover:bg-white/15 hover:border-white/20
          active:scale-[0.98] active:bg-white/20

          focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300
          focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950

          disabled:opacity-50 disabled:cursor-not-allowed
          disabled:hover:bg-white/10 disabled:hover:border-white/10
          disabled:active:scale-100
        "
      >
        {isUploading ? 'Uploading' : 'Upload File'}
      </button>
    </div>
  );
};

export default Upload;
