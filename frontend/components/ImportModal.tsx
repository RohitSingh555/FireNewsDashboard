import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiFileText, FiUser, FiCheckCircle, FiAlertCircle, FiDownload } from 'react-icons/fi';
import api from '../lib/axios';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportModal({ open, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [reporterName, setReporterName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [reporterNames, setReporterNames] = useState<string[]>([]);
  const [isLoadingReporters, setIsLoadingReporters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        setError('Please select a valid file (.xlsx, .xls, or .csv)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        setError('Please select a valid file (.xlsx, .xls, or .csv)');
        return;
      }
      
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setFile(droppedFile);
      setError('');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!file) {
      setError('Please select an Excel file');
      return;
    }
    
    if (!reporterName.trim()) {
      setError('Please enter a reporter name');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('reporter_name', reporterName.trim());
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      const response = await api.post('/api/fire-news/process-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(response.data);
      
      // Reset form
      setFile(null);
      setReporterName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setReporterName('');
    setUploadProgress(0);
    setUploadResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fetch reporter names when modal opens
  React.useEffect(() => {
    if (open) {
      fetchReporterNames();
    }
  }, [open]);

  const fetchReporterNames = async () => {
    setIsLoadingReporters(true);
    try {
      const response = await api.get('/api/fire-news/reporters');
      setReporterNames(response.data.reporters || []);
    } catch (err) {
      console.error('Error fetching reporter names:', err);
      setReporterNames([]);
    } finally {
      setIsLoadingReporters(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-theme-card rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <FiUpload className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-theme-primary">Import Fire News</h3>
              <p className="text-sm text-theme-secondary">Upload Excel file with fire news data</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-theme-secondary hover:text-theme-primary text-3xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Success Result */}
        {uploadResult && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <FiCheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  Upload Successful!
                </h4>
                <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                  <p><strong>{uploadResult.inserted}</strong> items inserted</p>
                  <p><strong>{uploadResult.skipped}</strong> items skipped (duplicates)</p>
                  <p><strong>{uploadResult.total_processed}</strong> total processed</p>
                  <p>Reporter: <strong>{uploadResult.reporter_name}</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <FiAlertCircle className="h-6 w-6 text-red-600" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-theme-primary">Uploading...</span>
              <span className="text-sm text-theme-secondary">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reporter Name */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Reporter Name *
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-secondary" />
              {isLoadingReporters ? (
                <div className="w-full pl-10 pr-4 py-3 border border-theme-border rounded-lg bg-theme-background text-theme-secondary flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-theme-secondary mr-2"></div>
                  Loading reporters...
                </div>
              ) : (
                <select
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-theme-border rounded-lg bg-theme-background text-theme-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isUploading}
                >
                  <option value="">Select a reporter</option>
                  {reporterNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                  <option value="new">+ Add New Reporter</option>
                </select>
              )}
            </div>
            {reporterName === 'new' && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Enter new reporter name"
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-background text-theme-primary placeholder-theme-secondary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isUploading}
                />
              </div>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Excel File *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                file
                  ? 'border-green-300 bg-green-50 dark:bg-green-900/10'
                  : 'border-theme-border hover:border-blue-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
                             <input
                 ref={fileInputRef}
                 type="file"
                 accept=".xlsx,.xls,.csv"
                 onChange={handleFileSelect}
                 className="hidden"
                 disabled={isUploading}
               />
              
              {file ? (
                <div className="space-y-2">
                  <FiFileText className="h-12 w-12 text-green-600 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      {file.name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="text-xs text-red-600 hover:text-red-700"
                    disabled={isUploading}
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <FiUpload className="h-12 w-12 text-theme-secondary mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-theme-primary">
                      Drop Excel file here or click to browse
                    </p>
                                       <p className="text-xs text-theme-secondary">
                     Supports .xlsx, .xls, and .csv files (max 10MB)
                   </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    disabled={isUploading}
                  >
                    Choose File
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Excel Template Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Required Excel Format
            </h4>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <p><strong>Required columns:</strong> title, content</p>
              <p><strong>Optional columns:</strong> published_date, url, source, fire_related_score, verification_result, verified_at, state, county, city, province, country, latitude, longitude, image_url, tags, verifier_feedback</p>
            </div>
            <button
              type="button"
              className="mt-3 flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700"
              onClick={() => {
                // Create sample Excel data
                const sampleData = [
                  {
                    title: 'Sample Fire Alert',
                    content: 'This is a sample fire news content.',
                    published_date: '2024-01-15',
                    source: 'Sample Source',
                    state: 'California',
                    county: 'Los Angeles'
                  }
                ];
                
                // Convert to CSV for download
                const csvContent = [
                  Object.keys(sampleData[0]).join(','),
                  ...sampleData.map(row => Object.values(row).join(','))
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'fire_news_template.csv';
                a.click();
                window.URL.revokeObjectURL(url);
              }}
            >
              <FiDownload className="h-3 w-3" />
              Download Template
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-theme-border">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-theme-secondary hover:text-theme-primary transition-colors font-medium"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file || !reporterName.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FiUpload className="h-4 w-4" />
                  Upload Excel File
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 