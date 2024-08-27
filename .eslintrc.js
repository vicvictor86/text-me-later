module.exports = {
  parserOptions: {
    project: 'tsconfig.json',
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
