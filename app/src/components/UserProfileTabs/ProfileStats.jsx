import { CONTENT_MAX_WIDTH } from './constants';

export function ProfileStats() {
  return (
    <div className={`mx-auto w-full ${CONTENT_MAX_WIDTH} py-6`}>
      <p className="text-center text-sm text-white/60">Stats — matches, runs, wickets, etc.</p>
    </div>
  );
}
