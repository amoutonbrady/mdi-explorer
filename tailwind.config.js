module.exports = {
  theme: {
    extend: {
      gridTemplateColumns: {
        '15': 'repeat(15, minmax(0, 1fr))',
      },
      inset: (theme) => ({
        ...theme('width'),
      }),
    },
  },
  variants: [
    'responsive',
    'group-hover',
    'group-focus',
    'focus-within',
    'first',
    'last',
    'odd',
    'even',
    'hover',
    'focus',
    'active',
    'visited',
    'disabled',
  ],
  plugins: [],
};
