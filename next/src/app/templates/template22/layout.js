import '@/app/styles/template22.css';

import { Urbanist } from 'next/font/google';

import { getServerTemplateConfig } from '@/lib/serverTemplateConfig';
import { getTemplateConfig, TEMPLATE_NAMES } from '@/lib/templateConstants';

import ClientLayoutContent from './ClientLayoutContent';

// Get server configuration
const serverConfig = getServerTemplateConfig();
const templateConfig = getTemplateConfig(TEMPLATE_NAMES.TEMPLATE22);

// Template 17 uses Urbanist font
const urbanist = Urbanist({
  variable: '--font-urbanist',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

// Template 21 specific metadata (use templateConfig.favicon so template22 always gets its favicon)
export const metadata = {
  title: serverConfig.title,
  description: serverConfig.description,
  manifest: templateConfig.manifest,
  icons: {
    icon: templateConfig.favicon,
    apple: templateConfig.favicon,
    shortcut: templateConfig.favicon,
  },
  appleWebApp: serverConfig.appleWebApp,
  other: {
    template: TEMPLATE_NAMES.TEMPLATE22,
    'template-name': templateConfig.name,
  },
};

// Template 17 specific viewport
export function generateViewport() {
  return {
    ...serverConfig.viewport,
  };
}

// Template Layout Component
export default function Template22Layout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true} className="template22-html">
      <head>
        <title>{templateConfig.title}</title>
        <link rel="manifest" href={templateConfig.manifest} />
        <link rel="icon" type="image/png" href={templateConfig.favicon} />
        <link rel="apple-touch-icon" href={templateConfig.favicon} />
        <meta name="description" content={templateConfig.description} />
        <meta name="template" content={TEMPLATE_NAMES.TEMPLATE22} />
        <meta name="template-name" content={templateConfig.name} />
      </head>
      <body
        className={`${urbanist.className} ${urbanist.variable} template22-app template22-body antialiased`}
      >
        <ClientLayoutContent>{children}</ClientLayoutContent>
      </body>
    </html>
  );
}
