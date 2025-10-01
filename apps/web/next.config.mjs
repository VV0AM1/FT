import withPWA from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';
const withSentry = (cfg) => cfg;
export default withPWA({
    dest: 'public',
    disable: !isProd,
    register: true,
    skipWaiting: true,
    runtimeCaching: [

    ],
})({
    reactStrictMode: true,
    experimental: { /* keep your existing flags if any */ },
});
