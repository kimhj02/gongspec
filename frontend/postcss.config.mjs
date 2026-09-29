/** Tailwind CSS를 PostCSS 처리 과정에 연결한다. */
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
