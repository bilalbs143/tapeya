/**
 * Manage a user-owned watch-URL stream — edit details, go live, end.
 */

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { LiveStreamThumbnail } from '@/components/live/LiveStreamThumbnail';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { GO_LIVE_THUMBNAIL_UPLOAD_HINT } from '@/lib/constants/streamThumbnail.constants';
import { liveStreamingSchema } from '@/lib/validations/liveStreaming';
import {
  useEndMyLiveStreamMutation,
  useGetMyLiveStreamQuery,
  useStartMyLiveStreamMutation,
  useUpdateMyLiveStreamMutation,
  useUploadMyLiveStreamThumbnailMutation,
} from '@/store/api/liveApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { FileUploadField } from '@/ui/FileUploadField';
import { FormActions } from '@/ui/form/FormActions';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { LoaderBlock } from '@/ui/Loader';
import { StatusPill } from '@/ui/StatusPill';
import { liveStreamStatusLabel, liveStreamStatusTone } from '@/ui/statusPillTones';

const EMPTY_FILE_UPLOAD = { files: [], existingUrls: [] };

export default function LiveStreamingManage() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [thumbnail, setThumbnail] = useState(EMPTY_FILE_UPLOAD);
  const [previewUrl, setPreviewUrl] = useState(null);

  const { data: stream, isLoading, isError } = useGetMyLiveStreamQuery(streamId, { skip: !streamId });
  const [updateStream, { isLoading: isSaving }] = useUpdateMyLiveStreamMutation();
  const [startStream, { isLoading: isStarting }] = useStartMyLiveStreamMutation();
  const [endStream, { isLoading: isEnding }] = useEndMyLiveStreamMutation();
  const [uploadThumbnail, { isLoading: isUploadingThumb }] = useUploadMyLiveStreamThumbnailMutation();

  const status = stream?.stream?.status ?? 'idle';
  const canGoLive = status === 'idle' || status === 'starting';
  const canEnd = status === 'live' || status === 'starting';
  const isEnded = status === 'ended';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(liveStreamingSchema),
    defaultValues: { title: '', streaming_url: '' },
  });

  useEffect(() => {
    if (!stream) return;
    reset({
      title: stream.title ?? '',
      streaming_url: stream.streaming_url ?? '',
    });
    setThumbnail({
      files: [],
      existingUrls: stream.thumbnail_url ? [stream.thumbnail_url] : [],
    });
  }, [stream, reset]);

  useEffect(() => {
    const file = thumbnail.files[0];
    if (!file) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnail]);

  const onSave = async (data) => {
    try {
      await updateStream({
        streamId,
        title: data.title.trim(),
        streaming_url: data.streaming_url.trim(),
      }).unwrap();

      const file = thumbnail.files[0];
      if (file) {
        try {
          await uploadThumbnail({ streamId, file }).unwrap();
          setThumbnail((prev) => ({ ...prev, files: [] }));
        } catch {
          toast.error('Details saved, but thumbnail upload failed.');
          return;
        }
      }

      toast.success('Stream updated.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update stream.'));
    }
  };

  const onGoLive = async () => {
    try {
      await startStream(streamId).unwrap();
      toast.success('Stream is live on the hub.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to go live.'));
    }
  };

  const onEnd = async () => {
    try {
      await endStream(streamId).unwrap();
      toast.success('Stream ended.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to end stream.'));
    }
  };

  const busy = isSaving || isStarting || isEnding || isUploadingThumb;
  const thumbSrc = previewUrl || stream?.thumbnail_url;

  return (
    <div className="bg-black">
      <AppSubpageHeader title="MANAGE STREAM" onBack={() => navigate('/live/streaming')} />
      <Container>
        {isLoading ? (
          <LoaderBlock label="Loading stream" className="py-16" />
        ) : (
          <>
            {isError && <p className="text-sm text-red-400">Stream not found or you do not have access.</p>}

            {stream && (
              <>
                <div className="mb-6">
                  <StatusPill
                    tone={liveStreamStatusTone(status)}
                    pulse={status === 'live' || status === 'starting'}
                    label={liveStreamStatusLabel(status)}
                  />
                </div>

                <FormStack as="form" className="pb-8 lg:items-start lg:gap-y-4" onSubmit={handleSubmit(onSave)}>
                  <FormField label="Title" htmlFor="title" required>
                    <Input
                      id="title"
                      maxLength={100}
                      className="max-w-none"
                      disabled={isEnded}
                      error={errors.title?.message}
                      {...register('title')}
                    />
                  </FormField>

                  <FormField label="Streaming URL" htmlFor="streaming_url" required>
                    <Input
                      id="streaming_url"
                      type="url"
                      maxLength={2048}
                      className="max-w-none"
                      disabled={isEnded}
                      error={errors.streaming_url?.message}
                      {...register('streaming_url')}
                    />
                  </FormField>

                  {!isEnded && (
                    <FileUploadField
                      value={thumbnail}
                      onChange={setThumbnail}
                      variant="dropzone"
                      accept="image/*"
                      acceptLabel="JPG, PNG, WebP"
                      maxSizeMb={5}
                      maxFiles={1}
                      label="Stream Thumbnail"
                      hint={GO_LIVE_THUMBNAIL_UPLOAD_HINT}
                    />
                  )}

                  {thumbSrc && (
                    <div className="w-full max-w-[240px]">
                      <p className="text-muted mb-2 text-[12px]">Thumbnail</p>
                      <LiveStreamThumbnail src={thumbSrc} title={stream.title} eager />
                    </div>
                  )}

                  {!isEnded && (
                    <FormActions align="start" className="flex-col gap-3 sm:flex-row">
                      <Button type="submit" variant="auth" disabled={busy} loading={isSaving} className="w-full sm:w-auto">
                        Save Changes
                      </Button>
                      {canGoLive && (
                        <Button
                          type="button"
                          variant="auth"
                          disabled={busy}
                          loading={isStarting}
                          className="w-full sm:w-auto"
                          onClick={onGoLive}
                        >
                          Go Live
                        </Button>
                      )}
                      {canEnd && (
                        <Button
                          type="button"
                          variant="fixture"
                          disabled={busy}
                          loading={isEnding}
                          className="h-12 w-full font-bold sm:w-auto"
                          onClick={onEnd}
                        >
                          End Stream
                        </Button>
                      )}
                    </FormActions>
                  )}
                </FormStack>

                {canGoLive && (
                  <p className="text-muted -mt-4 mb-8 text-[12px] leading-snug">
                    When your YouTube or Facebook feed is ready, tap Go Live so it appears on the Live hub.
                  </p>
                )}
              </>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
