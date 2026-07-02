import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UploadCloud, File, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// Master list of supported file types for frontend prompt
const SUPPORTED_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm',
  'text/plain', 'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint', 
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel', 
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip', 'application/x-zip-compressed', 'application/x-tar', 'application/x-gzip', 'application/x-rar-compressed', 'application/x-7z-compressed'
];

const UploadPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    
    // Check type
    if (!SUPPORTED_TYPES.includes(selectedFile.type) && selectedFile.type !== "") {
      // Let it pass to backend if mime type cannot be guessed on client, but warn
      console.warn('Unknown MIME on client:', selectedFile.type);
    }
    
    // Check size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File is too large. Max limit is 100MB.');
      return false;
    }
    
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    setError('');
    
    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    setError('');
    const selectedFile = e.target.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_public', isPublic);

    try {
      await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(true);
      setFile(null);
      setTimeout(() => {
        navigate('/files');
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Failed to upload file. Please verify file type and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Upload File</h1>
        <p className="text-slate-400 mt-1">Upload files securely to AWS S3 storage bucket</p>
      </div>

      {error && (
        <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm animate-shake">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>File uploaded successfully! Redirecting to files list...</span>
        </div>
      )}

      <form onSubmit={handleUploadSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        
        {/* File Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200
            ${file ? 'border-brand-500/30 bg-slate-950/20 cursor-default' : 'border-slate-800 hover:border-brand-500 hover:bg-slate-950/30'}
            ${dragOver ? 'border-brand-500 bg-brand-500/5' : ''}
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            disabled={loading || success}
          />

          {file ? (
            <div className="w-full flex items-center justify-between bg-slate-950/40 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-3 truncate">
                <File className="h-8 w-8 text-brand-400 shrink-0" />
                <div className="truncate text-left">
                  <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors"
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-16 w-16 bg-brand-600/10 border border-brand-500/20 text-brand-500 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <UploadCloud className="h-8 w-8 animate-pulse" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">Drag and drop file here</p>
                <p className="text-sm text-slate-400 mt-1">or click to browse your local filesystem</p>
              </div>
              <p className="text-xs text-slate-500">
                Supports PDF, Images, Videos, Office Docs, and ZIP folders (max 100MB)
              </p>
            </div>
          )}
        </div>

        {/* Public Visibility Toggle */}
        <div className="bg-slate-950/30 border border-slate-850 p-4 rounded-2xl flex items-start space-x-3">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="mt-1 h-4 w-4 bg-slate-900 border-slate-700 rounded text-brand-600 focus:ring-brand-500/30 focus:ring-offset-slate-900"
            disabled={loading || success}
          />
          <div className="text-left">
            <label htmlFor="isPublic" className="text-sm font-semibold text-white cursor-pointer select-none">
              Make file public
            </label>
            <p className="text-xs text-slate-400 mt-1">
              Public files generate a direct download url that is accessible by anyone, even without logging in. Keep this disabled for private files.
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full flex items-center justify-center bg-brand-600 hover:bg-brand-500 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-brand-600/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          disabled={!file || loading || success}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader className="h-5 w-5 animate-spin" />
              <span>Uploading to S3...</span>
            </div>
          ) : (
            'Start Secure Upload'
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadPage;
