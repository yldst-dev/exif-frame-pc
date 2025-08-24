import React, { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImageIcon from '../../icons/image.icon';
import Button from '../ui/button';
import { useStore } from '../../store';
import themes, { useThemeStore } from '../../themes';
import render from '../../core/drawing/render';

interface ImagePreviewProps {
  selectedPhoto: any | null;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ selectedPhoto }) => {
  const { t } = useTranslation();
  const store = useStore();
  const { darkMode, selectedThemeName } = store;
  const themeStore = useThemeStore();
  const [themedPreview, setThemedPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Generate full-resolution themed image for export
  useEffect(() => {
    const generateExportPreview = async () => {
      if (!selectedPhoto || !selectedThemeName) {
        setThemedPreview(null);
        setIsGenerating(false);
        setGenerationError(null);
        return;
      }

      setIsGenerating(true);
      setGenerationError(null);
      setThemedPreview(null);

      try {
        const selectedTheme = themes.find(theme => theme.name === selectedThemeName);
        if (!selectedTheme) {
          throw new Error(`Theme "${selectedThemeName}" not found`);
        }

        // Wait a bit to ensure the loading state is visible
        await new Promise(resolve => setTimeout(resolve, 100));

        // Create a Map with all required options and their default values
        const themeOptions = new Map();
        
        // First, set all default values from theme options
        selectedTheme.options.forEach(option => {
          themeOptions.set(option.id, option.default);
        });
        
        // Then override with user-configured values if they exist
        themeStore.option.forEach((value, key) => {
          if (selectedTheme.options.some(opt => opt.id === key)) {
            themeOptions.set(key, value);
          }
        });

        console.log('Generating preview with options:', { 
          selectedThemeName, 
          themeOptionsSize: themeOptions.size,
          themeOptions: Array.from(themeOptions.entries())
        });

        // Generate full-resolution image with theme applied
        const canvas = await render(selectedTheme.func, selectedPhoto, themeOptions, store);
        
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          throw new Error('Generated canvas is invalid');
        }

        // Convert to data URL with high quality for preview and download
        const dataUrl = canvas.toDataURL('image/jpeg', store.quality || 0.95);
        setThemedPreview(dataUrl);
        console.log('Preview generated successfully');
        
      } catch (error) {
        console.error('Failed to generate export preview:', error);
        setGenerationError(error instanceof Error ? error.message : 'Unknown error occurred');
        setThemedPreview(null);
      } finally {
        setIsGenerating(false);
      }
    };

    generateExportPreview();
  }, [selectedPhoto, selectedThemeName, themeStore.option, store.rerenderOptions, store.quality]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [showModal]);

  // Calculate dimensions and file size
  const previewInfo = useMemo(() => {
    if (!selectedPhoto) return null;
    
    const img = new Image();
    img.src = selectedPhoto.thumbnail;
    
    return {
      originalSize: `${selectedPhoto.image.naturalWidth} × ${selectedPhoto.image.naturalHeight}`,
      outputSize: `${selectedPhoto.image.width} × ${selectedPhoto.image.height}`,
      fileSize: formatFileSize(selectedPhoto.file.size),
    };
  }, [selectedPhoto]);

  if (!selectedPhoto) {
    return (
      <div className="p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400">
            <ImageIcon size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {t('preview.no-selection', 'No Image Selected')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('preview.select-instruction', 'Select an image from the grid to see the export preview')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      {/* Preview Image - Main content area */}
      <div className="flex-1 flex flex-col p-4 min-h-0">
        <div 
          className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden min-h-0 flex items-center justify-center"
          style={{
            backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(243, 244, 246, 0.8)'
          }}
        >
          {themedPreview ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={themedPreview}
                alt={`Export preview - ${selectedPhoto.file.name}`}
                className="max-w-full max-h-full object-contain hover:opacity-90 transition-opacity cursor-pointer"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto'
                }}
                onClick={() => {
                  if (themedPreview) {
                    setShowModal(true);
                  }
                }}
              />
            </div>
          ) : generationError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    {t('preview.generation-error', 'Preview generation failed')}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {generationError}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGenerationError(null);
                    useStore.getState().setRerenderOptions();
                  }}
                  className="text-xs px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                >
                  {t('preview.retry', 'Try Again')}
                </button>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('preview.generating', 'Generating export preview...')}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('preview.waiting', 'Select a theme to see preview')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom section - File info and download button */}
      <div className="flex-shrink-0 p-4 space-y-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* File Info */}
        <div className="space-y-2 text-sm">
          <div className="font-medium text-gray-900 dark:text-white truncate" title={selectedPhoto.file.name}>
            {selectedPhoto.file.name}
          </div>
          
          {previewInfo && (
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>{t('preview.original-size', 'Original Size')}:</span>
                <span className="font-mono">{previewInfo.originalSize}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('preview.output-size', 'Output Size')}:</span>
                <span className="font-mono">{previewInfo.outputSize}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('preview.file-size', 'File Size')}:</span>
                <span className="font-mono">{previewInfo.fileSize}</span>
              </div>
            </div>
          )}
        </div>

        {/* Download Button */}
        <Button 
          variant="primary" 
          className="w-full"
          disabled={!themedPreview}
          onClick={() => {
            if (!themedPreview) return;
            
            // Download the full-resolution export image
            const link = document.createElement('a');
            link.href = themedPreview;
            
            // Generate filename with theme name
            const fileExtension = selectedPhoto.file.name.split('.').pop();
            const baseFileName = selectedPhoto.file.name.replace(/\.[^/.]+$/, "");
            const themeName = selectedThemeName.replace(/\s+/g, '_').toLowerCase();
            link.download = `${baseFileName}_${themeName}.${store.exportToJpeg ? 'jpg' : fileExtension}`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          {themedPreview 
            ? t('preview.download-single', '이 사진 다운로드') 
            : t('preview.generating', '생성 중...')
          }
        </Button>
      </div>

      {/* Modal for full-size preview */}
      {showModal && themedPreview && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="relative flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Full-size image with size constraints */}
            <img
              src={themedPreview}
              alt={`Full preview - ${selectedPhoto.file.name}`}
              className="object-contain shadow-2xl"
              style={{
                maxWidth: '85vw',
                maxHeight: '80vh',
                width: 'auto',
                height: 'auto'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;