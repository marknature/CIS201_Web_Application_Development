/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/Shift_Workforce_Scheduling/dashboard',
        permanent: false,
      },
      {
        source: '/Shift_Workforce_Scheduling',
        destination: '/Shift_Workforce_Scheduling/dashboard',
        permanent: false,
      },
    ];
  },
};
export default nextConfig;
