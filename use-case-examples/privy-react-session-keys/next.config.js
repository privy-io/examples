const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      // This is hammer approach for local dev. We can't figure out why, but node 18 starts to have
      // issues with local dev seeing multiple reacts.
      react: path.resolve('./node_modules/react'),
    };
    return config;
  },
};
