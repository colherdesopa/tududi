const fontPxToRem = require('./postcss-font-px-to-rem');

module.exports = {
    plugins: [require('tailwindcss'), fontPxToRem, require('autoprefixer')],
};
