import '@/app/styles/template14.css';

import { Rammetto_One, Urbanist } from 'next/font/google';
import localFont from 'next/font/local';

import { getServerTemplateConfig } from '@/lib/serverTemplateConfig';
import { getTemplateConfig, TEMPLATE_NAMES } from '@/lib/templateConstants';

import ClientLayoutContent from './ClientLayoutContent';

// Get server configuration
const serverConfig = getServerTemplateConfig();
const templateConfig = getTemplateConfig(TEMPLATE_NAMES.TEMPLATE14);

// Template 7 uses Urbanist font
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

// Conthrax SemiBold font (replacing Bring Race)
const bringRace = localFont({
  src: '../../fonts/template14/Conthrax-SemiBold.otf',
  variable: '--font-bring-race',
  display: 'swap',
});

// Template 7 specific metadata
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
    template: TEMPLATE_NAMES.TEMPLATE14,
    'template-name': templateConfig.name,
  },
};

// Template 7 specific viewport
export function generateViewport() {
  return {
    ...serverConfig.viewport,
  };
}

// Template Layout Component
export default function Template14Layout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true} className="template14-html">
      <head>
        <title>{templateConfig.title}</title>
        <link rel="manifest" href={templateConfig.manifest} />
        <link rel="icon" type="image/png" href={serverConfig.favicon} />
        <link rel="apple-touch-icon" href={serverConfig.favicon} />
        <meta name="description" content={templateConfig.description} />
        <meta name="template" content={TEMPLATE_NAMES.TEMPLATE14} />
        <meta name="template-name" content={templateConfig.name} />
      </head>
      <body
        className={`${urbanist.className} ${urbanist.variable} ${rammettoOne.variable} ${bringRace.variable} template14-app template14-body antialiased`}
      >
        <ClientLayoutContent>{children}</ClientLayoutContent>
      </body>
    </html>
  );
}
