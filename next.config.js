/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: 'loose',
  },
  transpilePackages: ['@vanilla-extract/sprinkles'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['images.ctfassets.net', 'inverse.finance', 'assets.coingecko.com', 'icons.llamao.fi', 'coin-images.coingecko.com', 'token-icons.llamao.fi', 'raw.githubusercontent.com', 'resources.curve.finance'],
  },
  reactStrictMode: true,
  webpack: (config) => {
     config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      '@react-native-async-storage/async-storage': false,
    };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

module.exports = nextConfig;
