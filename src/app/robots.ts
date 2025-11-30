import { MetadataRoute } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://link-up-web.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/settings',
          '/linkhub/',
          '/verification-pending',
          '/reset-password',
          '/forgot-password',
        ],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}

