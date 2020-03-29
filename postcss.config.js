const purgecss = require('@fullhuman/postcss-purgecss')({
  content: ['./src/**/*.ts', './src/**/*.html', './src/**/*.tsx'],
  defaultExtractor: (content) => content.match(/[A-Za-z0-9-_:/]+/g) || [],
});

const isProd = process.env.PARCEL_BUILD_ENV === 'production';

module.exports = {
  plugins: [require('tailwindcss'), ...(isProd ? [purgecss] : [])],
};
