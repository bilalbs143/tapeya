import { useMemo } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { getApiErrorMessage } from '@/lib/apiErrors';
import { useGetStaticPageBySlugQuery } from '@/store/api/staticPageApi';

export default function StaticPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const normalizedSlug = useMemo(() => {
    if (typeof slug !== 'string') return '';
    const trimmed = slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) return '';
    return trimmed;
  }, [slug]);

  const { data, error, isLoading, isFetching } = useGetStaticPageBySlugQuery(
    normalizedSlug,
    { skip: !normalizedSlug },
  );

  const is404 = error?.status === 404 || error?.data?.type === 'NOT_FOUND';

  const headerLabel =
    data?.title != null && data.title !== '' ? data.title.toUpperCase() : '';

  return (
    <div className="bg-black">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-black px-4 py-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
          aria-label="Back"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="min-w-0 flex-1 pr-9 text-center text-[16px] font-bold tracking-wide text-white uppercase">
          {headerLabel}
        </h1>
      </header>

      <div className="mx-auto w-full max-w-2xl px-4 pt-6 pb-8">
        {normalizedSlug && error && !isLoading && !isFetching && (
          <p className="text-[13px] leading-snug text-[#A2A6AB] md:text-[14px]">
            {is404
              ? 'This page could not be found.'
              : getApiErrorMessage(error)}
          </p>
        )}

        {normalizedSlug && !error && data && (
          <article
            className="static-page-body text-[13px] leading-relaxed text-[#A2A6AB] md:text-[14px] [&_a]:text-[#FF9700] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[#A2A6AB]/40 [&_blockquote]:pl-4 [&_h1]:mb-4 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-white [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{
              __html: data.content?.trim()
                ? data.content
                : '<p>No content yet.</p>',
            }}
          />
        )}
      </div>
    </div>
  );
}
