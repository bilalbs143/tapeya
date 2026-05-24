const MESSAGES = {
  idle: 'Stream starting soon',
  starting: 'Connecting to stream…',
  ended: 'Stream has ended',
  error: 'Stream unavailable',
};

export function StreamOfflineSlate({ status = 'idle', fill = false }) {
  const boxClass = fill
    ? 'flex h-full w-full items-center justify-center bg-black text-white/50'
    : 'flex aspect-video w-full items-center justify-center bg-black text-white/50';

  return (
    <div className={boxClass}>
      <div className="text-center">
        <div className="text-4xl">{status === 'ended' ? '🏏' : '📺'}</div>
        <p className="mt-2 text-sm">{MESSAGES[status] ?? 'Stream Unavailable'}</p>
      </div>
    </div>
  );
}
