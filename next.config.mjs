import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: false, // Force enable PWA support for testing in development
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
});


/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default withPWA(nextConfig);
