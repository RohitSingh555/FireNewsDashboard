module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        'shopify-blue': '#3D52A0',
        'shopify-light-blue': '#7091E6',
        'shopify-gray-blue': '#8697C4',
        'shopify-pale-blue': '#ADBBDA',
        'shopify-bg': '#EDE8F5',
      },
    },
  },
  plugins: [],
} 