/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const skyBlue = '#87CEEB';
const brightBlue = '#4A90E2';
const lightBlue = '#E6F3FF';
const darkBlue = '#2C5282';

export const Colors = {
  light: {
    text: '#1A202C',
    background: '#FFFFFF',
    tint: brightBlue,
    icon: '#4A5568',
    tabIconDefault: '#A0AEC0',
    tabIconSelected: brightBlue,
    primary: skyBlue,
    secondary: lightBlue,
    accent: '#48CAE4',
    success: '#38A169',
    warning: '#D69E2E',
    error: '#E53E3E',
    muted: '#F7FAFC',
    border: '#E2E8F0',
    card: '#FFFFFF',
    shadow: 'rgba(74, 144, 226, 0.1)',
  },
  // Keep dark theme but make it bright-focused
  dark: {
    text: '#1A202C',
    background: '#FFFFFF',
    tint: brightBlue,
    icon: '#4A5568',
    tabIconDefault: '#A0AEC0',
    tabIconSelected: brightBlue,
    primary: skyBlue,
    secondary: lightBlue,
    accent: '#48CAE4',
    success: '#38A169',
    warning: '#D69E2E',
    error: '#E53E3E',
    muted: '#F7FAFC',
    border: '#E2E8F0',
    card: '#FFFFFF',
    shadow: 'rgba(74, 144, 226, 0.1)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
