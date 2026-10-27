// How the text of the app is painted: how big it is, and whether it is
// bold. The theme (see frontend/constants/themes.ts) is the colour of the
// app; these two are the rest of the look.
//
// The size is a scale on the root font size, so every size that is written
// in rem follows it. The weight is a rule on the document, so a utility
// that asks for another weight still wins.

export const TEXT_SCALES = ['sm', 'md', 'lg', 'xl'] as const;

export type TextScale = (typeof TEXT_SCALES)[number];

export const DEFAULT_TEXT_SCALE: TextScale = 'md';

export const TEXT_SCALE_ATTRIBUTE = 'data-text-scale';
export const BOLD_TEXT_ATTRIBUTE = 'data-bold-text';

export const TEXT_SCALE_STORAGE_KEY = 'textScale';
export const BOLD_TEXT_STORAGE_KEY = 'boldText';

export const isTextScale = (value: unknown): value is TextScale =>
    typeof value === 'string' &&
    (TEXT_SCALES as readonly string[]).includes(value);

/**
 * The size the app is painted with, whatever came out of the storage or
 * the server.
 */
export const toTextScale = (value: unknown): TextScale =>
    isTextScale(value) ? value : DEFAULT_TEXT_SCALE;

/**
 * Paint the app with the size and the weight the user chose.
 */
export function applyTextPreferences(
    scale: TextScale | null | undefined,
    bold: boolean | null | undefined
): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    if (scale) {
        root.setAttribute(TEXT_SCALE_ATTRIBUTE, scale);
    } else {
        root.removeAttribute(TEXT_SCALE_ATTRIBUTE);
    }

    if (bold) {
        root.setAttribute(BOLD_TEXT_ATTRIBUTE, 'on');
    } else {
        root.removeAttribute(BOLD_TEXT_ATTRIBUTE);
    }
}

function readStored(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function storeStored(key: string, value: string | null): void {
    try {
        if (value === null) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, value);
        }
    } catch {
        // Storage is unavailable (private mode); the text still applies.
    }
}

/**
 * The size and the weight of the last session, so the app paints in them
 * before the profile has loaded.
 */
export function readStoredTextScale(): TextScale {
    const stored = readStored(TEXT_SCALE_STORAGE_KEY);
    return isTextScale(stored) ? stored : DEFAULT_TEXT_SCALE;
}

export function storeTextScale(scale: TextScale | null | undefined): void {
    storeStored(TEXT_SCALE_STORAGE_KEY, scale ?? null);
}

export function readStoredBoldText(): boolean {
    return readStored(BOLD_TEXT_STORAGE_KEY) === 'true';
}

export function storeBoldText(bold: boolean | null | undefined): void {
    storeStored(BOLD_TEXT_STORAGE_KEY, bold ? 'true' : null);
}
