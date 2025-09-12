import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import SettingsPanel from './settings-panel';
import PhotoSidebar from './photo-sidebar';
import ImagePreview from './settings/image-preview';
import TopToolbar from './top-toolbar';
import DropZone from './drop-zone';
import Loading from '../pages/convert/components/loading';
import AddPhotoErrorDialog from '../pages/convert/components/add-photo-error.dialog';
import Photo from '../core/photo';

const DesktopLayout = () => {
  const { t } = useTranslation();
  const { photos, setPhotos, setLoading, setOpenedAddPhotoErrorDialog } = useStore();
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(true);
  const [isPhotoSidebarOpen, setIsPhotoSidebarOpen] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleAddPhotos = useCallback(async (files: File[]) => {
    setLoading(true);
    try {
      const newPhotos = await Promise.all(files.map(Photo.create));
      setPhotos([...photos, ...newPhotos]);
    } catch (e) {
      console.error(e);
      setOpenedAddPhotoErrorDialog(true);
    }
    setLoading(false);
  }, [photos, setPhotos, setLoading, setOpenedAddPhotoErrorDialog]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only hide drag overlay if leaving the main container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => {
      // Check for standard image types
      if (file.type.startsWith('image/')) return true;
      
      // Check for HEIC/HEIF files by extension (since browsers may not recognize the MIME type)
      const fileName = file.name.toLowerCase();
      return fileName.endsWith('.heic') || fileName.endsWith('.heif');
    });
    
    if (files.length > 0) {
      handleAddPhotos(files);
    }
  }, [handleAddPhotos]);

  return (
    <div 
      className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-blue-500/10 border-4 border-dashed border-blue-400 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl border border-blue-400">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                {t('dropzone.drop-here', '여기에 사진을 놓으세요')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('dropzone.drop-description', '놓으면 사진이 업로드됩니다')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Toolbar */}
      <TopToolbar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Photo Sidebar */}
        {isPhotoSidebarOpen && (
          <PhotoSidebar 
            selectedIndex={selectedImageIndex}
            onSelectPhoto={(index) => setSelectedImageIndex(index === -1 ? null : index)}
            onClose={() => setIsPhotoSidebarOpen(false)}
          />
        )}
        
        {/* Photo Sidebar Toggle Button - positioned on the left edge */}
        {!isPhotoSidebarOpen && (
          <button
            onClick={() => setIsPhotoSidebarOpen(true)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title={t('toolbar.show-photos', 'Show Photos')}
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        )}

        {/* Center Panel - Preview Main Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {photos.length === 0 ? (
            <DropZone />
          ) : selectedImageIndex !== null ? (
            <ImagePreview selectedPhoto={photos[selectedImageIndex]} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {t('preview.select-image', 'Select a Photo')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('preview.select-description', 'Choose a photo from the sidebar to see the preview')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Settings */}
        {isSettingsPanelOpen && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
            <SettingsPanel 
              selectedImageIndex={selectedImageIndex}
              onClose={() => setIsSettingsPanelOpen(false)}
            />
          </div>
        )}
        
        {/* Settings Panel Toggle Button - positioned on the right edge */}
        {!isSettingsPanelOpen && (
          <button
            onClick={() => setIsSettingsPanelOpen(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title={t('toolbar.show-settings', 'Show Settings')}
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Loading and Error Components */}
      <Loading />
      <AddPhotoErrorDialog />
    </div>
  );
};

export default DesktopLayout;