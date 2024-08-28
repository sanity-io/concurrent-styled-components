// eslint-disable-next-line @typescript-eslint/no-var-requires
const preset = require('@sanity/prettier-config')

module.exports = {
  ...preset,
  plugins: [...preset.plugins, 'prettier-plugin-tailwindcss'],
}
