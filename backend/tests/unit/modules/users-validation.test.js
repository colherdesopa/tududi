const { validateAppearance } = require('../../../modules/users/validation');

describe('users validation: appearance', () => {
    it('keeps the palette as it is', () => {
        expect(validateAppearance({ palette: 'teal' })).toEqual({
            palette: 'teal',
        });
    });

    it('clears the palette when it is empty', () => {
        expect(validateAppearance({ palette: null }).palette).toBeNull();
        expect(validateAppearance({ palette: '' }).palette).toBeNull();
    });

    it('rejects a palette that is not a theme id', () => {
        expect(() => validateAppearance({ palette: 'Teal Theme' })).toThrow(
            /Palette must be the id of a theme/
        );
        expect(() => validateAppearance({ palette: 42 })).toThrow(
            /Palette must be the id of a theme/
        );
    });

    it('keeps a stylesheet of the user own', () => {
        const css = ':root { --theme-600: 244 63 94; }';
        expect(validateAppearance({ customCss: css }).customCss).toBe(css);
    });

    it('clears an empty stylesheet', () => {
        expect(validateAppearance({ customCss: null }).customCss).toBe('');
    });

    it('rejects a stylesheet that is not a stylesheet', () => {
        expect(() => validateAppearance({ customCss: 42 })).toThrow(
            /Custom theme must be a stylesheet/
        );
    });

    it('rejects a stylesheet that is too large', () => {
        expect(() =>
            validateAppearance({ customCss: 'a'.repeat(64 * 1024 + 1) })
        ).toThrow(/Custom theme is too large/);
    });

    it('rejects appearance settings that are not an object', () => {
        expect(() => validateAppearance(null)).toThrow(
            /Appearance settings must be an object/
        );
        expect(() => validateAppearance('dark')).toThrow(
            /Appearance settings must be an object/
        );
        expect(() => validateAppearance(['teal'])).toThrow(
            /Appearance settings must be an object/
        );
    });

    it('leaves the other settings alone', () => {
        expect(
            validateAppearance({
                theme: 'dark',
                contentBackground: 'blue-ink',
            })
        ).toEqual({ theme: 'dark', contentBackground: 'blue-ink' });
    });
});
