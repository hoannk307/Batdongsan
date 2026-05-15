
const nextConfig  = {
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  env: {
    // Fallback cho code cũ dùng process.env.API_URL
    // Nguồn thật: NEXT_PUBLIC_API_URL trong .env.local
    API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  },
  reactStrictMode: false,
};

export default nextConfig;
