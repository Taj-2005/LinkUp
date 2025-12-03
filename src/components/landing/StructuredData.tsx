'use client';

import { useEffect } from 'react';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://link-up-web.vercel.app'
const appName = 'LinkUp';
const appDescription = 'LinkUp - Modern Social Connection Platform. Connect, discover, and communicate seamlessly with real-time notifications, instant link requests, and a beautiful user experience.';

export default function StructuredData() {
  useEffect(() => {

    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: appName,
      url: appUrl,
      logo: `${appUrl}/logo.png`,
      description: appDescription,
      sameAs: [

      ],
    };

    const webApplicationSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: appName,
      url: appUrl,
      applicationCategory: 'SocialNetworkingApplication',
      operatingSystem: 'Web',
      description: appDescription,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Real-time notifications',
        'Instant link requests',
        'User profile management',
        'Social connections',
        'Dark mode support',
      ],
    };

    const softwareApplicationSchema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: appName,
      applicationCategory: 'SocialNetworkingApplication',
      operatingSystem: 'Web',
      description: appDescription,
      url: appUrl,
      author: {
        '@type': 'Organization',
        name: appName,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5',
        ratingCount: '1',
      },
    };

    const addStructuredData = (schema: object, id: string) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    };

    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach((script) => {
      if (script.id?.startsWith('linkup-schema-')) {
        script.remove();
      }
    });

    addStructuredData(organizationSchema, 'linkup-schema-organization');
    addStructuredData(webApplicationSchema, 'linkup-schema-webapp');
    addStructuredData(softwareApplicationSchema, 'linkup-schema-software');

    return () => {

      const scripts = document.querySelectorAll('script[id^="linkup-schema-"]');
      scripts.forEach((script) => script.remove());
    };
  }, []);

  return null;
}
