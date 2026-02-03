import '@/app/styles/template6.css';

import { Rammetto_One, Urbanist } from 'next/font/google';

import { getServerTemplateConfig } from '@/lib/serverTemplateConfig';
import { getTemplateConfig, TEMPLATE_NAMES } from '@/lib/templateConstants';

import ClientLayoutContent from './ClientLayoutContent';

// Get server configuration
const serverConfig = getServerTemplateConfig();
const templateConfig = getTemplateConfig(TEMPLATE_NAMES.TEMPLATE6);

// Template 6 uses Urbanist font
const urbanist = Urbanist({
  variable: '--font-urbanist',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

// Rammetto One font
const rammettoOne = Rammetto_One({
  variable: '--font-rammetto-one',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

// Template 6 specific metadata
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
    template: TEMPLATE_NAMES.TEMPLATE6,
    'template-name': templateConfig.name,
  },
};

// Template 6 specific viewport
export function generateViewport() {
  return {
    ...serverConfig.viewport,
  };
}

// Template Layout Component
export default function Template6Layout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true} className="template6-html">
      <head>
        <title>{templateConfig.title}</title>
        <link rel="manifest" href={templateConfig.manifest} />
        <link rel="icon" type="image/png" href={serverConfig.favicon} />
        <link rel="apple-touch-icon" href={serverConfig.favicon} />
        <meta name="description" content={templateConfig.description} />
        <meta name="template" content={TEMPLATE_NAMES.TEMPLATE6} />
        <meta name="template-name" content={templateConfig.name} />
      </head>
      <body
        className={`${urbanist.className} ${urbanist.variable} ${rammettoOne.variable} template6-app template6-body antialiased`}
      >
        <ClientLayoutContent>{children}</ClientLayoutContent>
      </body>
    </html>
  );
}
