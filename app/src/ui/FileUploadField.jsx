/**
 * FileUploadField — unified file / image upload component.
 *
 * Three variants:
 *   'dropzone' (default) — bordered dashed zone + preview grid.  Best for most forms.
 *   'compact'            — single-row attach button.  Best for tight layouts.
 *   'avatar'             — circular image with hover-edit overlay.  Best for profile photos.
 *
 * Value contract (mirrors backoffice FileUploadComponent):
 *   { files: File[], existingUrls: string[] }
 *   - null / undefined treated as empty
 *   - Create: { files: [file], existingUrls: [] }
 *   - Edit:   { files: [], existingUrls: ['https://…'] }
 *
 * RHF integration:
 *   <Controller name="logo" control={control}
 *     rules={{ validate: fileUploadRequired }}
 *     render={({ field, fieldState }) => (
 *       <FileUploadField
 *         {...field}
 *         accept="image/jpeg,image/png,image/webp"
 *         acceptLabel="JPG, PNG, WebP"
 *         maxSizeMb={5}
 *         error={fieldState.error?.message}
 *       />
 *     )}
 *   />
 *
 * Uncontrolled / local-state:
 *   const [file, setFile] = useState(EMPTY_FILE_UPLOAD);
 *   <FileUploadField value={file} onChange={setFile} ... />
 */

import { useCallback, useEffect, useId, useRef, useState } from 'react';

import {
  FORM_FIELD_ERROR_CLASS,
  FORM_FIELD_LABEL_CLASS,
  FORM_FIELD_REQUIRED_CLASS,
  FORM_FIELD_WRAPPER_CLASS,
} from '@/lib/constants/formLayout';
import { isImageFile, isImageUrl, normaliseFileUploadValue } from '@/lib/utils/fileUploadUtils';
import { Label } from '@/ui/Label';

// ── Design tokens ─────────────────────────────────────────────────────────────
// Aligned with Dialog.jsx (#080807 / #141412 / #DA9811) and Toast.jsx (#FFB703 ring).

const ZONE_BASE = [
  'relative flex w-full items-center gap-3 rounded-[10px]',
  'border-2 border-dashed border-[#2A2A28] bg-surface',
  'px-4 py-4 transition-colors duration-150',
].join(' ');

const ZONE_IDLE = 'cursor-pointer hover:border-brand/60';
const ZONE_DRAGGING = 'border-brand bg-brand/5';
const ZONE_ERROR = 'border-red-500/50';
const ZONE_DISABLED = 'cursor-not-allowed opacity-50 pointer-events-none';

// ── Shared icons ──────────────────────────────────────────────────────────────

function UploadIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function FileIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function EditPencilIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function XIcon({ size = 10 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M1 1 9 9M9 1 1 9" />
    </svg>
  );
}

// ── Remove button (corner ×) ──────────────────────────────────────────────────

function RemoveCornerButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="text-muted absolute -top-1.5 -right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#080807] ring-1 ring-[#2A2A28] transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB703]"
      aria-label={label}
    >
      <XIcon size={9} />
    </button>
  );
}

// ── Preview card (used by dropzone variant) ───────────────────────────────────

function PreviewCard({ src, name, isImage, isSaved, onRemove, disabled }) {
  return (
    <div className="group relative shrink-0">
      <div className="bg-surface-deep relative h-[56px] w-[56px] overflow-hidden rounded-[8px] border border-[#2A2A28]">
        {isImage && src ? (
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-1">
            <FileIcon className="text-muted" />
            <span className="text-muted line-clamp-2 w-full text-center text-[9px] leading-tight">{name}</span>
          </div>
        )}
        {isSaved && (
          <span className="absolute right-0 bottom-0 left-0 bg-emerald-600/80 py-0.5 text-center text-[9px] leading-none font-bold tracking-wide text-white uppercase">
            Saved
          </span>
        )}
      </div>
      {!disabled && <RemoveCornerButton onClick={onRemove} label={`Remove ${name}`} />}
    </div>
  );
}

// ── Dropzone variant ──────────────────────────────────────────────────────────

function DropzoneVariant({
  inputRef,
  inputId,
  accept,
  acceptLabel,
  maxSizeMb,
  multiple,
  maxFiles,
  error,
  disabled,
  isDragging,
  onInputChange,
  onZoneClick,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  previews,
}) {
  const canAddMore = !maxFiles || previews.length < maxFiles;

  return (
    <div className="flex flex-col gap-3">
      {/* Preview grid */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map(({ key, ...preview }) => (
            <PreviewCard key={key} {...preview} disabled={disabled} />
          ))}
        </div>
      )}

      {/* Drop zone — hidden when max files reached */}
      {canAddMore && (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Upload File — Click or Drag and Drop"
          aria-disabled={disabled}
          onClick={disabled ? undefined : onZoneClick}
          onKeyDown={(e) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onZoneClick();
            }
          }}
          onDragEnter={disabled ? undefined : onDragEnter}
          onDragLeave={disabled ? undefined : onDragLeave}
          onDragOver={disabled ? undefined : onDragOver}
          onDrop={disabled ? undefined : onDrop}
          className={[
            ZONE_BASE,
            disabled ? ZONE_DISABLED : isDragging ? ZONE_DRAGGING : ZONE_IDLE,
            error && !disabled ? ZONE_ERROR : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <UploadIcon className={`shrink-0 ${isDragging ? 'text-brand' : 'text-muted'}`} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-muted text-[13px]">
              Drop here or <span className="text-brand font-semibold">browse</span>
            </p>
            {(acceptLabel || maxSizeMb) && (
              <p className="text-muted/60 text-[11px]">
                {[acceptLabel, maxSizeMb && `Max ${maxSizeMb} MB`].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={onInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}

// ── Compact variant ───────────────────────────────────────────────────────────

function CompactVariant({
  inputRef,
  inputId,
  accept,
  acceptLabel,
  maxSizeMb,
  error,
  disabled,
  onInputChange,
  onZoneClick,
  previews,
}) {
  const hasContent = previews.length > 0;
  const first = previews[0];

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={[
          'flex min-h-[44px] w-full items-center gap-2 rounded-[6px] border px-3',
          error ? 'border-red-500/50' : 'border-[#2A2A28]',
          'bg-surface',
          disabled ? 'opacity-50' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Attach / Change button */}
        <button
          type="button"
          onClick={disabled ? undefined : onZoneClick}
          disabled={disabled}
          className="bg-surface-deep hover:border-brand/50 hover:text-brand shrink-0 rounded-[4px] border border-[#2A2A28] px-3 py-1.5 text-[12px] font-medium text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB703] disabled:cursor-not-allowed"
        >
          {hasContent ? 'Change' : 'Attach file'}
        </button>

        {/* Filename / placeholder */}
        {hasContent ? (
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
            {first?.isSaved && (
              <span className="shrink-0 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-emerald-400 uppercase">
                Saved
              </span>
            )}
            <span className="truncate text-[12px] text-white">{first?.name}</span>
          </div>
        ) : (
          <span className="text-muted min-w-0 flex-1 truncate text-[12px]">
            {[acceptLabel, maxSizeMb && `Max ${maxSizeMb} MB`].filter(Boolean).join(' · ') || 'No file selected'}
          </span>
        )}

        {/* Remove button */}
        {hasContent && !disabled && (
          <button
            type="button"
            onClick={() => first?.onRemove()}
            className="text-muted ml-auto shrink-0 rounded p-0.5 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB703]"
            aria-label="Remove File"
          >
            <XIcon size={12} />
          </button>
        )}
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={onInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}

// ── Avatar variant ────────────────────────────────────────────────────────────

function AvatarVariant({ inputRef, inputId, accept, error, disabled, onInputChange, onZoneClick, previews, avatarSize = 96 }) {
  const first = previews[0];
  const src = first?.src ?? null;
  const hasSrc = Boolean(src);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Circular image / placeholder */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={hasSrc ? 'Change profile photo' : 'Upload profile photo'}
        aria-disabled={disabled}
        onClick={disabled ? undefined : onZoneClick}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onZoneClick();
          }
        }}
        style={{ width: avatarSize, height: avatarSize }}
        className={[
          'group relative overflow-hidden rounded-full border-2 transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB703] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]',
          error ? 'border-red-500/50' : 'hover:border-brand/60 border-[#2A2A28]',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {hasSrc ? (
          <img src={src} alt="" className="h-full w-full object-cover" aria-hidden />
        ) : (
          <div className="bg-surface flex h-full w-full items-center justify-center">
            {/* Generic person placeholder */}
            <svg
              width={Math.round(avatarSize * 0.4)}
              height={Math.round(avatarSize * 0.4)}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted"
              aria-hidden
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <EditPencilIcon className="text-white" />
        </div>
      </div>

      {/* Remove link */}
      {hasSrc && !disabled && (
        <button
          type="button"
          onClick={() => first?.onRemove()}
          className="text-muted text-[12px] leading-none underline underline-offset-2 transition-colors hover:text-red-300 focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[#FFB703]"
        >
          Remove photo
        </button>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={onInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {{
 *   value?: { files: File[], existingUrls: string[] } | null,
 *   onChange?: (value: { files: File[], existingUrls: string[] }) => void,
 *   variant?: 'dropzone' | 'compact' | 'avatar',
 *   accept?: string,
 *   acceptLabel?: string,
 *   maxSizeMb?: number,
 *   maxFiles?: number,
 *   multiple?: boolean,
 *   label?: React.ReactNode,
 *   hint?: string,
 *   required?: boolean,
 *   error?: string,
 *   disabled?: boolean,
 *   id?: string,
 *   name?: string,
 *   avatarSize?: number,
 *   onExistingUrlRemoved?: (url: string) => void,
 * }} props
 */
export function FileUploadField({
  // RHF controlled value
  value,
  onChange,
  // File constraints
  accept = '*',
  acceptLabel = '',
  maxSizeMb,
  maxFiles = 1,
  multiple = false,
  // UI
  variant = 'dropzone',
  label,
  hint,
  required,
  error,
  disabled = false,
  id: idProp,
  name,
  // Avatar variant
  avatarSize = 96,
  // Optional hook for deferred delete API (Phase B)
  onExistingUrlRemoved,
}) {
  const autoId = useId();
  const inputId = idProp ?? autoId;
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Normalised value — always a full { files, existingUrls } object
  const norm = normaliseFileUploadValue(value);

  // ── Blob URL cache ──────────────────────────────────────────────────────────
  // Map<File, string> — create once per File object, revoke on unmount or remove.
  const blobUrlsRef = useRef(/** @type {Map<File, string>} */ (new Map()));

  const getBlobUrl = useCallback((file) => {
    const cache = blobUrlsRef.current;
    if (!cache.has(file)) cache.set(file, URL.createObjectURL(file));
    return cache.get(file);
  }, []);

  const revokeBlobUrl = useCallback((file) => {
    const cache = blobUrlsRef.current;
    const url = cache.get(file);
    if (url) {
      URL.revokeObjectURL(url);
      cache.delete(file);
    }
  }, []);

  // Revoke all blob URLs on unmount
  useEffect(() => {
    const cache = blobUrlsRef.current;
    return () => {
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  // ── File processing ─────────────────────────────────────────────────────────
  const processFiles = useCallback(
    (rawFiles) => {
      const incoming = Array.from(rawFiles);
      if (!incoming.length) return;

      const valid = incoming.filter((file) => {
        if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) return false;
        return true;
      });

      if (!valid.length) return;

      const effectiveMultiple = multiple || maxFiles > 1;
      const current = normaliseFileUploadValue(value);

      let newFiles;
      let newUrls;

      if (effectiveMultiple) {
        const remaining = maxFiles ? maxFiles - current.existingUrls.length : Infinity;
        newFiles = [...current.files, ...valid].slice(0, remaining);
        newUrls = current.existingUrls;
      } else {
        // Single-file: replace everything
        newFiles = valid.slice(0, 1);
        newUrls = [];
      }

      onChange?.({ files: newFiles, existingUrls: newUrls });
    },
    [value, onChange, maxSizeMb, multiple, maxFiles],
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleInputChange = useCallback(
    (e) => {
      if (e.target.files?.length) processFiles(e.target.files);
      // Reset so the same file can be re-selected after removal
      e.target.value = '';
    },
    [processFiles],
  );

  const handleZoneClick = useCallback(() => inputRef.current?.click(), []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
    },
    [processFiles],
  );

  const handleRemoveFile = useCallback(
    (index) => {
      const current = normaliseFileUploadValue(value);
      const removed = current.files[index];
      if (removed) revokeBlobUrl(removed);
      onChange?.({ files: current.files.filter((_, i) => i !== index), existingUrls: current.existingUrls });
    },
    [value, onChange, revokeBlobUrl],
  );

  const handleRemoveUrl = useCallback(
    (url) => {
      const current = normaliseFileUploadValue(value);
      onExistingUrlRemoved?.(url);
      onChange?.({ files: current.files, existingUrls: current.existingUrls.filter((u) => u !== url) });
    },
    [value, onChange, onExistingUrlRemoved],
  );

  // ── Preview items (computed, stable shape) ──────────────────────────────────
  // Build a flat ordered list: existingUrls first, then new files.
  const previews = [
    ...norm.existingUrls.map((url) => ({
      key: `url:${url}`,
      src: url,
      name: (() => {
        try {
          return new URL(url).pathname.split('/').pop() || 'file';
        } catch {
          return url.split('/').pop() || 'file';
        }
      })(),
      isImage: isImageUrl(url),
      isSaved: true,
      onRemove: () => handleRemoveUrl(url),
    })),
    ...norm.files.map((file, i) => ({
      key: `file:${file.name}:${i}`,
      src: isImageFile(file) ? getBlobUrl(file) : null,
      name: file.name,
      isImage: isImageFile(file),
      isSaved: false,
      onRemove: () => handleRemoveFile(i),
    })),
  ];

  // ── Shared props for all variants ───────────────────────────────────────────
  const sharedProps = {
    inputRef,
    inputId,
    accept,
    acceptLabel,
    maxSizeMb,
    maxFiles,
    multiple: multiple || maxFiles > 1,
    error,
    disabled,
    isDragging,
    onInputChange: handleInputChange,
    onZoneClick: handleZoneClick,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
    previews,
    avatarSize,
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={FORM_FIELD_WRAPPER_CLASS}>
      {label && (
        <Label htmlFor={inputId} className={FORM_FIELD_LABEL_CLASS}>
          {label}
          {required && <span className={FORM_FIELD_REQUIRED_CLASS}> *</span>}
        </Label>
      )}

      {variant === 'avatar' && <AvatarVariant {...sharedProps} />}
      {variant === 'compact' && <CompactVariant {...sharedProps} />}
      {(variant === 'dropzone' || !variant) && <DropzoneVariant {...sharedProps} />}

      {hint && !error && <p className="text-muted/80 text-[11px] leading-snug">{hint}</p>}

      {error && (
        <p id={name ? `${name}-error` : undefined} className={FORM_FIELD_ERROR_CLASS} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
