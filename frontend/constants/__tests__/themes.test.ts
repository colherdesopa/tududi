import {
    applyCustomTheme,
    applyTheme,
    CUSTOM_THEME_ELEMENT_ID,
    isThemeId,
    readStoredTheme,
    storeTheme,
    THEMES,
    themeTones,
    THEME_ATTRIBUTE,
    THEME_STORAGE_KEY,
    TONES,
} from '../themes';

describe('themes', () => {
    beforeEach(() => {
        document.documentElement.removeAttribute('style');
        document.documentElement.removeAttribute(THEME_ATTRIBUTE);
        document.getElementById(CUSTOM_THEME_ELEMENT_ID)?.remove();
        localStorage.clear();
    });

    describe('isThemeId', () => {
        it('knows the themes', () => {
            THEMES.forEach((theme) => expect(isThemeId(theme.id)).toBe(true));
            expect(isThemeId('custom')).toBe(true);
        });

        it('rejects anything else', () => {
            expect(isThemeId('nonsense')).toBe(false);
            expect(isThemeId('')).toBe(false);
            expect(isThemeId(null)).toBe(false);
        });
    });

    describe('themeTones', () => {
        it('gives every tone of the palette', () => {
            const tones = themeTones(THEMES[0], 'light');

            TONES.forEach((tone) =>
                expect(tones[`--theme-${tone}`]).toMatch(/^\d+ \d+ \d+$/)
            );
        });

        it('keeps the accent as the solid tone', () => {
            const teal = THEMES.find((theme) => theme.id === 'teal')!;
            const tones = themeTones(teal, 'light');

            expect(tones['--theme-600']).toBe('15 118 110');
        });

        it('darkens the surface tones in dark mode', () => {
            const teal = THEMES.find((theme) => theme.id === 'teal')!;
            const light = themeTones(teal, 'light');
            const dark = themeTones(teal, 'dark');

            const lightness = (channels: string) =>
                Number(channels.split(' ')[0]);
            expect(lightness(dark['--theme-50'])).toBeLessThan(
                lightness(light['--theme-50'])
            );
            expect(lightness(dark['--theme-900'])).toBeLessThan(
                lightness(light['--theme-900'])
            );
        });

        it('lightens the tone that carries text in dark mode', () => {
            const teal = THEMES.find((theme) => theme.id === 'teal')!;
            const light = themeTones(teal, 'light');
            const dark = themeTones(teal, 'dark');

            const lightness = (channels: string) =>
                Number(channels.split(' ')[0]);
            expect(lightness(dark['--theme-400'])).toBeGreaterThan(
                lightness(light['--theme-400'])
            );
        });

        it('makes a light accent a neutral theme', () => {
            const white = THEMES.find((theme) => theme.id === 'white')!;
            const tones = themeTones(white, 'light');

            const [r, g, b] = tones['--theme-600'].split(' ').map(Number);
            expect(r).toBe(g);
            expect(g).toBe(b);
        });
    });

    describe('applyTheme', () => {
        it('paints the document with the tones of the theme', () => {
            applyTheme('teal', 'light');

            const root = document.documentElement;
            expect(root.getAttribute(THEME_ATTRIBUTE)).toBe('teal');
            expect(root.style.getPropertyValue('--theme-600')).toBe(
                '15 118 110'
            );
        });

        it('falls back to the default palette', () => {
            applyTheme('teal', 'light');
            applyTheme(null, 'light');

            const root = document.documentElement;
            expect(root.hasAttribute(THEME_ATTRIBUTE)).toBe(false);
            expect(root.style.getPropertyValue('--theme-600')).toBe('');
        });

        it('ignores a theme it does not know', () => {
            applyTheme('nonsense', 'light');

            expect(document.documentElement.hasAttribute(THEME_ATTRIBUTE)).toBe(
                false
            );
        });
    });

    describe('applyCustomTheme', () => {
        it('adds the stylesheet to the page', () => {
            applyCustomTheme(':root { --theme-600: 244 63 94; }');

            const element = document.getElementById(
                CUSTOM_THEME_ELEMENT_ID
            ) as HTMLStyleElement;
            expect(element).not.toBeNull();
            expect(element.textContent).toContain('--theme-600');
        });

        it('replaces the stylesheet instead of adding another one', () => {
            applyCustomTheme(':root { --theme-600: 244 63 94; }');
            applyCustomTheme(':root { --theme-600: 0 0 0; }');

            const elements = document.querySelectorAll(
                `#${CUSTOM_THEME_ELEMENT_ID}`
            );
            expect(elements).toHaveLength(1);
            expect(elements[0].textContent).toContain('0 0 0');
        });

        it('takes the stylesheet away again', () => {
            applyCustomTheme(':root { --theme-600: 244 63 94; }');
            applyCustomTheme('');

            expect(document.getElementById(CUSTOM_THEME_ELEMENT_ID)).toBeNull();
        });
    });

    describe('storage', () => {
        it('keeps the theme between sessions', () => {
            storeTheme('teal');

            expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('teal');
            expect(readStoredTheme()).toBe('teal');
        });

        it('forgets the theme when it is cleared', () => {
            storeTheme('teal');
            storeTheme(null);

            expect(readStoredTheme()).toBeNull();
        });
    });
});
