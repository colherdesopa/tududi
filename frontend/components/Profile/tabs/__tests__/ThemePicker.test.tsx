import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemePicker from '../ThemePicker';
import { THEMES } from '../../../../constants/themes';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: any) =>
            typeof fallback === 'string' ? fallback : key,
    }),
}));

const renderPicker = (
    props: Partial<React.ComponentProps<typeof ThemePicker>> = {}
) => {
    const onThemeChange = jest.fn();
    const onCustomCssChange = jest.fn();
    const utils = render(
        <ThemePicker
            theme={null}
            onThemeChange={onThemeChange}
            customCss=""
            customCssName=""
            onCustomCssChange={onCustomCssChange}
            {...props}
        />
    );
    return { ...utils, onThemeChange, onCustomCssChange };
};

describe('ThemePicker', () => {
    it('shows a card for every theme', () => {
        renderPicker();

        expect(screen.getByTestId('theme-cards')).toBeInTheDocument();
        THEMES.forEach((theme) => {
            expect(screen.getByText(theme.name)).toBeInTheDocument();
        });
    });

    it('picks a theme', () => {
        const { onThemeChange } = renderPicker();

        fireEvent.click(screen.getByText('Teal'));

        expect(onThemeChange).toHaveBeenLastCalledWith('teal');
    });

    it('marks the chosen theme as pressed', () => {
        renderPicker({ theme: 'teal' });

        const teal = screen.getByText('Teal').closest('button');
        expect(teal).toHaveAttribute('aria-pressed', 'true');
    });

    it('offers to upload a stylesheet', () => {
        renderPicker();

        expect(screen.getByText('Upload a theme')).toBeInTheDocument();
        expect(screen.getByTestId('theme-file-input')).toHaveAttribute(
            'accept',
            '.css,text/css'
        );
    });

    it('shows the name of the uploaded stylesheet', () => {
        renderPicker({
            customCss: ':root { --theme-600: 1 2 3; }',
            customCssName: 'mine.css',
        });

        expect(screen.getByText('mine.css')).toBeInTheDocument();
    });
});
