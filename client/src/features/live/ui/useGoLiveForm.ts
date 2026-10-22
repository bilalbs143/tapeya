import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';

import { useStreamOrientationOptions } from '@/shared/api/enumsApi';
import { getApiErrorMessage } from '@/shared/api/errors';
import { toast } from '@/shared/ui/toast';

import {
  useAcceptBroadcastTermsMutation,
  useCreateBroadcastMutation,
  useUploadBroadcastThumbnailMutation,
} from '../api/liveApi';
import { canSubmitGoLive, isGoLiveThumbFile, validateGoLiveForm } from '../lib/goLiveForm';
import { liveRoutes } from '../routes';

/** Terms, metadata, thumbnail, and create → on-air for GoLivePage. */
export function useGoLiveForm() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: me } = useMeQuery();
  const { options: orientationOptions, isLoading: enumsLoading } = useStreamOrientationOptions();

  const [justAccepted, setJustAccepted] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  /** null = follow first enum option until the operator picks. */
  const [orientationDraft, setOrientationDraft] = useState<string | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);

  const [acceptTerms, acceptState] = useAcceptBroadcastTermsMutation();
  const [createBroadcast, createState] = useCreateBroadcastMutation();
  const [uploadThumb] = useUploadBroadcastThumbnailMutation();

  const termsOk = justAccepted || Boolean(me?.broadcastTermsAcceptedAt);
  const seededOrientation = orientationOptions[0]?.value ?? null;
  const orientation = orientationDraft ?? seededOrientation ?? '';
  const orientationValues = useMemo(() => orientationOptions.map((o) => o.value), [orientationOptions]);

  const thumbPreview = useMemo(() => (thumbFile ? URL.createObjectURL(thumbFile) : null), [thumbFile]);

  useEffect(() => {
    if (!thumbPreview) return undefined;
    return () => URL.revokeObjectURL(thumbPreview);
  }, [thumbPreview]);

  async function onAcceptTerms() {
    try {
      await acceptTerms().unwrap();
      setJustAccepted(true);
    } catch (error) {
      toast({ title: getApiErrorMessage(error, 'Failed to accept terms.'), tone: 'error' });
    }
  }

  function pickThumb(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !isGoLiveThumbFile(file)) return;
    setThumbFile(file);
  }

  async function go(e?: FormEvent) {
    e?.preventDefault();
    const busy = createState.isLoading || enumsLoading;
    const validated = validateGoLiveForm({ title, description, orientation }, orientationValues, busy);
    if (!validated.ok) {
      toast({ title: validated.message, tone: 'error' });
      return;
    }

    try {
      const broadcast = await createBroadcast({
        title: validated.values.title,
        description: validated.values.description.trim() || null,
        orientation: validated.values.orientation,
      }).unwrap();

      if (thumbFile) {
        try {
          await uploadThumb({ streamId: broadcast.streamId, file: thumbFile }).unwrap();
        } catch {
          toast({ title: 'Thumbnail upload failed, continuing with default.', tone: 'error' });
        }
      }

      toast({ title: 'Your stream will appear on the Live hub within about a minute.' });
      navigate(liveRoutes.goLiveSession(broadcast.streamId), { replace: true });
    } catch (error) {
      toast({ title: getApiErrorMessage(error, 'Failed to start your broadcast.'), tone: 'error' });
    }
  }

  const busy = createState.isLoading || enumsLoading;
  const canSubmit = canSubmitGoLive(title, busy, orientation, !enumsLoading && orientationValues.length > 0);

  function goList() {
    navigate(liveRoutes.list());
  }

  return {
    fileRef,
    title,
    setTitle,
    description,
    setDescription,
    orientation,
    setOrientationDraft,
    orientationOptions,
    enumsLoading,
    thumbPreview,
    termsOk,
    acceptState,
    createState,
    busy,
    canSubmit,
    onAcceptTerms,
    pickThumb,
    go,
    goList,
  };
}
