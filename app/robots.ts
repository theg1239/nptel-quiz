import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/private/',
          '/*?*', // Disallow duplicate content from query parameters
        ]
      },
      {
        userAgent: 'GPTBot',
        allow: [
          '/courses/',
          '/courses/*/materials',
          '/courses/*/videos'
        ],
        disallow: ['/api/']
      }
    ],
    sitemap: 'https://nptelprep.in/sitemap.xml',
  }
}