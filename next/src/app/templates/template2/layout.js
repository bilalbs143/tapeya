import '@/app/styles/template2.css';

import { Montserrat } from 'next/font/google';
import localFont from 'next/font/local';

import { getServerTemplateConfig } from '@/lib/serverTemplateConfig';
import { getTemplateConfig, TEMPLATE_NAMES } from '@/lib/templateConstants';

import ClientLayoutContent from './ClientLayoutContent';

// Get server configuration
const serverConfig = getServerTemplateConfig();
const templateConfig = getTemplateConfig(TEMPLATE_NAMES.TEMPLATE2);

// Template 2 uses Montserrat font
const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

// Template 2 custom display font (local)
const airstrike = localFont({
  src: '../../fonts/template2/airstrike.ttf',
  variable: '--font-airstrike',
  display: 'swap',
});

// Template 2 specific metadata
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
    template: TEMPLATE_NAMES.TEMPLATE2,
    'template-name': templateConfig.name,
  },
};

// Template 2 specific viewport
export function generateViewport() {
  return {
    ...serverConfig.viewport,
  };
}

// Template Layout Component
export default function Template2Layout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true} className="template2-html">
      <head>
        <title>{templateConfig.title}</title>
        <link rel="manifest" href={templateConfig.manifest} />
        <link rel="icon" type="image/png" href={serverConfig.favicon} />
        <link rel="apple-touch-icon" href={serverConfig.favicon} />
        <meta name="description" content={templateConfig.description} />
        <meta name="template" content={TEMPLATE_NAMES.TEMPLATE2} />
        <meta name="template-name" content={templateConfig.name} />
      </head>
      <body
        className={`${montserrat.className} ${montserrat.variable} ${airstrike.variable} template2-app template2-body antialiased`}
      >
        <ClientLayoutContent>{children}</ClientLayoutContent>
      </body>
    </html>
  );
}
