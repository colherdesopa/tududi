// A font size written in pixels cannot follow the size of the text, because
// the size of the text is a scale on the root font size. Tailwind lets a
// component ask for one anyway (`text-[13.5px]`), and the app does, in about
// a hundred and sixty places.
//
// Rather than edit every one of them, rewrite the declaration at build time:
// divide the pixels by the root size the app ships with (16px at 90%), so the
// computed size is exactly what it was and now moves with the scale.
const ROOT_FONT_SIZE_PX = 16 * 0.9;

const DECIMALS = 5;

module.exports = () => ({
    postcssPlugin: 'font-px-to-rem',
    Declaration(declaration) {
        if (declaration.prop !== 'font-size' || !/\d/.test(declaration.value)) {
            return;
        }

        declaration.value = declaration.value.replace(
            /(\d*\.?\d+)px/g,
            (match, pixels) => {
                const rem = Number(pixels) / ROOT_FONT_SIZE_PX;
                if (!rem) return match;
                return `${rem.toFixed(DECIMALS).replace(/0+$/, '').replace(/\.$/, '')}rem`;
            }
        );
    },
});

module.exports.postcss = true;
