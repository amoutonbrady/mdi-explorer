const purgecss = require('@fullhuman/postcss-purgecss')({
	content: ['./src/**/*.ts', './src/**/*.html', './src/**/*.tsx'],
	defaultExtractor: (content) => content.match(/[A-Za-z0-9-_:/]+/g) || [],
});

module.exports = {
	plugins: [require('tailwindcss'), purgecss],
};
