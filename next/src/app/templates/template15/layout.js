import '@/app/styles/template15.css';

import { Urbanist } from 'next/font/google';
import localFont from 'next/font/local';

import { getServerTemplateConfig } from '@/lib/serverTemplateConfig';
import { getTemplateConfig, TEMPLATE_NAMES } from '@/lib/templateConstants';

import ClientLayoutContent from './ClientLayoutContent';

// Get server configuration
const serverConfig = getServerTemplateConfig();
const templateConfig = getTemplateConfig(TEMPLATE_NAMES.TEMPLATE15);

// Template 15 uses Urbanist font
const urbanist = Urbanist({
  variable: '--font-urbanist',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

// King Town font
const kingTown = localFont({
  src: '../../fonts/template15/king-town.otf',
  variable: '--font-king-town',
  display: 'swap',
});

// Template 15 specific metadata
export const metadata = {
  title: serverConfig.title,
  description: serverConfig.description,
  manifest: templateConfig.manifest,
  icons: {
    icon: serverConfig.favicon,
    apple: serverConfig.favicon,
    shortcut: serverConfig.favicon,
  },
  appleWebApp: serverConfig.appleWebApp,
  other: {
    template: TEMPLATE_NAMES.TEMPLATE15,
    'template-name': templateConfig.name,
  },
};

// Template 15 specific viewport
export function generateViewport() {
  return {
    ...serverConfig.viewport,
  };
}

// Template Layout Component
export default function Template15Layout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true} className="template15-html">
      <head>
        <title>{templateConfig.title}</title>
        <link rel="manifest" href={templateConfig.manifest} />
        <link rel="icon" type="image/png" href={serverConfig.favicon} />
        <link rel="apple-touch-icon" href={serverConfig.favicon} />
        <meta name="description" content={templateConfig.description} />
        <meta name="template" content={TEMPLATE_NAMES.TEMPLATE15} />
        <meta name="template-name" content={templateConfig.name} />
      </head>
      <body
        className={`${urbanist.className} ${urbanist.variable} ${kingTown.className} ${kingTown.variable} template15-app template15-body antialiased`}
      >
        <ClientLayoutContent>{children}</ClientLayoutContent>
      </body>
    </html>
  );
}
