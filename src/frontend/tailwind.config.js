/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#F5F5F5',
        light: {
          textDefault: '#404040',
          bgDefault: '#FDFAF8',
          bgText: '#F6F3F0',
          bgModal: '#F6F3F0',
          bgTab: '#EDEAE6',
          textPaleBg: '#404040',
          textPlaceholder: '#404040',
          textWeakBg: '#FFFFFF',
          buttonPrimaryDefault: '#CFC8C1',
          buttonPrimaryHover: '#E7E0DA',
          buttonPrimaryPress: '#B1ADA8',
          buttonPrimaryDisabled: '#E6E6E6',
          buttonPrimaryBorder: '#8D8D8D',
          buttonSecondaryDefault: '#E2A48B',
          buttonSecondaryHover: '#F4C8B7',
          buttonSecondaryPress: '#CD7450',
          line: '#000000',
          checkboxRing: '#8D8D8D',
          checkboxBg: '#B7B5B5',
        },
        dark: {
          bgDefault: '#111326',
          bgText: '#1E2035',
          bgModal: '#1E2035',
          textDefault: '#FFFFFF',
          buttonPrimaryDefault: '#111326',
          buttonPrimaryHover: '#474C79',
          buttonPrimaryPress: '#000000',
          buttonSecondaryDefault: '#1E2DCB',
          buttonSecondaryHover: '#888FDB',
          buttonSecondaryPress: '#293180',
          line: '#FFFFFF',
        },
      },
      height: {
        screen: ['100vh', '100dvh'],
      },
      minHeight: {
        screen: ['100vh', '100dvh'],
      },
      maxHeight: {
        screen: ['100vh', '100dvh'],
      },
    },
    plugins: [],
  },
}
