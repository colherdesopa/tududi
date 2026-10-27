import {
    applyTextPreferences,
    BOLD_TEXT_ATTRIBUTE,
    DEFAULT_TEXT_SCALE,
    isTextScale,
    readStoredBoldText,
    readStoredTextScale,
    storeBoldText,
    storeTextScale,
    TEXT_SCALE_ATTRIBUTE,
    TEXT_SCALE_STORAGE_KEY,
    TEXT_SCALES,
    toTextScale,
} from '../typography';

describe('typography', () => {
    beforeEach(() => {
        document.documentElement.removeAttribute(TEXT_SCALE_ATTRIBUTE);
        document.documentElement.removeAttribute(BOLD_TEXT_ATTRIBUTE);
        localStorage.clear();
    });

    describe('isTextScale', () => {
        it('knows the sizes', () => {
            TEXT_SCALES.forEach((scale) =>
                expect(isTextScale(scale)).toBe(true)
            );
        });

        it('rejects anything else', () => {
            expect(isTextScale('huge')).toBe(false);
            expect(isTextScale('')).toBe(false);
            expect(isTextScale(null)).toBe(false);
        });
    });

    describe('toTextScale', () => {
        it('keeps a size', () => {
            expect(toTextScale('xl')).toBe('xl');
        });

        it('falls back to the default size', () => {
            expect(toTextScale('huge')).toBe(DEFAULT_TEXT_SCALE);
            expect(toTextScale(undefined)).toBe(DEFAULT_TEXT_SCALE);
        });
    });

    describe('applyTextPreferences', () => {
        it('paints the size and the weight on the document', () => {
            applyTextPreferences('lg', true);

            expect(
                document.documentElement.getAttribute(TEXT_SCALE_ATTRIBUTE)
            ).toBe('lg');
            expect(
                document.documentElement.getAttribute(BOLD_TEXT_ATTRIBUTE)
            ).toBe('on');
        });

        it('takes the weight off again', () => {
            applyTextPreferences('lg', true);
            applyTextPreferences('md', false);

            expect(
                document.documentElement.hasAttribute(BOLD_TEXT_ATTRIBUTE)
            ).toBe(false);
        });
    });

    describe('the storage', () => {
        it('keeps the size and the weight of the last session', () => {
            storeTextScale('xl');
            storeBoldText(true);

            expect(readStoredTextScale()).toBe('xl');
            expect(readStoredBoldText()).toBe(true);
        });

        it('falls back to the defaults when there is nothing stored', () => {
            expect(readStoredTextScale()).toBe(DEFAULT_TEXT_SCALE);
            expect(readStoredBoldText()).toBe(false);
        });

        it('forgets a size that is not a size', () => {
            localStorage.setItem(TEXT_SCALE_STORAGE_KEY, 'huge');

            expect(readStoredTextScale()).toBe(DEFAULT_TEXT_SCALE);
        });
    });
});
