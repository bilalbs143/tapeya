/**
 * Create a watch-URL live stream (YouTube / Facebook / HLS).
 */

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { LiveStreamThumbnail } from '@/components/live/LiveStreamThumbnail';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { GO_LIVE_THUMBNAIL_UPLOAD_HINT } from '@/lib/constants/streamThumbnail.constants';
import { liveStreamingSchema } from '@/lib/validations/liveStreaming';
import {
  useCreateMyLiveStreamMutation,
  useStartMyLiveStreamMutation,
  useUploadMyLiveStreamThumbnailMutation,
} from '@/store/api/liveApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { FileUploadField } from '@/ui/FileUploadField';
import { FormActions } from '@/ui/form/FormActions';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';

const EMPTY_FILE_UPLOAD = { files: [], existingUrls: [] };

const DEFAULT_VALUES = {
  title: '',
  streaming_url: '',
};

export default function LiveStreamingCreate() {
  const navigate = useNavigate();
  const toast = useToast();
  const [thumbnail, setThumbnail] = useState(EMPTY_FILE_UPLOAD);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [createStream, { isLoading: isCreating }] = useCreateMyLiveStreamMutation();
  const [startStream, { isLoading: isStarting }] = useStartMyLiveStreamMutation();
  const [uploadThumbnail] = useUploadMyLiveStreamThumbnailMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(liveStreamingSchema),
    defaultValues: DEFAULT_VALUES,
  });

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

  const busy = isCreating || isStarting;

  const onSubmit = async (data) => {
    try {
      const stream = await createStream({
        title: data.title.trim(),
        streaming_url: data.streaming_url.trim(),
      }).unwrap();

      const streamId = stream?.id;
      if (!streamId) {
        toast.error('Stream was created but no id was returned.');
        navigate('/live/streaming', { replace: true });
        return;
      }

      const file = thumbnail.files[0];
      if (file) {
        try {
          await uploadThumbnail({ streamId, file }).unwrap();
        } catch {
          toast.error('Thumbnail upload failed — stream still went live.');
        }
      }

      await startStream(streamId).unwrap();
      toast.success('Stream is live on the hub.');
      navigate('/live/streaming', { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to go live.'));
    }
  };

  return (
    <div className="bg-black">
      <AppSubpageHeader title="ADD LIVE STREAM" onBack={() => navigate('/live/streaming')} />
      <Container>
        <FormStack as="form" className="pb-8 lg:items-start lg:gap-y-4" onSubmit={handleSubmit(onSubmit)}>
          <p className="text-left text-[14px] text-white/90 lg:text-center">
            Paste an HTTPS YouTube watch/embed URL, Facebook Live link, or HLS .m3u8. It goes live on the hub as soon as you
            submit.
          </p>

          <FormField label="Title" htmlFor="title" required>
            <Input
              id="title"
              placeholder="Stream title"
              maxLength={100}
              className="max-w-none"
              error={errors.title?.message}
              {...register('title')}
            />
          </FormField>

          <FormField label="Streaming URL" htmlFor="streaming_url" required>
            <Input
              id="streaming_url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              maxLength={2048}
              className="max-w-none"
              error={errors.streaming_url?.message}
              {...register('streaming_url')}
            />
            <p className="text-muted mt-2 text-[12px] leading-snug">
              Prefer a YouTube watch URL or Facebook <span className="text-white/80">watch/?v=…</span> / page video link. Share
              short links (<span className="text-white/80">share/v/…</span>) often cannot be embedded.
            </p>
          </FormField>

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

          {previewUrl && (
            <div className="w-full max-w-[240px]">
              <p className="text-muted mb-2 text-[12px]">Thumbnail Preview</p>
              <LiveStreamThumbnail src={previewUrl} eager />
            </div>
          )}

          <FormActions align="start">
            <Button type="submit" variant="orange" disabled={busy} loading={busy} className="w-full lg:w-[180px]">
              Go Live
            </Button>
          </FormActions>
        </FormStack>
      </Container>
    </div>
  );
}
