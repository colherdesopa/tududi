import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { ArrowUpTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import {
    CUSTOM_THEME_ID,
    THEMES,
    themeTones,
    type Theme,
    type ThemeMode,
} from '../../../constants/themes';

interface ThemePickerProps {
    theme: string | null;
    onThemeChange: (theme: string) => void;
    // The stylesheet of the user's own, if there is one.
    customCss: string;
    customCssName: string;
    onCustomCssChange: (css: string, name: string) => void;
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

const ThemePicker: React.FC<ThemePickerProps> = ({
    theme,
    onThemeChange,
    customCss,
    customCssName,
    onCustomCssChange,
}) => {
    const { t } = useTranslation();
    const fileInput = useRef<HTMLInputElement>(null);

    const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            onCustomCssChange(String(reader.result ?? ''), file.name);
            onThemeChange(CUSTOM_THEME_ID);
        };
        reader.readAsText(file);
        // Let the same file be picked again after it changed.
        event.target.value = '';
    };

    return (
        <div>
            <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                data-testid="theme-cards"
            >
                {THEMES.map((preset) => (
                    <ThemeCard
                        key={preset.id}
                        name={preset.name}
                        theme={preset}
                        selected={theme === preset.id}
                        onSelect={() => onThemeChange(preset.id)}
                    />
                ))}
                <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    aria-pressed={theme === CUSTOM_THEME_ID}
                    className="group text-left focus:outline-none"
                >
                    <div
                        className={`flex h-full min-h-[76px] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed p-2 text-center ${
                            theme === CUSTOM_THEME_ID
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                    >
                        {customCss ? (
                            <DocumentTextIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        ) : (
                            <ArrowUpTrayIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        )}
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 break-all">
                            {customCss
                                ? customCssName
                                : t('profile.uploadTheme', 'Upload a theme')}
                        </span>
                    </div>
                </button>
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
