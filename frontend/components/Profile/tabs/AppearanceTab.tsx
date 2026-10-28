import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    SunIcon,
    MoonIcon,
    ComputerDesktopIcon,
    SwatchIcon,
    PhotoIcon,
    NoSymbolIcon,
    PaintBrushIcon,
    BoldIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import type { ProfileFormData } from '../types';
import {
    CONTENT_BACKGROUNDS,
    contentBackgroundUrl,
} from '../../../constants/contentBackgrounds';
import { THEMES, CUSTOM_THEME_ID } from '../../../constants/themes';
import type { TextScale } from '../../../constants/typography';
import ThemePicker from './ThemePicker';
import TextOptions from './TextOptions';
import CollapsibleSection from './CollapsibleSection';

interface AppearanceTabProps {
    isActive: boolean;
    formData: ProfileFormData;
    onAppearanceChange: (appearance: 'light' | 'dark' | 'system') => void;
    contentBackground: string | null;
    onContentBackgroundChange: (background: string | null) => void;
    theme: string | null;
    onThemeChange: (theme: string) => void;
    customCss: string;
    onCustomCssChange: (css: string) => void;
    textScale: TextScale;
    boldText: boolean;
    onTextScaleChange: (scale: TextScale) => void;
    onBoldTextChange: (bold: boolean) => void;
}

interface BackgroundCardProps {
    label: string;
    caption?: string;
    imageUrl?: string;
    selected: boolean;
    onSelect: () => void;
}

const BackgroundCard: React.FC<BackgroundCardProps> = ({
    label,
    caption,
    imageUrl,
    selected,
    onSelect,
}) => (
    <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="group text-left focus:outline-none"
    >
        <div
            className={`relative aspect-[16/10] overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 transition-shadow ${
                selected
                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
                    : 'group-focus-visible:ring-2 group-focus-visible:ring-blue-400'
            }`}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            ) : (
                <NoSymbolIcon className="absolute inset-0 m-auto h-5 w-5 text-gray-400 dark:text-gray-500" />
            )}
            {selected && (
                <CheckCircleIcon className="absolute top-1 right-1 h-4 w-4 text-white drop-shadow" />
            )}
        </div>
        <p className="mt-1 text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
            {label}
        </p>
        {caption && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {caption}
            </p>
        )}
    </button>
);

const AppearanceTab: React.FC<AppearanceTabProps> = ({
    isActive,
    formData,
    onAppearanceChange,
    contentBackground,
    onContentBackgroundChange,
    theme,
    onThemeChange,
    customCss,
    onCustomCssChange,
    textScale,
    boldText,
    onTextScaleChange,
    onBoldTextChange,
}) => {
    const { t } = useTranslation();

    if (!isActive) return null;

    // The name of the theme in use, so it stays visible while the section
    // that holds it is closed.
    const themeName =
        theme === CUSTOM_THEME_ID
            ? t('profile.customTheme', 'Custom theme')
            : THEMES.find((preset) => preset.id === theme)?.name ||
              t('profile.defaultTheme', 'Default');

    // The same for the background, but only once there is one to name: no
    // background is the app as it looks, so it is not worth saying.
    const backgroundName = contentBackground
        ? CONTENT_BACKGROUNDS.find((bg) => bg.id === contentBackground)?.name ||
          null
        : null;

    // And for the text: the size, with a note that it is bold.
    const textName = [
        t(`profile.textSizes.${textScale}`, 'Default'),
        boldText ? t('profile.boldTextShort', 'bold') : null,
    ]
        .filter(Boolean)
        .join(' \u00b7 ');

    const customizeSummary = [themeName, textName, backgroundName]
        .filter(Boolean)
        .join(' \u00b7 ');

    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <SwatchIcon className="w-6 h-6 mr-3 text-blue-500" />
                {t('profile.appearance', 'Appearance')}
            </h3>

            {/* Mode */}
            <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                    {t('profile.mode', 'Mode')}
                </h4>
                <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => onAppearanceChange('light')}
                        className={`flex items-center justify-center px-5 py-2 text-sm font-medium transition-colors ${
                            formData.appearance === 'light'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                    >
                        <SunIcon className="h-4 w-4 mr-2" />
                        {t('profile.lightMode', 'Light')}
                    </button>
                    <button
                        type="button"
                        onClick={() => onAppearanceChange('dark')}
                        className={`flex items-center justify-center px-5 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-600 transition-colors ${
                            formData.appearance === 'dark'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                    >
                        <MoonIcon className="h-4 w-4 mr-2" />
                        {t('profile.darkMode', 'Dark')}
                    </button>
                    <button
                        type="button"
                        onClick={() => onAppearanceChange('system')}
                        className={`flex items-center justify-center px-5 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-600 transition-colors ${
                            formData.appearance === 'system'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                    >
                        <ComputerDesktopIcon className="h-4 w-4 mr-2" />
                        {t('profile.systemMode', 'System')}
                    </button>
                </div>
            </div>

            {/* Customize */}
            <div className="mb-8">
                <CollapsibleSection
                    title={t('profile.customize', 'Customize')}
                    icon={<PaintBrushIcon className="h-4 w-4 text-blue-500" />}
                    defaultOpen={false}
                    summary={customizeSummary}
                    testId="customize-section"
                >
                    <div className="space-y-2">
                        {/* The colours of the app. */}
                        <CollapsibleSection
                            variant="plain"
                            title={t('profile.theme', 'Theme')}
                            icon={
                                <SwatchIcon className="h-4 w-4 text-gray-400" />
                            }
                            summary={themeName}
                            testId="palette-section"
                        >
                            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                                {t(
                                    'profile.themeDescription',
                                    'Pick a theme. Every button, link and highlight follows it, in light and in dark mode.'
                                )}
                            </p>
                            <ThemePicker
                                theme={theme}
                                onThemeChange={onThemeChange}
                                customCss={customCss}
                                onCustomCssChange={onCustomCssChange}
                            />
                        </CollapsibleSection>

                        <div className="border-t border-gray-200 dark:border-gray-700" />

                        {/* How big and how heavy the text is. */}
                        <CollapsibleSection
                            variant="plain"
                            title={t('profile.text', 'Text')}
                            icon={
                                <BoldIcon className="h-4 w-4 text-gray-400" />
                            }
                            summary={textName}
                            testId="text-section"
                        >
                            <TextOptions
                                textScale={textScale}
                                boldText={boldText}
                                onTextScaleChange={onTextScaleChange}
                                onBoldTextChange={onBoldTextChange}
                            />
                        </CollapsibleSection>

                        <div className="border-t border-gray-200 dark:border-gray-700" />

                        {/* A photo behind the main content. */}
                        <CollapsibleSection
                            variant="plain"
                            title={t('profile.contentBackground', 'Background')}
                            icon={
                                <PhotoIcon className="h-4 w-4 text-gray-400" />
                            }
                            summary={backgroundName}
                            testId="background-section"
                        >
                            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                                {t(
                                    'profile.contentBackgroundDescription',
                                    'Show a photo behind the main content area. Photos come from Unsplash and are credited to their photographers.'
                                )}
                            </p>
                            <div
                                className="grid grid-cols-3 sm:grid-cols-4 gap-3"
                                data-testid="content-background-cards"
                            >
                                <BackgroundCard
                                    label={t(
                                        'profile.contentBackgroundNone',
                                        'None'
                                    )}
                                    selected={!contentBackground}
                                    onSelect={() =>
                                        onContentBackgroundChange(null)
                                    }
                                />
                                {CONTENT_BACKGROUNDS.map((bg) => (
                                    <BackgroundCard
                                        key={bg.id}
                                        label={bg.name}
                                        caption={bg.photographer}
                                        imageUrl={contentBackgroundUrl(
                                            bg,
                                            'thumb'
                                        )}
                                        selected={contentBackground === bg.id}
                                        onSelect={() =>
                                            onContentBackgroundChange(bg.id)
                                        }
                                    />
                                ))}
                            </div>
                        </CollapsibleSection>
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
};

export default AppearanceTab;
