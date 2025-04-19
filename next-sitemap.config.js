/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://nptelprep.in',
  generateRobotsTxt: true,
  sitemapSize: 1000,
  exclude: ['/api/*'],
  robotsTxtOptions: {
    additionalSitemaps: ['https://nptelprep.in/server-sitemap.xml'],
  },
  generateIndexSitemap: true,
  outDir: './public',
};
