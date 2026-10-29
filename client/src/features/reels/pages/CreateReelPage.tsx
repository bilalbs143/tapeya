import { ScreenBar } from '@/shared/layout';

import { CREATE_REEL_STEPS } from '../lib/createReelFlow';
import { REEL_VIDEO_ACCEPT } from '../lib/reelVideoFormats';
import { CreateReelSteps } from '../ui/CreateReelSteps';
import { useCreateReelFlow } from '../ui/useCreateReelFlow';

/** Create reel — pick → preview → details → multipart upload (session survives navigation). */
export default function CreateReelPage() {
  const {
    fileRef,
    videoRef,
    hashRef,
    uploadSession,
    settingsError,
    refetchSettings,
    step,
    setStep,
    caption,
    setCaption,
    hashtags,
    setHashtags,
    hashEditing,
    setHashEditing,
    selectedFile,
    previewUrl,
    posterUrl,
    isValidatingFile,
    isCapturing,
    error,
    fromPost,
    isBusyPublishing,
    limitsHint,
    openPicker,
    handleFileChange,
    goDetails,
    handlePublish,
    onBack,
    chromeTitle,
    hashLabel,
    captionMax,
  } = useCreateReelFlow();

  const uploadUploading = uploadSession.status === 'uploading';

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept={REEL_VIDEO_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => void handleFileChange(e)}
      />

      <CreateReelSteps
        header={
          <ScreenBar
            title={chromeTitle}
            subtitle={step === CREATE_REEL_STEPS.PREVIEW ? 'Preview Before Posting' : 'Upload a Short Clip'}
            onBack={onBack}
          />
        }
        step={step}
        setStep={setStep}
        videoRef={videoRef}
        hashRef={hashRef}
        previewUrl={previewUrl}
        posterUrl={posterUrl}
        selectedFile={selectedFile}
        caption={caption}
        setCaption={setCaption}
        hashtags={hashtags}
        setHashtags={setHashtags}
        hashEditing={hashEditing}
        setHashEditing={setHashEditing}
        hashLabel={hashLabel}
        captionMax={captionMax}
        fromPost={fromPost}
        error={error}
        limitsHint={limitsHint}
        settingsError={settingsError}
        refetchSettings={refetchSettings}
        uploadUploading={uploadUploading}
        isValidatingFile={isValidatingFile}
        isCapturing={isCapturing}
        isBusyPublishing={isBusyPublishing}
        openPicker={openPicker}
        goDetails={() => void goDetails()}
        handlePublish={(e) => void handlePublish(e)}
      />
    </>
  );
}
