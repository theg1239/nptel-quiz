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
          '/*?*',
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