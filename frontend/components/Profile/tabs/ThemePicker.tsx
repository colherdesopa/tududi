import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import {
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    SwatchIcon,
} from '@heroicons/react/24/outline';
import {
    CUSTOM_THEME_ID,
    DEFAULT_THEME_ID,
    THEMES,
    themeTones,
    TONES,
    type Theme,
    type ThemeMode,
} from '../../../constants/themes';

interface ThemePickerProps {
    theme: string | null;
    onThemeChange: (theme: string) => void;
    // The stylesheet of the user's own, if there is one.
    customCss: string;
    onCustomCssChange: (css: string) => void;
}

// A miniature of the app, painted in a theme: the sidebar, a heading, a
// couple of rows and a button. The tones are set on the wrapper, so the
// utilities inside resolve to them.
const ThemePreview: React.FC<{
    tones: Record<string, string>;
    mode: ThemeMode;
}> = ({ tones, mode }) => {
    const dark = mode === 'dark';

    return (
        <div
            className={`h-full w-full border-l border-gray-200 p-1.5 dark:border-gray-700 ${
                dark ? 'bg-gray-900' : 'bg-gray-100'
            }`}
            style={tones}
        >
            <div className="flex h-full gap-1.5">
                <div
                    className={`w-1/3 space-y-1 rounded p-1 ${
                        dark ? 'bg-gray-800' : 'bg-white'
                    }`}
                >
                    <div className="h-1.5 w-2/3 rounded-sm bg-blue-600" />
                    <div className="h-1 w-1/2 rounded-sm bg-gray-300 dark:bg-gray-600" />
                    <div className="h-1 w-3/5 rounded-sm bg-gray-300 dark:bg-gray-600" />
                    <div className="h-1 w-2/5 rounded-sm bg-gray-300 dark:bg-gray-600" />
                </div>
                <div className="flex-1 space-y-1 rounded p-1">
                    <div className="h-1.5 w-1/2 rounded-sm bg-blue-600" />
                    <div className="h-1 w-full rounded-sm bg-gray-300 dark:bg-gray-600" />
                    <div className="h-1 w-4/5 rounded-sm bg-gray-300 dark:bg-gray-600" />
                    <div className="flex gap-1 pt-0.5">
                        <div className="h-2.5 w-8 rounded-sm bg-blue-600" />
                        <div className="h-2.5 w-6 rounded-sm bg-blue-100 dark:bg-blue-900" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ThemeCard: React.FC<{
    name: string;
    theme: Theme;
    selected: boolean;
    onSelect: () => void;
}> = ({ name, theme, selected, onSelect }) => (
    <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={name}
        className="group text-left focus:outline-none"
    >
        <div
            className={`relative overflow-hidden rounded-lg border-2 transition-colors ${
                selected
                    ? 'border-blue-500'
                    : 'border-transparent group-hover:border-gray-300 dark:group-hover:border-gray-600'
            }`}
        >
            <div className="grid grid-cols-2 gap-px">
                <ThemePreview tones={themeTones(theme, 'light')} mode="light" />
                <ThemePreview tones={themeTones(theme, 'dark')} mode="dark" />
            </div>
            {selected && (
                <CheckCircleIcon className="absolute top-1 right-1 h-4 w-4 text-blue-600 dark:text-blue-400 drop-shadow" />
            )}
        </div>
        <p className="mt-1 text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
            {name}
        </p>
    </button>
);

// The stylesheet a theme of the user's own is written against: every
// variable the app reads, with the default tones beside it, so it is clear
// which is which.
const templateCss = (): string => {
    const tones = themeTones(
        THEMES.find((t) => t.id === 'blue')!,
        'light'
    );
    const lines = TONES.map(
        (tone) => `  --theme-${tone}: ${tones[`--theme-${tone}`]};`
    );

    return `/* Tududi theme
 *
 * The palette is eleven tones. Every button, link, badge and highlight in
 * the app is painted with one of them, so setting these recolours it all.
 *
 * Each tone is three numbers: the red, green and blue channels, separated
 * by spaces. The values below are the default theme; change them to make
 * your own. A tone you leave out keeps the default.
 *
 * Put the same variables in a .dark rule to give the dark mode its own
 * tones, or leave it out and the light ones are used in both.
 */

:root {
${lines.join('\n')}
}

/*
.dark {
  --theme-400: 125 211 252;
}
*/
`;
};

const ThemePicker: React.FC<ThemePickerProps> = ({
    theme,
    onThemeChange,
    customCss,
    onCustomCssChange,
}) => {
    const { t } = useTranslation();
    const fileInput = useRef<HTMLInputElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            onCustomCssChange(String(reader.result ?? ''));
            onThemeChange(CUSTOM_THEME_ID);
        };
        reader.readAsText(file);
        // Let the same file be picked again after it changed.
        event.target.value = '';
    };

    const downloadTemplate = () => {
        const blob = new Blob([templateCss()], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'tududi-theme.css';
        link.click();
        URL.revokeObjectURL(url);
        setMenuOpen(false);
    };

    const isCustom = theme === CUSTOM_THEME_ID;

    return (
        <div>
            <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                data-testid="theme-cards"
            >
                <ThemeCard
                    name={t('profile.defaultTheme', 'Default')}
                    theme={
                        THEMES.find((preset) => preset.id === 'blue') ??
                        THEMES[0]
                    }
                    selected={!theme || theme === DEFAULT_THEME_ID}
                    onSelect={() => {
                        onThemeChange(DEFAULT_THEME_ID);
                        onCustomCssChange('');
                    }}
                />
                {THEMES.map((preset) => (
                    <ThemeCard
                        key={preset.id}
                        name={preset.name}
                        theme={preset}
                        selected={theme === preset.id}
                        onSelect={() => {
                            onThemeChange(preset.id);
                            onCustomCssChange('');
                        }}
                    />
                ))}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setMenuOpen((previous) => !previous)}
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        aria-pressed={isCustom}
                        className="group w-full text-left focus:outline-none"
                    >
                        <div
                            className={`relative flex h-full min-h-[76px] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed p-2 text-center ${
                                isCustom
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                        >
                            <SwatchIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {t('profile.customTheme', 'Custom theme')}
                            </span>
                            {customCss && (
                                <CheckCircleIcon className="absolute top-1 right-1 h-4 w-4 text-blue-600 dark:text-blue-400 drop-shadow" />
                            )}
                        </div>
                    </button>

                    {menuOpen && (
                        <div
                            role="menu"
                            className="absolute right-0 z-20 mt-1 w-max min-w-[11rem] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                            data-testid="custom-theme-menu"
                        >
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    setMenuOpen(false);
                                    fileInput.current?.click();
                                }}
                                className="flex w-full items-center gap-2 whitespace-nowrap px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                <ArrowUpTrayIcon className="h-4 w-4 shrink-0 text-gray-400" />
                                {t('profile.uploadTheme', 'Upload a .css file')}
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={downloadTemplate}
                                className="flex w-full items-center gap-2 whitespace-nowrap border-t border-gray-100 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                <ArrowDownTrayIcon className="h-4 w-4 shrink-0 text-gray-400" />
                                {t(
                                    'profile.downloadTemplate',
                                    'Download a template'
                                )}
                            </button>
                            {customCss && (
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        onCustomCssChange('');
                                        onThemeChange(DEFAULT_THEME_ID);
                                        setMenuOpen(false);
                                    }}
                                    className="flex w-full items-center gap-2 whitespace-nowrap border-t border-gray-100 px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50 dark:border-gray-700 dark:text-red-400 dark:hover:bg-gray-700"
                                >
                                    {t('profile.removeTheme', 'Remove it')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <input
                ref={fileInput}
                type="file"
                accept=".css,text/css"
                onChange={handleFile}
                className="hidden"
                data-testid="theme-file-input"
            />

            {customCss && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {t(
                        'profile.customThemeHint',
                        'A stylesheet of your own. It sets the palette variables and overrides the theme above.'
                    )}
                </p>
            )}
        </div>
    );
};

export default ThemePicker;
