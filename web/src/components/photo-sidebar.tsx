import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import AddIcon from '../icons/add.icon';
import Photo from '../core/photo';
import Button from './ui/button';

interface PhotoSidebarProps {
  selectedIndex: number | null;
  onSelectPhoto: (index: number) => void;
  onClose: () => void;
}

const PhotoSidebar: React.FC<PhotoSidebarProps> = ({ selectedIndex, onSelectPhoto, onClose }) => {
  const { t } = useTranslation();
  const { photos, setPhotos, setLoading, setOpenedAddPhotoErrorDialog, clearAllPhotos } = useStore();

  const handleAddPhotos = async (files: FileList) => {
    setLoading(true);
    try {
      const newPhotos = await Promise.all(Array.from(files).map(Photo.create));
      setPhotos([...photos, ...newPhotos]);
    } catch (e) {
      console.error(e);
      setOpenedAddPhotoErrorDialog(true);
    }
    setLoading(false);
  };

  const handleDeletePhoto = (e: React.MouseEvent, indexToDelete: number) => {
    e.stopPropagation(); // 이미지 선택 이벤트 방지
    
    const updatedPhotos = photos.filter((_, index) => index !== indexToDelete);
    setPhotos(updatedPhotos);
    
    // 삭제된 사진이 현재 선택된 사진이었다면 선택 해제
    if (selectedIndex === indexToDelete) {
      onSelectPhoto(-1); // 선택 해제
    } else if (selectedIndex !== null && selectedIndex > indexToDelete) {
      // 선택된 인덱스가 삭제된 인덱스보다 크면 인덱스를 하나 줄임
      onSelectPhoto(selectedIndex - 1);
    }
  };

  const handleFileInputClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        handleAddPhotos(files);
      }
    };
    input.click();
  };

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {photos.length === 0 
              ? t('workspace.empty.title', '작업 공간') 
              : t('workspace.photos.count', `사진 ${photos.length}장`, { count: photos.length })
            }
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add Photos Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant="primary"
          className="w-full"
          onClick={handleFileInputClick}
        >
          <AddIcon size={16} />
          <span className="ml-1.5">{t('toolbar.add-photos', 'Add Photos')}</span>
        </Button>
      </div>

      {/* Photos List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {photos.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('dropzone.description', '사진을 추가하여 시작하세요')}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 p-2 space-y-2 overflow-auto">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  onClick={() => onSelectPhoto(index)}
                  className={`
                    group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors
                    ${selectedIndex === index 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700">
                    <img
                      src={photo.thumbnail}
                      alt={photo.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Photo info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <div className="text-white text-xs">
                      <div className="font-medium truncate">{photo.file.name}</div>
                      <div className="text-gray-200 text-[10px] mt-1">
                        {photo.make} {photo.model}
                      </div>
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {selectedIndex === index && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeletePhoto(e, index)}
                    className="absolute bottom-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title={t('photo.delete', '사진 삭제')}
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            {/* Clear All Button - Bottom of sidebar */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="danger"
                className="w-full"
                onClick={() => {
                  if (window.confirm(t('confirm.clear-all', '모든 사진을 삭제하시겠습니까?'))) {
                    clearAllPhotos();
                    onSelectPhoto(-1); // 선택 해제
                  }
                }}
              >
                <span>🗑️</span>
                <span className="ml-1.5">{t('toolbar.clear-all', 'Clear All')}</span>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PhotoSidebar;