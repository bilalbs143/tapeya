import { useNavigate, useParams } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { PageDock, ScreenBar } from '@/shared/layout';
import { SafeHtml } from '@/shared/ui/SafeHtml';
import { ErrorState, Skeleton } from '@/shared/ui/states';

import { useGetStaticPageBySlugQuery } from '../api/staticPagesApi';
import { cmsSlugFromLegalKey, normalizeCmsSlug } from '../lib/slugs';

/** CMS static page — `/pages/:slug` or `/legal/:key` → CMS slug. */

export default function StaticPage() {
  const navigate = useNavigate();
  const params = useParams();
  const isLegalRoute = params.key != null;
  const slug = isLegalRoute ? cmsSlugFromLegalKey(params.key) : normalizeCmsSlug(params.slug);

  const { data, error, isLoading, isFetching, refetch } = useGetStaticPageBySlugQuery(slug, {
    skip: !slug,
  });

  const busy = isLoading || isFetching;
  const status =
    error && typeof error === 'object' && 'status' in error ? (error as { status?: number | string }).status : null;
  const is404 = status === 404 || status === 'NOT_FOUND';

  return (
    <PageDock
      header={
        <ScreenBar
          title={data?.title ?? 'Page'}
          subtitle={isLegalRoute ? 'Legal' : 'Info'}
          onBack={() => navigate(-1)}
        />
      }
    >
      <div className="flex flex-col px-4 pt-3.5 pb-8">
        {!slug ? <ErrorState title="Page Not Found" description="This link is not valid." /> : null}

        {slug && busy ? (
          <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading Page">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ) : null}

        {slug && !busy && error ? (
          <ErrorState
            title={is404 ? 'Page Not Found' : "Couldn't Load This Page"}
            description={is404 ? 'This page could not be found.' : getApiErrorMessage(error, 'Something went wrong.')}
            onRetry={is404 ? undefined : () => void refetch()}
          />
        ) : null}

        {slug && !busy && !error && data ? (
          <SafeHtml
            as="article"
            profile="cms"
            html={data.content}
            emptyFallback="<p>No content yet.</p>"
            className="text-muted text-sm leading-relaxed [&_a]:text-brand-text [&_a]:font-semibold [&_a]:underline [&_blockquote]:border-border-subtle [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_h1]:mb-4 [&_h1]:text-title-sm [&_h1]:font-extrabold [&_h1]:text-ink [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-body-lg [&_h2]:font-bold [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-body [&_h3]:font-semibold [&_h3]:text-ink [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
          />
        ) : null}
      </div>
    </PageDock>
  );
}
