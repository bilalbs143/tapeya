<?php

namespace App\Streaming;

use App\Events\Broadcast\MatchStreamStatusUpdated;
use App\Models\MatchStream;
use App\Models\TournamentMatch;
use App\Streaming\Data\CreateStreamData;
use App\Streaming\Data\StreamPlayback;
use App\Support\LiveChat\LiveChatRedisKeys;
use Illuminate\Support\Facades\Log;

class MatchStreamService
{
    public function __construct(private StreamProviderResolver $resolver) {}

    public function create(TournamentMatch $match, CreateStreamData $data, int $createdBy): MatchStream
    {
        if ($match->stream?->status === 'live') {
            abort(422, 'A stream is already live for this match.');
        }

        if ($match->stream) {
            $this->resolver->forMatch($match)->deleteStream($match->stream);
            $match->stream->delete();
        }

        $provider = $this->resolver->forMatch($match);

        $stream = MatchStream::create([
            'match_id' => $match->id,
            'provider' => $provider->slug(),
            'status' => 'idle',
            'created_by' => $createdBy,
        ]);

        $provider->createStream($stream, $data);
        $stream->refresh();

        Log::info("Stream created for match {$match->id}", [
            'provider' => $stream->provider,
            'stream_id' => $stream->provider_stream_id,
        ]);

        return $stream;
    }

    public function end(TournamentMatch $match): void
    {
        $stream = $match->stream ?? abort(404, 'No stream found.');
        $this->resolver->forMatch($match)->endStream($stream);
        LiveChatRedisKeys::purgeMatch($match->id);
        broadcast(new MatchStreamStatusUpdated($match->id, 'ended', null));
    }

    public function delete(TournamentMatch $match): void
    {
        $stream = $match->stream ?? abort(404, 'No stream found.');
        $this->resolver->forMatch($match)->deleteStream($stream);
        $stream->delete();
    }

    public function playback(TournamentMatch $match): StreamPlayback
    {
        $stream = $match->stream ?? abort(404, 'No stream found.');

        return $this->resolver->forMatch($match)->playback($stream);
    }

    public function syncStatus(TournamentMatch $match): void
    {
        $stream = $match->stream;
        if (! $stream || in_array($stream->status, ['ended', 'error'], true)) {
            return;
        }

        $before = $stream->status;
        $this->resolver->forMatch($match)->syncStatus($stream);
        $stream->refresh();

        if ($stream->status !== $before) {
            broadcast(new MatchStreamStatusUpdated(
                $match->id,
                $stream->status,
                $stream->status === 'live'
                    ? $this->resolver->forMatch($match)->playback($stream)
                    : null,
            ));

            Log::info("Stream status changed for match {$match->id}", [
                'from' => $before,
                'to' => $stream->status,
            ]);
        }
    }
}
