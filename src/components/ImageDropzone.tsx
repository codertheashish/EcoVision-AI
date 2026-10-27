import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

interface ImageDropzoneProps {
  onAnalyze: (file: File) => void;
  isLoading: boolean;
  loadingStage: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onAnalyze,
  isLoading,
  loadingStage
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported format. Please upload a JPEG, PNG, or WEBP image.');
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 10MB.`);
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerAnalysis = () => {
    if (selectedFile) {
      onAnalyze(selectedFile);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
        id="waste-file-upload"
      />

      {/* Main Upload / Preview Area */}
      {!previewUrl ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-emerald-600 bg-emerald-50/50'
              : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/50 hover:bg-neutral-50'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center mb-4">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900 mb-1">
            Drop a photo here
          </h3>
          <p className="text-xs text-neutral-500 mb-4 max-w-sm mx-auto">
            or click to choose one. JPG, PNG or WEBP, up to 10 MB.
          </p>
          <button
            type="button"
            className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors pointer-events-none"
          >
            Choose photo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border border-neutral-200 bg-neutral-900 max-h-96 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Selected waste item"
              className="w-full h-80 object-contain"
              referrerPolicy="no-referrer"
            />
            {!isLoading && (
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Replace image"
                  className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-md backdrop-blur transition-colors text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace</span>
                </button>
                <button
                  onClick={handleClear}
                  title="Remove image"
                  className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-md backdrop-blur transition-colors text-xs flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-neutral-500 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-neutral-400" />
              <span>Photo ready</span>
            </div>

            <button
              onClick={handleTriggerAnalysis}
              disabled={isLoading}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                isLoading
                  ? 'bg-neutral-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{loadingStage || 'Classifying…'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Classify</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Validation Error Banner */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

    </div>
  );
};
