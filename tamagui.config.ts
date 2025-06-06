import { createFont, createTamagui, createTokens } from '@tamagui/core'
import { createAnimations } from '@tamagui/animations-react-native'
import { shorthands } from '@tamagui/shorthands'

const colors = {
  background: '#fff',
  foreground: '#000',
  primary: '#000',
  secondary: '#c00',
}

const animations = createAnimations({})

const systemFont = createFont({
  family: 'Inter',
  size: {
    1: 12,
    2: 14,
    3: 15,
  },
  lineHeight: {
    // 1 will be 22
    2: 22,
  },
  weight: {
    1: '300',
    // 2 will be 300
    3: '600',
  },
  letterSpacing: {
    1: 0,
    2: -1,
    // 3 will be -1
  },
  // face: {
  //   300: { normal: 'Exile' },
  //   600: { normal: 'Inter' },
  // },
})

const size = {
  true: 0,
  0: 0,
  1: 5,
  2: 10,
  3: 15,
  4: 20,
  '-1': -5,
  '-2': -10,
  '-3': -15,
  '-4': -20,
  // ....
}

const tokens = createTokens({
  size,
  space: { ...size },
  radius: { 0: 0, 1: 3, 2: 6, 3: 12 },
  zIndex: { 0: 0, 1: 100, 2: 200 },
  color: { ...colors },
})

const config = createTamagui({
  animations,
  shorthands,
  // fonts: {
  //   heading: systemFont,
  //   body: systemFont,
  // },
  tokens,
  themes: {
    default: {
      // ...spotifyColors,
      //   color: 'red',
    },
  },
  defaultTheme: 'default',
  // componentDefaults: {
  //   Text: {
  //     color: spotifyColors.foreground,
  //     fontSize: 30, // Set default font size to 30px
  //   },
  // },
  settings: {
    disableSSR: true, // for client-side apps gains a bit of performance
  },
})

type AppConfig = typeof config

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config
