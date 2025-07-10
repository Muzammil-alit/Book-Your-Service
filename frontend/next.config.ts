import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/admin/login',
        permanent: true,
        locale: false
      },
    ]
  },
  
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      path: false,
      os: false,
      http: false,
      https: false,
      zlib: false,
      util: false,
      url: false,
      assert: false,
      buffer: false,
      process: false,
      querystring: false,
      'fs/promises': false,
    };

    // Add externals for server-side modules
    if (isServer) {
      const nodeExternals = {
        'fs/promises': 'commonjs fs/promises',
        fs: 'commonjs fs',
        path: 'commonjs path',
        os: 'commonjs os',
        net: 'commonjs net',
        tls: 'commonjs tls',
        crypto: 'commonjs crypto',
        stream: 'commonjs stream',
        http: 'commonjs http',
        https: 'commonjs https',
        zlib: 'commonjs zlib',
        util: 'commonjs util',
        url: 'commonjs url',
        assert: 'commonjs assert',
        buffer: 'commonjs buffer',
        process: 'commonjs process',
        querystring: 'commonjs querystring'
      };

      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        nodeExternals
      ];
    }

    // Add module rules for handling node modules
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    return config;
  },
}

export default nextConfig
