/**
 * Pre-broadcast — route `/live/go-live`. Form only, no camera/permissions yet.
 * Layout mirrors Tournament Request (header + intro copy + FormStack + auth CTA).
 */

import { useEffect, useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { LiveStreamThumbnail } from '@/components/live/LiveStreamThumbnail';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { GO_LIVE_THUMBNAIL_UPLOAD_HINT } from '@/lib/constants/streamThumbnail.constants';
import { createGoLiveSchema } from '@/lib/validations/goLive';
import { useGetMeQuery } from '@/store/api/authApi';
import { getStreamOrientationOptions, toGoLiveOrientationPickerOptions, useGetEnumsQuery } from '@/store/api/enumApi';
import {
  useAcceptBroadcastTermsMutation,
  useCreateBroadcastMutation,
  useUploadBroadcastThumbnailMutation,
} from '@/store/api/liveApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { FileUploadField } from '@/ui/FileUploadField';
import { FormActions } from '@/ui/form/FormActions';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { RadioOptionList } from '@/ui/RadioOptionList';
import { Textarea } from '@/ui/Textarea';

const EMPTY_FILE_UPLOAD = { files: [], existingUrls: [] };

const DEFAULT_VALUES = {
  title: '',
  description: '',
  orientation: '',
};

function GuidelinesGate({ open, onAccept, isAccepting }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 md:items-center">
      <div className="border-surface bg-ink w-full max-w-lg rounded-t-[17px] border-t-2 p-5 md:rounded-[17px] md:border-2">
        <h2 className="text-[14px] font-bold tracking-wide text-[#DA9811] uppercase">Before you go live</h2>
        <ul className="text-muted mt-3 list-disc space-y-2 pl-4 text-[13px] leading-snug">
          <li>No spam, harassment, or abusive behaviour toward viewers.</li>
          <li>No nudity, violence, or other inappropriate content.</li>
          <li>Tapeya staff may end your broadcast and revoke access for violations of these guidelines.</li>
          <li>Broadcasts are capped at 2 hours.</li>
        </ul>
        <Button variant="auth" className="mt-5 w-full" disabled={isAccepting} onClick={onAccept}>
          {isAccepting ? 'Please wait…' : 'I Agree, Continue'}
        </Button>
      </div>
    </div>
  );
}

export default function PreBroadcast() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useAppSelector(selectUser);
  const { data: meResponse } = useGetMeQuery(undefined, { skip: !user?.id });
  const profileUser = meResponse?.data ?? user;
  const [thumbnail, setThumbnail] = useState(EMPTY_FILE_UPLOAD);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [justAccepted, setJustAccepted] = useState(false);

  const [acceptTerms, { isLoading: isAccepting }] = useAcceptBroadcastTermsMutation();
  const [createBroadcast, { isLoading: isCreating }] = useCreateBroadcastMutation();
  const [uploadThumbnail] = useUploadBroadcastThumbnailMutation();
  const { data: enums = {}, isLoading: enumsLoading } = useGetEnumsQuery();

  const orientationOptions = useMemo(() => getStreamOrientationOptions(enums), [enums]);
  const orientationPickerOptions = useMemo(() => toGoLiveOrientationPickerOptions(orientationOptions), [orientationOptions]);
  const goLiveSchema = useMemo(() => createGoLiveSchema(orientationOptions.map((o) => o.value)), [enums]);

  const termsAccepted = justAccepted || Boolean(profileUser?.broadcast_terms_accepted_at);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(goLiveSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (enumsLoading || orientationOptions.length === 0) return;
    reset({
      ...DEFAULT_VALUES,
      orientation: orientationOptions[0]?.value ?? '',
    });
  }, [enumsLoading, enums, orientationOptions, reset]);

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

  const handleAcceptTerms = async () => {
    try {
      await acceptTerms().unwrap();
      setJustAccepted(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to accept terms. Please try again.'));
    }
  };

  const onSubmit = async (data) => {
    try {
      const broadcast = await createBroadcast({
        title: data.title.trim(),
        description: data.description?.trim() || null,
        orientation: data.orientation,
      }).unwrap();

      const streamId = broadcast?.stream_id;

      const file = thumbnail.files[0];
      if (file && streamId) {
        try {
          await uploadThumbnail({ streamId, file }).unwrap();
        } catch {
          // Non-fatal — stream still goes live with the branded placeholder.
          toast.error('Thumbnail upload failed, continuing with default thumbnail.');
        }
      }

      toast.success('Your stream will appear on the Live hub within about a minute.');
      navigate(`/live/go-live/${streamId}`, { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to start your broadcast. Please try again.'));
    }
  };

  const busy = isCreating || enumsLoading || orientationOptions.length === 0;

  return (
    <div className="bg-black">
      <AppSubpageHeader title="GO LIVE" />
      <Container>
        <p className="mb-6 text-left text-[14px] text-white/90 lg:text-center">
          Add a title and optional details for your stream. Camera access is requested after you tap Go Live.
        </p>

        <FormStack as="form" className="pb-8 lg:items-start lg:gap-y-4" onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Title" htmlFor="title" required>
            <Input
              id="title"
              placeholder="What are you streaming?"
              maxLength={100}
              className="max-w-none"
              error={errors.title?.message}
              {...register('title')}
            />
          </FormField>

          <FormField label="Description" htmlFor="description">
            <Textarea
              id="description"
              placeholder="Tell viewers what to expect…"
              rows={4}
              maxLength={500}
              className="max-w-none"
              error={errors.description?.message}
              {...register('description')}
            />
          </FormField>

          <FormField label="Orientation" htmlFor="orientation" required>
            <Controller
              name="orientation"
              control={control}
              render={({ field }) => (
                <RadioOptionList
                  options={orientationPickerOptions}
                  value={field.value}
                  onChange={field.onChange}
                  ariaLabel="Stream orientation"
                />
              )}
            />
            <p className="text-muted mt-2 text-[12px] leading-snug">
              Locked for this stream after you go live. Portrait is the default.
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
            <Button type="submit" variant="auth" disabled={busy} className="w-full lg:w-[150px]">
              {busy ? 'Starting…' : 'Go Live'}
            </Button>
          </FormActions>
        </FormStack>
      </Container>

      <GuidelinesGate open={!termsAccepted} onAccept={handleAcceptTerms} isAccepting={isAccepting} />
    </div>
  );
}
