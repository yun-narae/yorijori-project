/** @type { import('@storybook/react-vite').StorybookConfig } */
module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: true,
  },
  viteFinal: (config) => {
    return {
      ...config,
      css: {
        postcss: './postcss.config.cjs',
      },
    }
  },
};