import React, { useId, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface CollapsibleSectionProps {
    title: string;
    icon?: React.ReactNode;
    // Whether the section starts open.
    defaultOpen?: boolean;
    // Shown next to the title while the section is closed, so the choice
    // in it stays visible.
    summary?: React.ReactNode;
    // A plain section is a row inside another one; a card stands on its
    // own.
    variant?: 'card' | 'plain';
    testId?: string;
    children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    icon,
    defaultOpen = false,
    summary,
    variant = 'card',
    testId,
    children,
}) => {
    const [open, setOpen] = useState(defaultOpen);
    const panelId = useId();

    const header = (
        <button
            type="button"
            onClick={() => setOpen((previous) => !previous)}
            aria-expanded={open}
            aria-controls={panelId}
            className={`flex w-full items-center justify-between gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset ${
                variant === 'card'
                    ? 'px-4 py-3'
                    : 'rounded-md px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
        >
            <span className="flex min-w-0 items-center gap-2">
                {icon}
                <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                    {title}
                </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
                {!open && summary && (
                    <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {summary}
                    </span>
                )}
                <ChevronDownIcon
                    className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
                        open ? 'rotate-180' : ''
                    }`}
                />
            </span>
        </button>
    );

    if (variant === 'plain') {
        return (
            <div data-testid={testId}>
                {header}
                {open && (
                    <div id={panelId} className="px-2 pt-1 pb-2">
                        {children}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            data-testid={testId}
            className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
        >
            {header}
            {open && (
                <div
                    id={panelId}
                    className="border-t border-gray-200 p-4 dark:border-gray-700"
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default CollapsibleSection;
