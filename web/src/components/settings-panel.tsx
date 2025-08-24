import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import SettingsIcon from '../icons/settings.icon';
import ImageIcon from '../icons/image.icon';
import ThemeSettings from './settings/theme-settings';
import ExportSettings from './settings/export-settings';
import IconButton from './ui/icon-button';

interface SettingsPanelProps {
  selectedImageIndex: number | null;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ selectedImageIndex, onClose }) => {
  const { t } = useTranslation();
  const { photos } = useStore();
  const [activeSection, setActiveSection] = useState<'theme' | 'export'>('theme');

  const selectedPhoto = selectedImageIndex !== null ? photos[selectedImageIndex] : null;

  const sections = [
    {
      id: 'theme' as const,
      title: t('settings.theme', 'Theme'),
      icon: ImageIcon,
      description: t('settings.theme.description', 'Frame style and appearance')
    },
    {
      id: 'export' as const,
      title: t('settings.export', 'Export'),
      icon: SettingsIcon,
      description: t('settings.export.description', 'Output format and quality')
    }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('settings.title', 'Settings')}
        </h2>
        <IconButton
          variant="ghost"
          onClick={onClose}
        >
          <span>✕</span>
        </IconButton>
      </div>

      {/* Section Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
                w-full flex items-center justify-between p-3 text-left transition-colors
                ${isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <Icon size={20} />
                <div>
                  <div className="font-medium text-sm">{section.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {section.description}
                  </div>
                </div>
              </div>
              {isActive ? (
                <span>▼</span>
              ) : (
                <span>▶</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      <div className="flex-1 overflow-auto">
        {activeSection === 'theme' && (
          <ThemeSettings selectedPhoto={selectedPhoto} />
        )}
        {activeSection === 'export' && (
          <ExportSettings />
        )}
      </div>

      {/* Panel Footer */}
      {selectedPhoto && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div className="font-medium truncate">{selectedPhoto.file.name}</div>
            <div>{selectedPhoto.metadata.make} {selectedPhoto.metadata.model}</div>
            <div>
              {selectedPhoto.metadata.focalLength} • {selectedPhoto.metadata.fNumber} • 
              ISO {selectedPhoto.metadata.iso} • {selectedPhoto.metadata.exposureTime}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;