/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: Next.js 16 App Router has no configuration for Route Handler body size limits.
  // For large file uploads (>10MB), we use direct client-to-storage uploads with
  // Supabase signed URLs, which bypasses Next.js entirely. See:
  // - /api/materials/signed-upload-url/route.ts
  // - /api/materials/finalize-upload/route.ts
}

module.exports = nextConfig
