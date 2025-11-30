'use client';

import { useEffect } from 'react';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://link-up-web.vercel.app';
const appName = 'LinkUp';
const appDescription = 'LinkUp - Modern Social Connection Platform. Connect, discover, and communicate seamlessly with real-time notifications, instant link requests, and a beautiful user experience.';

export default function StructuredData() {
  useEffect(() => {
    // Organization Schema
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: appName,
      url: appUrl,
      logo: `${appUrl}/logo.png`,
      description: appDescription,
      sameAs: [
        // Add your social media links here
        // 'https://twitter.com/linkup',
        // 'https://github.com/linkup',
        // 'https://linkedin.com/company/linkup',
      ],
    };

    // WebApplication Schema
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

    // SoftwareApplication Schema
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

    // Add scripts to document head
    const addStructuredData = (schema: object, id: string) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    };

    // Remove existing structured data if any
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach((script) => {
      if (script.id?.startsWith('linkup-schema-')) {
        script.remove();
      }
    });

    // Add new structured data
    addStructuredData(organizationSchema, 'linkup-schema-organization');
    addStructuredData(webApplicationSchema, 'linkup-schema-webapp');
    addStructuredData(softwareApplicationSchema, 'linkup-schema-software');

    return () => {
      // Cleanup on unmount
      const scripts = document.querySelectorAll('script[id^="linkup-schema-"]');
      scripts.forEach((script) => script.remove());
    };
  }, []);

  return null;
}

