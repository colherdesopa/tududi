'use strict';

const { PASSWORD_MIN_LENGTH } = require('./userService');

const { ValidationError } = require('../../shared/errors');
const { assertSafeUrl } = require('../url/ssrfGuard');

const VALID_FREQUENCIES = [
    'daily',
    'weekdays',
    'weekly',
    '1h',
    '2h',
    '4h',
    '8h',
    '12h',
];

/**
 * Validate first day of week.
 */
function validateFirstDayOfWeek(value) {
    if (value === undefined) return;
    if (typeof value !== 'number' || value < 0 || value > 6) {
        throw new ValidationError(
            'First day of week must be a number between 0 (Sunday) and 6 (Saturday)',
            'first_day_of_week'
        );
    }
}

/**
 * Validate password.
 */
function validatePassword(password, field = 'password') {
    if (password && password.length < PASSWORD_MIN_LENGTH) {
        throw new ValidationError(
            `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
            field
        );
    }
}

/**
 * Validate task summary frequency.
 */
function validateFrequency(frequency) {
    if (!frequency) {
        throw new ValidationError('Frequency is required.');
    }
    if (!VALID_FREQUENCIES.includes(frequency)) {
        throw new ValidationError('Invalid frequency value.');
    }
    return frequency;
}

/**
 * Validate API key ID.
 */
function validateApiKeyId(id) {
    const tokenId = parseInt(id, 10);
    if (Number.isNaN(tokenId)) {
        throw new ValidationError('Invalid API key id.');
    }
    return tokenId;
}

/**
 * Validate API key name.
 */
function validateApiKeyName(name) {
    if (!name || !name.trim()) {
        throw new ValidationError('API key name is required.');
    }
    return name.trim();
}

/**
 * Validate expires_at date.
 */
function validateExpiresAt(expires_at) {
    if (!expires_at) return null;
    const parsedDate = new Date(expires_at);
    if (Number.isNaN(parsedDate.getTime())) {
        throw new ValidationError('expires_at must be a valid date.');
    }
    return parsedDate;
}

const SIDEBAR_ORDER_MAX_ITEMS = 50;
const SIDEBAR_ORDER_MAX_ID_LENGTH = 64;
const SIDEBAR_WIDTH_MIN_PERCENT = 90;
const SIDEBAR_WIDTH_MAX_PERCENT = 110;

// The theme of the interface: the id of a preset, or 'custom' for a
// stylesheet of the user's own.
const PALETTE_ID_PATTERN = /^[a-z][a-z0-9-]{0,31}$/;

// A stylesheet of the user's own. It is added to the page as it is, so it
// is kept small: a theme is a handful of variables, not a stylesheet.
const MAX_CUSTOM_CSS_LENGTH = 64 * 1024;

// The size of the text: a scale on the root font size.
const TEXT_SCALES = ['sm', 'md', 'lg', 'xl'];

/**
 * Validate appearance settings. The palette is the id of a theme, the
 * stylesheet is the user's own CSS; the rest is passed through as it came
 * in.
 */
function validateAppearance(appearance) {
    if (
        appearance === null ||
        typeof appearance !== 'object' ||
        Array.isArray(appearance)
    ) {
        throw new ValidationError('Appearance settings must be an object.');
    }

    const result = { ...appearance };
    if ('palette' in result) {
        const palette = result.palette;
        if (palette === null || palette === '') {
            result.palette = null;
        } else if (
            typeof palette !== 'string' ||
            !PALETTE_ID_PATTERN.test(palette.trim())
        ) {
            throw new ValidationError(
                'Palette must be the id of a theme.',
                'palette'
            );
        } else {
            result.palette = palette.trim();
        }
    }

    if ('customCss' in result) {
        const customCss = result.customCss;
        if (customCss === null || customCss === undefined) {
            result.customCss = '';
        } else if (typeof customCss !== 'string') {
            throw new ValidationError(
                'Custom theme must be a stylesheet.',
                'customCss'
            );
        } else if (customCss.length > MAX_CUSTOM_CSS_LENGTH) {
            throw new ValidationError(
                'Custom theme is too large.',
                'customCss'
            );
        } else {
            result.customCss = customCss;
        }
    }

    if ('textScale' in result) {
        const scale = result.textScale;
        if (scale === null || scale === undefined || scale === '') {
            result.textScale = 'md';
        } else if (typeof scale !== 'string' || !TEXT_SCALES.includes(scale)) {
            throw new ValidationError(
                'Text size must be one of sm, md, lg, xl.',
                'textScale'
            );
        }
    }

    if ('boldText' in result) {
        const bold = result.boldText;
        if (bold === null || bold === undefined) {
            result.boldText = false;
        } else if (typeof bold !== 'boolean') {
            throw new ValidationError(
                'Bold text must be true or false.',
                'boldText'
            );
        }
    }

    return result;
}

/**
 * Validate sidebar settings.
 */
function validateSidebarSettings(body) {
    const {
        pinnedViewsOrder,
        visibleSections,
        widthPercent,
        linkOrder,
        sectionOrder,
    } = body;
    const result = {};

    for (const [name, value] of [
        ['linkOrder', linkOrder],
        ['sectionOrder', sectionOrder],
    ]) {
        if (value === undefined) continue;
        if (
            !Array.isArray(value) ||
            value.length > SIDEBAR_ORDER_MAX_ITEMS ||
            value.some(
                (id) =>
                    typeof id !== 'string' ||
                    id.length === 0 ||
                    id.length > SIDEBAR_ORDER_MAX_ID_LENGTH
            )
        ) {
            throw new ValidationError(
                `${name} must be an array of at most ${SIDEBAR_ORDER_MAX_ITEMS} non-empty strings`
            );
        }
        result[name] = value;
    }

    if (widthPercent !== undefined) {
        if (
            typeof widthPercent !== 'number' ||
            !Number.isFinite(widthPercent) ||
            widthPercent < SIDEBAR_WIDTH_MIN_PERCENT ||
            widthPercent > SIDEBAR_WIDTH_MAX_PERCENT
        ) {
            throw new ValidationError(
                `widthPercent must be a number between ${SIDEBAR_WIDTH_MIN_PERCENT} and ${SIDEBAR_WIDTH_MAX_PERCENT}`
            );
        }
        result.widthPercent = widthPercent;
    }

    if (pinnedViewsOrder !== undefined) {
        if (!Array.isArray(pinnedViewsOrder)) {
            throw new ValidationError('pinnedViewsOrder must be an array');
        }
        result.pinnedViewsOrder = pinnedViewsOrder;
    }

    if (visibleSections !== undefined) {
        if (
            typeof visibleSections !== 'object' ||
            visibleSections === null ||
            Array.isArray(visibleSections)
        ) {
            throw new ValidationError('visibleSections must be an object');
        }
        for (const value of Object.values(visibleSections)) {
            if (typeof value !== 'boolean') {
                throw new ValidationError(
                    'visibleSections values must be booleans'
                );
            }
        }
        result.visibleSections = visibleSections;
    }

    return result;
}

const AI_MODEL_MAX_LENGTH = 200;

// ai_base_url is attacker-controlled: any authenticated user can set it, and
// the server then makes outbound requests to it (backend/modules/ai-assistant
// /service.js). Reuse the same SSRF guard the url-preview module uses rather
// than a bare `new URL()` check, or this becomes a way to reach internal
// services (cloud metadata, other containers) from an authenticated account.
async function validateAiSettings({ ai_base_url, ai_model }) {
    if (
        ai_base_url !== undefined &&
        ai_base_url !== null &&
        ai_base_url !== ''
    ) {
        try {
            await assertSafeUrl(ai_base_url);
        } catch {
            throw new ValidationError(
                'Base URL must be a public http(s) URL on the default port (internal/private/loopback addresses are not allowed)',
                'ai_base_url'
            );
        }
    }
    if (ai_model !== undefined && ai_model !== null) {
        if (typeof ai_model !== 'string') {
            throw new ValidationError('Model must be a string', 'ai_model');
        }
        if (ai_model.length > AI_MODEL_MAX_LENGTH) {
            throw new ValidationError(
                `Model must be ${AI_MODEL_MAX_LENGTH} characters or fewer`,
                'ai_model'
            );
        }
    }
}

module.exports = {
    VALID_FREQUENCIES,
    validateFirstDayOfWeek,
    validatePassword,
    validateFrequency,
    validateApiKeyId,
    validateApiKeyName,
    validateExpiresAt,
    validateSidebarSettings,
    validateAppearance,
    validateAiSettings,
};
