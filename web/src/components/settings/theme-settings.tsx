import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import themes from '../../themes';
import Button from '../ui/button';
// Using emoji for check icon

interface ThemeSettingsProps {
  selectedPhoto: any | null;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ }) => {
  const { t } = useTranslation();
  const { selectedThemeName, setSelectedThemeName } = useStore();
  const selectedTheme = themes.find(theme => theme.name === selectedThemeName);

  return (
    <div className="p-4 space-y-6">
      {/* Theme Selection */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900 dark:text-white">
          {t('theme.select', 'Select Theme')}
        </h3>
        
        <div className="grid grid-cols-1 gap-2">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => setSelectedThemeName(theme.name)}
              className={`
                p-3 text-left rounded-lg border-2 transition-all
                ${selectedThemeName === theme.name
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {theme.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t(`theme.${theme.name.toLowerCase()}.description`, 'Theme description')}
                  </div>
                </div>
                {selectedThemeName === theme.name && (
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Theme Customization */}
      {selectedTheme && selectedTheme.options.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {t('theme.customize', 'Customize')}
            </h3>
            <Button variant="ghost" size="sm">
              {t('theme.reset', 'Reset to Default')}
            </Button>
          </div>

          <div className="space-y-4">
            {selectedTheme.options.map((option, index) => (
              <div key={index} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {option.id}
                  {option.description && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {option.id === 'TEXT_ALPHA' 
                        ? t('theme.option.range.alpha', '(투명도: 0=투명, 1=불투명)')
                        : option.id === 'FONT_WEIGHT'
                          ? t('theme.option.range.weight', '(글꼴 두께: 100=가늘게, 900=굵게)')
                          : `(${option.description})`
                      }
                    </span>
                  )}
                </label>
                
                {option.type === 'color' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      defaultValue={option.default}
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                    />
                    <input
                      type="text"
                      defaultValue={option.default}
                      placeholder={t('theme.option.color.placeholder', 'HEX 색상 코드 (예: #ffffff)')}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>
                )}
                
                {option.type === 'number' && (
                  <input
                    type="number"
                    defaultValue={option.default}
                    min={'min' in option ? (option as any).min : undefined}
                    max={'max' in option ? (option as any).max : undefined}
                    step={'step' in option ? (option as any).step : undefined}
                    placeholder={option.id.includes('FONT_SIZE') 
                      ? t('theme.option.number.font-size', '글꼴 크기 (px)') 
                      : option.id.includes('PADDING') 
                        ? t('theme.option.number.padding', '여백 크기 (px)')
                        : t('theme.option.number.default', '숫자 입력')
                    }
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                )}
                
                {(option.type === 'string') && (
                  <input
                    type="text"
                    defaultValue={option.default}
                    placeholder={option.id === 'TEXT' 
                      ? t('theme.option.text.custom', '표시할 텍스트 입력 (예: Hello World!)')
                      : option.id === 'TOP_LABEL'
                        ? t('theme.option.text.top-label', '상단 라벨 (예: @username)')
                        : option.id === 'DIVIDER'
                          ? t('theme.option.text.divider', '구분자 (예: ∙ 또는 |)')
                          : option.id === 'TEMPLATE'
                            ? t('theme.option.text.template', 'EXIF 템플릿 (예: {MAKER}{BODY}{LENS})')
                            : t('theme.option.text.default', '텍스트 입력')
                    }
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                )}
                
                {option.type === 'select' && (
                  <select className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    {option.options?.map((opt, optIndex) => (
                      <option key={optIndex} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ThemeSettings;