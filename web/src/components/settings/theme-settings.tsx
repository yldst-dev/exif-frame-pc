import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import themes, { useThemeStore } from '../../themes';
import Button from '../ui/button';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import { ThemeSettingsProps } from '../../types';

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ }) => {
  const { t } = useTranslation();
  const { selectedThemeName, setSelectedThemeName } = useStore();
  const { option: themeOptions, setOption, replaceOptions } = useThemeStore();
  const selectedTheme = themes.find(theme => theme.name === selectedThemeName);

  // 로컬 상태 - 입력 필드의 즉시 반응을 위해
  const [localOptions, setLocalOptions] = React.useState<Map<string, any>>(new Map());

  // 디바운스된 setOption - 300ms 딜레이로 불필요한 렌더링 방지
  const debouncedSetOption = useDebouncedCallback((key: string, value: string | number | boolean) => {
    setOption(key, value);
  }, 300);

  // 옵션 값 변경 핸들러 - useCallback으로 성능 최적화
  const handleOptionChange = useCallback((key: string, value: string | number | boolean) => {
    // 로컬 상태 즉시 업데이트 (UI 반응성)
    setLocalOptions(prev => {
      const newMap = new Map(prev);
      newMap.set(key, value);
      return newMap;
    });
    
    // 실제 렌더링은 디바운스 (성능 최적화)
    debouncedSetOption(key, value);
  }, [debouncedSetOption]);

  // 테마 변경 시 로컬 옵션 초기화
  React.useEffect(() => {
    setLocalOptions(new Map());
  }, [selectedThemeName]);

  // 실제 값 가져오기 (로컬 상태 > 글로벌 상태 > 기본값) - useCallback으로 성능 최적화
  const getOptionValue = useCallback((optionId: string, defaultValue: any) => {
    if (localOptions.has(optionId)) {
      return localOptions.get(optionId);
    }
    return themeOptions.get(optionId) ?? defaultValue;
  }, [localOptions, themeOptions]);

  // 테마 선택 시 모든 옵션 초기화 및 테마 변경 - useCallback으로 성능 최적화
  const handleThemeSelect = useCallback((themeName: string) => {
    // 1. 로컬 상태 초기화
    setLocalOptions(new Map());
    
    // 2. 테마 변경
    setSelectedThemeName(themeName);
    
    // 3. 이전 테마 옵션들 제거와 새 테마 기본값 설정을 원자적으로 처리
    const prevTheme = themes.find(theme => theme.name === selectedThemeName);
    const newTheme = themes.find(theme => theme.name === themeName);
    
    if (newTheme) {
      // 제거할 이전 옵션 키들
      const prevOptionIds = prevTheme?.options.map(option => option.id) || [];
      
      // 새 테마의 기본값들
      const newThemeOptions = new Map();
      newTheme.options.forEach(option => {
        newThemeOptions.set(option.id, option.default);
      });
      
      // 한 번에 이전 옵션 제거 + 새 옵션 설정 (잠깜 비는 시간 없음)
      replaceOptions(prevOptionIds, newThemeOptions);
    }
  }, [selectedThemeName, setSelectedThemeName, replaceOptions]);

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
              onClick={() => handleThemeSelect(theme.name)}
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
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                if (selectedTheme) {
                  // 로컬 상태 초기화
                  setLocalOptions(new Map());
                  
                  // 현재 테마의 모든 옵션을 기본값으로 재설정
                  selectedTheme.options.forEach(opt => {
                    setOption(opt.id, opt.default);
                  });
                }
              }}
            >
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
                      value={getOptionValue(option.id, option.default)}
                      onChange={(e) => handleOptionChange(option.id, e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                    />
                    <input
                      type="text"
                      value={getOptionValue(option.id, option.default)}
                      onChange={(e) => handleOptionChange(option.id, e.target.value)}
                      placeholder={t('theme.option.color.placeholder', 'HEX 색상 코드 (예: #ffffff)')}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>
                )}
                
                {option.type === 'number' && (
                  <input
                    type="number"
                    value={getOptionValue(option.id, option.default)}
                    onChange={(e) => handleOptionChange(option.id, Number(e.target.value))}
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
                    value={getOptionValue(option.id, option.default)}
                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
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
                  <select 
                    value={getOptionValue(option.id, option.default)}
                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {option.options?.map((opt, optIndex) => (
                      <option key={optIndex} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
                
                {option.type === 'boolean' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={getOptionValue(option.id, option.default)}
                      onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {option.id === 'DARK_MODE' ? t('theme.option.boolean.dark-mode', '다크 모드 활성화') : option.id}
                    </span>
                  </div>
                )}
                
                {option.type === 'range-slider' && (
                  <div className="space-y-2">
                    <input
                      type="range"
                      value={getOptionValue(option.id, option.default)}
                      onChange={(e) => handleOptionChange(option.id, Number(e.target.value))}
                      min={'min' in option ? (option as any).min : 0}
                      max={'max' in option ? (option as any).max : 100}
                      step={'step' in option ? (option as any).step : 1}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{('min' in option ? (option as any).min : 0)}</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {getOptionValue(option.id, option.default)}
                      </span>
                      <span>{('max' in option ? (option as any).max : 100)}</span>
                    </div>
                  </div>
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