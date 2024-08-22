module.exports = {
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  extends: [
    '@rocketseat/eslint-config/node',
  ],
  ignorePatterns: [
    '.eslintrc.js',
    'dist',
    'node_modules',
  ],
  rules: {
    "no-useless-constructor": "off",
    "no-new": "off",
  },
};
