import { Metadata } from 'next';
import AboutClient from './about-client';

export const metadata: Metadata = {
  title: 'About NPTELPrep | Free NPTEL Learning Resources',
  description:
    'Learn about NPTELPrep, our mission to provide free NPTEL learning resources, and the open-source NPTEL API that powers our platform.',
  keywords: [
    'NPTELPrep',
    'NPTEL API',
    'open source NPTEL',
    'free NPTEL resources',
    'NPTEL learning platform',
    'api.nptelprep.in',
  ],
  openGraph: {
    title: 'About NPTELPrep',
    description: 'Learn about NPTELPrep, our mission, and the open-source NPTEL API.',
    type: 'website',
    url: 'https://nptelprep.in/about',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
