import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppearanceTab from '../AppearanceTab';
import type { ProfileFormData } from '../../types';
import { CONTENT_BACKGROUNDS } from '../../../../constants/contentBackgrounds';

jest.mock('react-i18next', () => {
    const t = (key: string, fallback?: any) =>
        typeof fallback === 'string' ? fallback : key;
    const value = { t };
    return { useTranslation: () => value };
});

const renderTab = (
    contentBackground: string | null,
    props: Partial<React.ComponentProps<typeof AppearanceTab>> = {}
) => {
    const onContentBackgroundChange = jest.fn();
    const onThemeChange = jest.fn();
    const onCustomCssChange = jest.fn();
    const onTextScaleChange = jest.fn();
    const onBoldTextChange = jest.fn();
    render(
        <AppearanceTab
            isActive
            formData={{ appearance: 'light' } as ProfileFormData}
            onAppearanceChange={jest.fn()}
            contentBackground={contentBackground}
            onContentBackgroundChange={onContentBackgroundChange}
            theme={null}
            onThemeChange={onThemeChange}
            customCss=""
            onCustomCssChange={onCustomCssChange}
            textScale="md"
            boldText={false}
            onTextScaleChange={onTextScaleChange}
            onBoldTextChange={onBoldTextChange}
            {...props}
        />
    );
    return {
        onContentBackgroundChange,
        onThemeChange,
        onCustomCssChange,
        onTextScaleChange,
        onBoldTextChange,
    };
};

const section = (name: RegExp) => screen.getByRole('button', { name });

const open = (button: HTMLElement) => {
    if (button.getAttribute('aria-expanded') !== 'true') {
        fireEvent.click(button);
    }
};

// Every option lives behind a closed section: the Customize card, and the
// groups inside it.
const openGroup = (name: RegExp) => {
    open(section(/Customize/));
    open(section(name));
};

const cards = () =>
    within(screen.getByTestId('content-background-cards')).getAllByRole(
        'button'
    );

describe('AppearanceTab customize', () => {
    it('keeps every option behind a closed Customize section', () => {
        renderTab('misty-forest');

        expect(section(/Customize/)).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByTestId('palette-section')).not.toBeInTheDocument();
        expect(screen.queryByTestId('text-section')).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('content-background-cards')
        ).not.toBeInTheDocument();
    });

    it('names what is chosen while the section is closed', () => {
        renderTab('misty-forest', { theme: 'teal', boldText: true });

        expect(section(/Customize/)).toHaveTextContent('Teal');
        expect(section(/Customize/)).toHaveTextContent('Misty Forest');
        expect(section(/Customize/)).toHaveTextContent('bold');
    });

    it('opens Customize to its groups, each of them closed', () => {
        renderTab(null);
        open(section(/Customize/));

        expect(screen.getByTestId('palette-section')).toBeInTheDocument();
        expect(screen.getByTestId('text-section')).toBeInTheDocument();
        expect(screen.getByTestId('background-section')).toBeInTheDocument();
        expect(section(/Theme/)).toHaveAttribute('aria-expanded', 'false');
        expect(section(/Text/)).toHaveAttribute('aria-expanded', 'false');
        expect(section(/Background/)).toHaveAttribute('aria-expanded', 'false');
    });
});

describe('AppearanceTab background', () => {
    it('shows a card for None and for every photo, with None selected by default', () => {
        renderTab(null);
        openGroup(/Background/);

        expect(cards()).toHaveLength(CONTENT_BACKGROUNDS.length + 1);
        expect(screen.getByRole('button', { name: 'None' })).toHaveAttribute(
            'aria-pressed',
            'true'
        );
    });

    it('shows each photo with its photographer and marks the chosen one', () => {
        renderTab('misty-forest');
        openGroup(/Background/);

        const card = screen.getByRole('button', { name: /Misty Forest/ });
        expect(card).toHaveAttribute('aria-pressed', 'true');
        expect(card).toHaveTextContent('Adrian Infernus');
        expect(card.querySelector('img')?.getAttribute('src')).toContain(
            'backgrounds/misty-forest-thumb.webp'
        );
        expect(screen.getByRole('button', { name: 'None' })).toHaveAttribute(
            'aria-pressed',
            'false'
        );
    });

    it('reports the picked background, and null for None', () => {
        const { onContentBackgroundChange } = renderTab('misty-forest');
        openGroup(/Background/);

        fireEvent.click(screen.getByRole('button', { name: /Blue Ink/ }));
        expect(onContentBackgroundChange).toHaveBeenLastCalledWith('blue-ink');

        fireEvent.click(screen.getByRole('button', { name: 'None' }));
        expect(onContentBackgroundChange).toHaveBeenLastCalledWith(null);
    });
});

describe('AppearanceTab theme', () => {
    it('offers the theme picker', () => {
        renderTab(null);
        openGroup(/Theme/);

        expect(screen.getByTestId('theme-cards')).toBeInTheDocument();
        expect(screen.getByLabelText('Teal')).toBeInTheDocument();
    });

    it('reports the picked theme', () => {
        const { onThemeChange } = renderTab(null);
        openGroup(/Theme/);

        fireEvent.click(screen.getByLabelText('Teal'));

        expect(onThemeChange).toHaveBeenLastCalledWith('teal');
    });

    it('marks the chosen theme as pressed', () => {
        renderTab(null, { theme: 'teal' });
        openGroup(/Theme/);

        expect(screen.getByLabelText('Teal')).toHaveAttribute(
            'aria-pressed',
            'true'
        );
        expect(screen.getByLabelText('Red')).toHaveAttribute(
            'aria-pressed',
            'false'
        );
    });
});

describe('AppearanceTab text', () => {
    it('offers a size and a weight', () => {
        renderTab(null);
        openGroup(/Text/);

        expect(screen.getByTestId('text-scale-options')).toBeInTheDocument();
        expect(screen.getByLabelText('Default')).toHaveAttribute(
            'aria-pressed',
            'true'
        );
        expect(screen.getByTestId('bold-text-toggle')).toHaveAttribute(
            'aria-checked',
            'false'
        );
    });

    it('reports the picked size', () => {
        const { onTextScaleChange } = renderTab(null);
        openGroup(/Text/);

        fireEvent.click(screen.getByLabelText('Extra large'));

        expect(onTextScaleChange).toHaveBeenLastCalledWith('xl');
    });

    it('reports the weight', () => {
        const { onBoldTextChange } = renderTab(null);
        openGroup(/Text/);

        fireEvent.click(screen.getByTestId('bold-text-toggle'));

        expect(onBoldTextChange).toHaveBeenLastCalledWith(true);
    });
});
