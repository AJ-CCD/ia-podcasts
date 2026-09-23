/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  async headers() {
    return [
      {
        // Our own player can be embedded on the IA WordPress site if needed
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://insideadviser.com.au https://*.insideadviser.com.au",
          },
        ],
      },
    ];
  },
};
export default nextConfig;
