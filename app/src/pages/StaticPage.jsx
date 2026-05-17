import { useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { useGetStaticPageBySlugQuery } from '@/store/api/staticPageApi';
import { Container } from '@/ui/Container';

function normalizeSlug(raw) {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim().toLowerCase();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed) ? trimmed : '';
}

export default function StaticPage() {
  const { slug } = useParams();
  const normalizedSlug = normalizeSlug(slug);

  const { data, error, isLoading, isFetching } = useGetStaticPageBySlugQuery(normalizedSlug, { skip: !normalizedSlug });

  const is404 = error?.status === 404 || error?.data?.type === 'NOT_FOUND';
  const headerLabel = data?.title ? data.title.toUpperCase() : '';
  const busy = isLoading || isFetching;

  if (!normalizedSlug) {
    return (
      <div className="bg-black">
        <AppSubpageHeader sticky title="" />
        <Container className="pb-8">
          <p className="text-[13px] text-[#A2A6AB] md:text-[14px]">This page could not be found.</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-black">
      <AppSubpageHeader sticky title={headerLabel} />

      <Container className="pb-8">
        {busy && <p className="text-[13px] text-[#A2A6AB] md:text-[14px]">Loading…</p>}

        {!busy && error && (
          <p className="text-[13px] leading-snug text-[#A2A6AB] md:text-[14px]">
            {is404 ? 'This page could not be found.' : getApiErrorMessage(error)}
          </p>
        )}

        {!busy && !error && data && (
          <article
            className="static-page-body text-[13px] leading-relaxed text-[#A2A6AB] md:text-[14px] [&_a]:text-[#FF9700] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[#A2A6AB]/40 [&_blockquote]:pl-4 [&_h1]:mb-4 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-white [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{
              __html: data.content?.trim() ? data.content : '<p>No content yet.</p>',
            }}
          />
        )}
      </Container>
    </div>
  );
}
