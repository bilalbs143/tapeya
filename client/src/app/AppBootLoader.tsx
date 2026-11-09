import { Spinner } from '@/shared/ui/Spinner';

type AppBootLoaderProps = {
  /** Screen-reader only — no visible copy. */
  label?: string | undefined;
};

/** Full-viewport centered spinner — hydrate, Suspense, and route gates. */
export function AppBootLoader({ label = 'Loading' }: AppBootLoaderProps) {
  return (
    <div className="bg-surface flex min-h-[100dvh] w-full items-center justify-center">
      <Spinner size="lg" label={label} />
    </div>
  );
}
