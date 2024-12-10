/** @type {import('next').NextConfig} */
// const nextConfig = {
//   async rewrites() {
//     return [
//       {
//         source: '/brl/translate',
//         destination: 'http://127.0.0.1:8000/brl/translate',
//       }
//     ];
//   },
//   async headers() {
//     return [
//       {
//         source: '/api/:path*',
//         headers: [
//           { key: 'Access-Control-Allow-Origin', value: '*' },
//           { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
//           { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
//         ],
//       },
//     ];
//   },
// };
const nextConfig ={}
module.exports = nextConfig;