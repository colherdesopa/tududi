import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemePicker from '../ThemePicker';
import { CUSTOM_THEME_ID, THEMES } from '../../../../constants/themes';

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
            onCustomCssChange={onCustomCssChange}
            {...props}
        />
    );
    return { ...utils, onThemeChange, onCustomCssChange };
};

describe('ThemePicker', () => {
    it('shows a Default card and a card for every theme', () => {
        renderPicker();

        expect(screen.getByTestId('theme-cards')).toBeInTheDocument();
        expect(screen.getByText('Default')).toBeInTheDocument();
        THEMES.forEach((theme) => {
            expect(screen.getByText(theme.name)).toBeInTheDocument();
        });
    });

    it('marks nothing chosen as Default', () => {
        renderPicker();

        expect(screen.getByText('Default').closest('button')).toHaveAttribute(
            'aria-pressed',
            'true'
        );
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
        expect(screen.getByText('Default').closest('button')).toHaveAttribute(
            'aria-pressed',
            'false'
        );
    });

    it('clears the stylesheet of the user own when a theme is picked', () => {
        const { onCustomCssChange } = renderPicker({
            theme: 'custom',
            customCss: ':root { --theme-600: 1 2 3; }',
        });

        fireEvent.click(screen.getByText('Teal'));

        expect(onCustomCssChange).toHaveBeenLastCalledWith('');
    });

    it('names the last card Custom theme, never after a file', () => {
        renderPicker({ customCss: ':root { --theme-600: 1 2 3; }' });

        expect(screen.getByText('Custom theme')).toBeInTheDocument();
        expect(screen.queryByText('mine.css')).not.toBeInTheDocument();
    });

    it('offers to upload a file or download a template', () => {
        renderPicker();

        fireEvent.click(screen.getByText('Custom theme'));

        expect(screen.getByTestId('custom-theme-menu')).toBeInTheDocument();
        expect(screen.getByText('Upload a .css file')).toBeInTheDocument();
        expect(screen.getByText('Download a template')).toBeInTheDocument();
        expect(screen.getByTestId('theme-file-input')).toHaveAttribute(
            'accept',
            '.css,text/css'
        );
    });

    it('reads the uploaded file and picks the custom theme', async () => {
        const { onThemeChange, onCustomCssChange } = renderPicker();

        // The upload is reached through a hidden input the browser opens;
        // the handler itself is what carries the behaviour. jsdom has no
        // DataTransfer, so `files` is stubbed, and left configurable because
        // the component clears the input afterwards.
        const input = screen.getByTestId(
            'theme-file-input'
        ) as HTMLInputElement;
        const file = new File([':root { --theme-600: 9 9 9; }'], 'mine.css', {
            type: 'text/css',
        });
        Object.defineProperty(input, 'files', {
            value: [file],
            configurable: true,
        });

        fireEvent.change(input);

        // Reading the file is asynchronous.
        await waitFor(() =>
            expect(onCustomCssChange).toHaveBeenCalledWith(
                ':root { --theme-600: 9 9 9; }'
            )
        );
        expect(onThemeChange).toHaveBeenCalledWith(CUSTOM_THEME_ID);
    });
});
