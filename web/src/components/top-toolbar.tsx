import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import DownloadIcon from '../icons/download.icon';
import GitHubIcon from '../icons/github.icon';
import themes, { useThemeStore } from '../themes';
import render from '../core/drawing/render';
import Button from './ui/button';
import JSZip from 'jszip';

interface TopToolbarProps {}

const TopToolbar: React.FC<TopToolbarProps> = () => {
    const { t } = useTranslation();
    const store = useStore();
    const { photos, selectedThemeName } = store;
    const themeStore = useThemeStore();
    const [showDownloadModal, setShowDownloadModal] = React.useState(false);
    const [downloadProgress, setDownloadProgress] = React.useState({ current: 0, total: 0 });



    const handleDownloadAll = async () => {
        if (!selectedThemeName || photos.length === 0) return;
        
        setShowDownloadModal(true);
        setDownloadProgress({ current: 0, total: photos.length });
        
        try {
            const selectedTheme = themes.find(theme => theme.name === selectedThemeName);
            if (!selectedTheme) {
                throw new Error(`Theme "${selectedThemeName}" not found`);
            }

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

            // Create a new ZIP file
            const zip = new JSZip();
            
            // Process each photo and add to ZIP
            for (let i = 0; i < photos.length; i++) {
                const photo = photos[i];
                
                try {
                    // Update progress
                    setDownloadProgress({ current: i + 1, total: photos.length });
                    
                    // Generate themed image
                    const canvas = await render(selectedTheme.func, photo, themeOptions, store);
                    
                    // Convert canvas to blob
                    const blob = await new Promise<Blob>((resolve) => {
                        canvas.toBlob((blob) => {
                            resolve(blob!);
                        }, 'image/jpeg', store.quality || 0.95);
                    });
                    
                    // Generate filename with theme name
                    const fileExtension = photo.file.name.split('.').pop();
                    const baseFileName = photo.file.name.replace(/\.[^/.]+$/, "");
                    const themeName = selectedThemeName.replace(/\s+/g, '_').toLowerCase();
                    const fileName = `${baseFileName}_${themeName}.${store.exportToJpeg ? 'jpg' : fileExtension}`;
                    
                    // Add the image to ZIP file
                    zip.file(fileName, blob);
                    
                } catch (error) {
                    console.error(`Failed to process photo ${i + 1}:`, error);
                }
            }
            
            // Generate ZIP file and download
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            
            // Create download link for ZIP file
            const themeName = selectedThemeName.replace(/\s+/g, '_').toLowerCase();
            const zipFileName = `exif_frames_${themeName}_${photos.length}photos.zip`;
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = zipFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the object URL
            URL.revokeObjectURL(link.href);
            
        } catch (error) {
            console.error('Failed to download all images:', error);
        } finally {
            // Close modal after a short delay
            setTimeout(() => {
                setShowDownloadModal(false);
                setDownloadProgress({ current: 0, total: 0 });
            }, 1000);
        }
    };

    return (
        <div className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center relative px-6">
            {/* Left Section - GitHub Link */}
            <div className="flex items-center space-x-3">
                <a
                    href="https://github.com/yldst-dev/exif-frame-pc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={t('github.link', 'GitHub에서 보기')}
                >
                    <GitHubIcon size={20} />
                    <span className="text-sm font-medium">GitHub</span>
                </a>
            </div>

            {/* Center Section - App Title - Absolutely positioned center */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    EXIF Frame-PC
                </h1>
            </div>

            {/* Right Section - Download Button */}
            <div className="flex items-center space-x-2 ml-auto">
                {photos.length > 0 && (
                    <Button
                        variant="secondary"
                        onClick={handleDownloadAll}
                    >
                        <DownloadIcon size={16} />
                        <span className="ml-1.5">{t('toolbar.download-all', 'Download All')}</span>
                    </Button>
                )}
            </div>

            {/* Download Progress Modal */}
            {showDownloadModal && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                <DownloadIcon size={24} />
                            </div>
                            
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {t('download.batch-title', '일괄 다운로드 중')}
                            </h3>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                {t('download.batch-description', `${downloadProgress.total}개의 사진을 ${selectedThemeName}으로 일괄 다운로드 합니다.`)}
                            </p>
                            
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${downloadProgress.total > 0 ? (downloadProgress.current / downloadProgress.total) * 100 : 0}%` }}
                                ></div>
                            </div>
                            
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {downloadProgress.current} / {downloadProgress.total} {t('download.photos', '사진')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopToolbar;