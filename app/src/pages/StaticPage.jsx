import { useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { useGetStaticPageBySlugQuery } from '@/store/api/staticPageApi';
import { Container } from '@/ui/Container';
import { PageLoader } from '@/ui/Loader';

function normalizeSlug(raw) {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim().toLowerCase();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed) ? trimmed : '';
}

/** Strip CMS wrappers that duplicate AppSubpageHeader (outer article + leading h1). */
function prepareStaticHtml(html) {
  if (typeof html !== 'string' || !html.trim()) {
    return '<p>No content yet.</p>';
  }

  let out = html.trim();
  out = out.replace(/^<article[^>]*>/i, '').replace(/<\/article>\s*$/i, '');
  out = out.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '');
  return out.trim() || '<p>No content yet.</p>';
}

const BODY_CLASS = [
  'static-page-body',
  'text-muted text-[13px] leading-relaxed md:text-[14px]',
  '[&_a]:text-brand [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2',
  '[&_strong]:font-semibold [&_strong]:text-white',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-4',
  '[&_h2]:mt-7 [&_h2]:mb-2.5 [&_h2]:text-[15px] [&_h2]:font-bold [&_h2]:tracking-wide [&_h2]:text-white [&_h2]:uppercase',
  '[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-[14px] [&_h3]:font-semibold [&_h3]:text-white',
  '[&_p]:my-3 [&_p]:leading-relaxed',
  '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5',
  '[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5',
  '[&_li]:leading-relaxed',
].join(' ');

export default function StaticPage() {
  const { slug } = useParams();
  const normalizedSlug = normalizeSlug(slug);

  const { data, error, isLoading, isFetching } = useGetStaticPageBySlugQuery(normalizedSlug, { skip: !normalizedSlug });

  const is404 = error?.status === 404 || error?.data?.type === 'NOT_FOUND';
  const headerTitle = data?.title || '';
  const busy = isLoading || isFetching;

  if (!normalizedSlug) {
    return (
      <div className="min-h-dvh bg-black">
        <AppSubpageHeader sticky title="PAGE" />
        <Container className="pb-8">
          <p className="text-muted text-[13px] leading-snug md:text-[14px]">This page could not be found.</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-black">
      <AppSubpageHeader sticky title={headerTitle || ' '} />

      <Container className="pb-8">
        {busy && <PageLoader label="Loading page" />}

        {!busy && error && (
          <p className="text-muted text-[13px] leading-snug md:text-[14px]">
            {is404 ? 'This page could not be found.' : getApiErrorMessage(error)}
          </p>
        )}

        {!busy && !error && data && (
          <article className={BODY_CLASS} dangerouslySetInnerHTML={{ __html: prepareStaticHtml(data.content) }} />
        )}
      </Container>
    </div>
  );
}
