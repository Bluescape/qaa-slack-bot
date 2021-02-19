module.exports = {
    env: {
      browser: true,
      commonjs: true,
      es6: true
    },
    extends: [
      'standard'
    ],
    globals: {
      Atomics: 'readonly',
      SharedArrayBuffer: 'readonly',
      test: true,
      expect: true,
      jest: true,
    },
    parserOptions: {
      ecmaVersion: 2018
    },
    rules: {
    }
  }