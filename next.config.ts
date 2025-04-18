import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  requestConfig: './i18n/request.ts'
});

const nextConfig: NextConfig = {
  turbopack: { /* your existing Turbopack opts */ }
};

export default withNextIntl(nextConfig);
