import { useRef } from "react";
import { Camera, X } from "lucide-react";
import Image from "next/image";
import { TeacherFormHandlers } from "../types";

interface TeacherPhotoUploadProps {
  previewUrl: string | null;
  handlers: TeacherFormHandlers;
}

export function TeacherPhotoUpload({ previewUrl, handlers }: TeacherPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlers.handleFileChange(e);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const onRemove = (e: React.MouseEvent) => {
    handlers.removePhoto(e);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="col-span-full relative group border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 mb-4 transition-colors hover:bg-emerald-50 hover:border-emerald-200 overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        id="teacher-photo-upload"
        className="hidden"
        accept="image/*"
        onChange={onFileChange}
        title="Subir fotografía del docente"
        aria-label="Adjuntar fotografía del docente"
      />
      <div
        className="flex flex-col items-center justify-center p-6 cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label="Adjuntar fotografía del docente"
      >
        {previewUrl ? (
          <div className="relative w-32 h-32 mb-2">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              unoptimized
              className="w-full h-full rounded-full object-cover border-4 border-white shadow-sm"
            />
          </div>
        ) : (
          <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center mb-3">
            <Camera className="h-10 w-10 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-slate-500 font-medium">
            {previewUrl
              ? "Clic para cambiar fotografía"
              : "Adjuntar fotografía del docente"}
          </p>
          <p className="text-xs text-slate-400">JPG, PNG (Max. 10MB)</p>
        </div>
      </div>

      {previewUrl && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors z-20"
          aria-label="Eliminar foto"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
