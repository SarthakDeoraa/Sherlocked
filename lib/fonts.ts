import localFont from 'next/font/local'

// Vonca font family configuration
export const voncaFont = localFont({
  src: [
    {
      path: '../public/fonts/Vonca-ExtraLight.otf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../public/fonts/Vonca-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/Vonca-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Vonca-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Vonca-Semibold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Vonca-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/Vonca-ExtraBold.otf',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-vonca',
  display: 'swap',
}) 