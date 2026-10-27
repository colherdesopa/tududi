// The themes of the app.
//
// The palette is eleven CSS variables (--theme-50 … --theme-950) that every
// blue utility in the app resolves to (see tailwind.config.js). A theme is
// a set of those eleven tones, in a light and a dark version, and the app
// paints itself with the one that fits the mode it is in.
//
// A theme of the user's own is a stylesheet that sets the same variables;
// it is added to the page after the app's own, so it wins.

export type ThemeMode = 'light' | 'dark';

export const TONES = [
    50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

export type Tone = (typeof TONES)[number];

export interface Theme {
    id: string;
    name: string;
    // The colour the theme is built from.
    hue: string;
}

export const THEMES: Theme[] = [
    { id: 'red', name: 'Red', hue: '#b91c1c' },
    { id: 'orange', name: 'Orange', hue: '#c2410c' },
    { id: 'yellow', name: 'Yellow', hue: '#ca8a04' },
    { id: 'green', name: 'Green', hue: '#15803d' },
    { id: 'teal', name: 'Teal', hue: '#0f766e' },
    { id: 'cyan', name: 'Cyan', hue: '#0e7490' },
    { id: 'blue', name: 'Blue', hue: '#1d4ed8' },
    { id: 'indigo', name: 'Indigo', hue: '#4338ca' },
    { id: 'purple', name: 'Purple', hue: '#7e22ce' },
    { id: 'pink', name: 'Pink', hue: '#be185d' },
    { id: 'gray', name: 'Gray', hue: '#374151' },
    { id: 'light-gray', name: 'Light gray', hue: '#d1d5db' },
    { id: 'white', name: 'White', hue: '#ffffff' },
];

export const THEME_STORAGE_KEY = 'theme';
export const THEME_ATTRIBUTE = 'data-theme';
export const CUSTOM_THEME_ELEMENT_ID = 'tududi-custom-theme';

// The id of the theme of the user's own.
export const CUSTOM_THEME_ID = 'custom';

export const isThemeId = (theme: unknown): theme is string =>
    typeof theme === 'string' &&
    (theme === CUSTOM_THEME_ID || THEMES.some((preset) => preset.id === theme));

interface Rgb {
    r: number;
    g: number;
    b: number;
}

interface Hsl {
    h: number;
    s: number;
    l: number;
}

const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);

function hexToRgb(hex: string): Rgb | null {
    let value = hex.replace('#', '');
    if (value.length === 3) {
        value = value
            .split('')
            .map((char) => char + char)
            .join('');
    }
    if (value.length !== 6) return null;

    return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16),
    };
}

function rgbToHsl({ r, g, b }: Rgb): Hsl {
    const red = r / 255;
    const green = g / 255;
    const blue = b / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const lightness = (max + min) / 2;
    const delta = max - min;

    if (!delta) return { h: 0, s: 0, l: lightness * 100 };

    const saturation = delta / (1 - Math.abs(2 * lightness - 1));
    let hue: number;
    if (max === red) hue = ((green - blue) / delta) % 6;
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;

    return {
        h: (hue * 60 + 360) % 360,
        s: saturation * 100,
        l: lightness * 100,
    };
}

function hslToRgb({ h, s, l }: Hsl): Rgb {
    const saturation = s / 100;
    const lightness = l / 100;
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const sector = h / 60;
    const second = chroma * (1 - Math.abs((sector % 2) - 1));

    let rgb: [number, number, number];
    if (sector < 1) rgb = [chroma, second, 0];
    else if (sector < 2) rgb = [second, chroma, 0];
    else if (sector < 3) rgb = [0, chroma, second];
    else if (sector < 4) rgb = [0, second, chroma];
    else if (sector < 5) rgb = [second, 0, chroma];
    else rgb = [chroma, 0, second];

    const offset = lightness - chroma / 2;
    return {
        r: Math.round((rgb[0] + offset) * 255),
        g: Math.round((rgb[1] + offset) * 255),
        b: Math.round((rgb[2] + offset) * 255),
    };
}

// How far each tone sits from the accent, in the light and in the dark.
// The light scale runs from a near-white tint down to a near-black shade; the
// dark one keeps the accent's own depth for the solid tones, lightens the
// tone that carries text, and darkens the ones that carry surfaces.
const LIGHT_OFFSETS: Record<Tone, number> = {
    50: 44,
    100: 40,
    200: 34,
    300: 25,
    400: 15,
    500: 7,
    600: 0,
    700: -5,
    800: -13,
    900: -20,
    950: -32,
};

const DARK_OFFSETS: Record<Tone, number> = {
    50: -22,
    100: -18,
    200: -14,
    300: -10,
    400: 47,
    500: -4,
    600: 0,
    700: -8,
    800: -16,
    900: -24,
    950: -32,
};

// The saturation of each tone, relative to the accent's own. The light
// tones keep most of it, the deep ones lose some of it.
const SATURATION_SCALE: Record<Tone, number> = {
    50: 1,
    100: 1,
    200: 1,
    300: 1,
    400: 0.8,
    500: 0.95,
    600: 1,
    700: 0.95,
    800: 0.9,
    900: 0.85,
    950: 0.8,
};

/**
 * The tones of a theme, as the CSS variables that hold them: the space
 * separated channels of every tone.
 */
export function themeTones(
    theme: Theme,
    mode: ThemeMode
): Record<string, string> {
    const rgb = hexToRgb(theme.hue);
    if (!rgb) return {};

    const base = rgbToHsl(rgb);
    // A light accent (white, a light gray) has no depth to spread: a solid
    // tone that light would put white text on a white button, so such a
    // theme becomes a neutral one.
    const neutral = base.l > 62;
    const offsets = mode === 'light' ? LIGHT_OFFSETS : DARK_OFFSETS;

    const tones: Record<string, string> = {};
    for (const tone of TONES) {
        const lightness = neutral
            ? clamp(53.3 + offsets[tone], 4, 97)
            : clamp(base.l + offsets[tone], 4, 97);
        const saturation = neutral
            ? Math.min(base.s, 12)
            : clamp(base.s * SATURATION_SCALE[tone], 0, 100);
        const channel = hslToRgb({ h: base.h, s: saturation, l: lightness });
        tones[`--theme-${tone}`] = `${channel.r} ${channel.g} ${channel.b}`;
    }

    return tones;
}

/**
 * Paint the app in a theme. The tones are set on the document, so every
 * utility that resolves to them follows.
 */
export function applyTheme(
    theme: string | null | undefined,
    mode: ThemeMode
): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const preset = THEMES.find((candidate) => candidate.id === theme);

    if (!preset) {
        root.removeAttribute(THEME_ATTRIBUTE);
        for (const tone of TONES) {
            root.style.removeProperty(`--theme-${tone}`);
        }
        return;
    }

    root.setAttribute(THEME_ATTRIBUTE, preset.id);
    const tones = themeTones(preset, mode);
    for (const [name, value] of Object.entries(tones)) {
        root.style.setProperty(name, value);
    }
}

/**
 * Apply a theme of the user's own: a stylesheet that sets the palette
 * variables. It is added to the page after the app's own stylesheet, so it
 * wins.
 */
export function applyCustomTheme(css: string | null | undefined): void {
    if (typeof document === 'undefined') return;

    const existing = document.getElementById(CUSTOM_THEME_ELEMENT_ID);
    if (!css || !css.trim()) {
        existing?.remove();
        return;
    }

    let element = existing as HTMLStyleElement | null;
    if (!element) {
        element = document.createElement('style');
        element.id = CUSTOM_THEME_ELEMENT_ID;
        document.head.appendChild(element);
    }
    element.textContent = css;
}

/**
 * The theme of the last session, so the app paints in it before the profile
 * has loaded.
 */
export function readStoredTheme(): string | null {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
        return null;
    }
}

export function storeTheme(theme: string | null | undefined): void {
    try {
        if (theme) {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } else {
            localStorage.removeItem(THEME_STORAGE_KEY);
        }
    } catch {
        // Storage is unavailable (private mode); the theme still applies.
    }
}
