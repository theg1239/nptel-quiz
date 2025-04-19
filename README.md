This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
NEXT_PUBLIC_API_URL=https://api.nptelprep.in
SITE_URL=https://nptelprep.in
```

This defines the base URL for API requests and the site URL for sitemap generation.

### Running the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## SEO Features

### Dynamic Sitemap Generation

This project includes a dynamic sitemap generator that indexes:

- Main site pages
- Individual course pages
- Course practice pages
- Various quiz types for each course

The sitemap is automatically generated based on the courses in your database and is accessible at `/sitemap.xml`.

The sitemap generation logic prioritizes:

1. Main site pages
2. Individual course pages
3. Quiz pages sorted by popularity

If you have many courses, the sitemap will automatically prioritize the most important routes to stay within the protocol limits.

### Robots.txt

A robots.txt file is included at `/robots.txt` that points search engines to the sitemap and allows crawling of all pages.

## Deploying to Vercel

When deploying to Vercel, make sure to:

1. Set the environment variables in the Vercel dashboard:

   - `SITE_URL`: Your production URL (e.g., https://nptelprep.in)
   - `NEXT_PUBLIC_API_URL`: Your API URL

2. The included `vercel.json` file ensures proper content types and cache headers for the sitemap and robots.txt files.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
