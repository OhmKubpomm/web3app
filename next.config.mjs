const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    dangerouslyAllowSVG: true, // Add this line to allow SVG files
    contentDispositionType: "attachment", // Add this for security
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "adventure-clicker.vercel.app"],
    },
  },
};

export default nextConfig;
