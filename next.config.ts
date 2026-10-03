import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'usmosquefinder.com',
          },
        ],
        destination: 'https://usmosques.com/',
        permanent: true,
      },
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'www.usmosquefinder.com',
          },
        ],
        destination: 'https://usmosques.com/',
        permanent: true,
      },
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'www.usmosques.com',
          },
        ],
        destination: 'https://usmosques.com/',
        permanent: true,
      },
      {
        source: '/:path+',
        has: [
          {
            type: 'host',
            value: 'usmosquefinder.com',
          },
        ],
        destination: 'https://usmosques.com/:path+',
        permanent: true,
      },
      {
        source: '/:path+',
        has: [
          {
            type: 'host',
            value: 'www.usmosquefinder.com',
          },
        ],
        destination: 'https://usmosques.com/:path+',
        permanent: true,
      },
      {
        source: '/:path+',
        has: [
          {
            type: 'host',
            value: 'www.usmosques.com',
          },
        ],
        destination: 'https://usmosques.com/:path+',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
