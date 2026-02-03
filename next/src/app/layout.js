/**
 * Main Layout Router - dynamically loads only the active template.
 * This avoids bundling all templates during dev/build, improving perf.
 */

import { DEFAULT_TEMPLATE, TEMPLATE_NAMES } from '@/lib/templateConstants';
import { getCurrentTemplate } from '@/lib/templateLayoutResolver';

const TEMPLATE_LOADERS = {
  [TEMPLATE_NAMES.TEMPLATE1]: () => import('@/app/templates/template1/layout'),
  [TEMPLATE_NAMES.TEMPLATE2]: () => import('@/app/templates/template2/layout'),
  [TEMPLATE_NAMES.TEMPLATE3]: () => import('@/app/templates/template3/layout'),
  [TEMPLATE_NAMES.TEMPLATE4]: () => import('@/app/templates/template4/layout'),
  [TEMPLATE_NAMES.TEMPLATE5]: () => import('@/app/templates/template5/layout'),
  [TEMPLATE_NAMES.TEMPLATE6]: () => import('@/app/templates/template6/layout'),
  [TEMPLATE_NAMES.TEMPLATE7]: () => import('@/app/templates/template7/layout'),
  [TEMPLATE_NAMES.TEMPLATE8]: () => import('@/app/templates/template8/layout'),
  [TEMPLATE_NAMES.TEMPLATE9]: () => import('@/app/templates/template9/layout'),
  [TEMPLATE_NAMES.TEMPLATE10]: () =>
    import('@/app/templates/template10/layout'),
  [TEMPLATE_NAMES.TEMPLATE11]: () =>
    import('@/app/templates/template11/layout'),
  [TEMPLATE_NAMES.TEMPLATE12]: () =>
    import('@/app/templates/template12/layout'),
  [TEMPLATE_NAMES.TEMPLATE13]: () =>
    import('@/app/templates/template13/layout'),
  [TEMPLATE_NAMES.TEMPLATE14]: () =>
    import('@/app/templates/template14/layout'),
  [TEMPLATE_NAMES.TEMPLATE15]: () =>
    import('@/app/templates/template15/layout'),
  [TEMPLATE_NAMES.TEMPLATE16]: () =>
    import('@/app/templates/template16/layout'),
  [TEMPLATE_NAMES.TEMPLATE17]: () =>
    import('@/app/templates/template17/layout'),
  [TEMPLATE_NAMES.TEMPLATE18]: () =>
    import('@/app/templates/template18/layout'),
  [TEMPLATE_NAMES.TEMPLATE19]: () =>
    import('@/app/templates/template19/layout'),
  [TEMPLATE_NAMES.TEMPLATE20]: () =>
    import('@/app/templates/template20/layout'),
  [TEMPLATE_NAMES.TEMPLATE21]: () =>
    import('@/app/templates/template21/layout'),
  [TEMPLATE_NAMES.TEMPLATE22]: () =>
    import('@/app/templates/template22/layout'),
};

async function loadTemplateModule() {
  const currentTemplate = getCurrentTemplate();
  const loader =
    TEMPLATE_LOADERS[currentTemplate] || TEMPLATE_LOADERS[DEFAULT_TEMPLATE];
  return loader();
}

export async function generateMetadata() {
  const mod = await loadTemplateModule();
  return mod.metadata;
}

export async function generateViewport() {
  const mod = await loadTemplateModule();
  return mod.generateViewport ? mod.generateViewport() : undefined;
}

export default async function RootLayout({ children }) {
  const mod = await loadTemplateModule();
  const TemplateLayout = mod.default;
  return <TemplateLayout>{children}</TemplateLayout>;
}
