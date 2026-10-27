import React from 'react';
import { useTranslation } from 'react-i18next';
import { TEXT_SCALES, type TextScale } from '../../../constants/typography';

// The label of a size, and the letter that shows it.
const SCALE_LABELS: Record<TextScale, string> = {
    sm: 'Small',
    md: 'Default',
    lg: 'Large',
    xl: 'Extra large',
};

// The size of the letter that shows a size on the button.
const SCALE_PREVIEW: Record<TextScale, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-2xl',
};

interface TextOptionsProps {
    textScale: TextScale;
    boldText: boolean;
    onTextScaleChange: (scale: TextScale) => void;
    onBoldTextChange: (bold: boolean) => void;
}

/**
 * How big the text is, and whether it is bold. The size is a scale on the
 * root font size, so it moves every size in the app; the weight is a rule
 * on the document.
 */
const TextOptions: React.FC<TextOptionsProps> = ({
    textScale,
    boldText,
    onTextScaleChange,
    onBoldTextChange,
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            <div>
                <p className="mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    {t('profile.textSize', 'Text size')}
                </p>
                <div
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 p-1 dark:border-gray-600"
                    data-testid="text-scale-options"
                >
                    {TEXT_SCALES.map((scale) => {
                        const selected = scale === textScale;
                        return (
                            <button
                                key={scale}
                                type="button"
                                onClick={() => onTextScaleChange(scale)}
                                aria-pressed={selected}
                                aria-label={t(
                                    `profile.textSizes.${scale}`,
                                    SCALE_LABELS[scale]
                                )}
                                className={`flex h-9 w-11 items-center justify-center rounded-md transition-colors ${
                                    selected
                                        ? 'bg-blue-500 text-white'
                                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                <span className={SCALE_PREVIEW[scale]}>A</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        {t('profile.boldText', 'Bold text')}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {t(
                            'profile.boldTextDescription',
                            'Heavier text everywhere in the app.'
                        )}
                    </p>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={boldText}
                    aria-label={t('profile.boldText', 'Bold text')}
                    onClick={() => onBoldTextChange(!boldText)}
                    data-testid="bold-text-toggle"
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                        boldText
                            ? 'bg-blue-500'
                            : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                >
                    <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                            boldText ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                    />
                </button>
            </div>

            <p
                className="rounded-md bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                data-testid="text-preview"
            >
                {t(
                    'profile.textPreview',
                    'Tasks, notes and projects read like this.'
                )}
            </p>
        </div>
    );
};

export default TextOptions;
