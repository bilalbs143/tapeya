import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  booleanAttribute,
  forwardRef,
  inject,
  numberAttribute,
  EventEmitter,
} from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { TablerIconsModule } from 'angular-tabler-icons';

// ─── Public types ────────────────────────────────────────────────────────────

/**
 * The value emitted/accepted by this control.
 * - `files`        : newly selected File objects (append to FormData on submit)
 * - `existingUrls` : subset of the original existingUrls that the user has NOT removed
 *
 * The control emits `null` when both arrays are empty, so `Validators.required`
 * works without any extra glue.
 */
export interface FileUploadValue {
  files: File[];
  existingUrls: string[];
}

/** Exported validator — use when the field is required and a custom message is needed. */
export function fileUploadRequired(ctrl: AbstractControl): ValidationErrors | null {
  const v = ctrl.value as FileUploadValue | null;
  if (!v || (v.files.length === 0 && v.existingUrls.length === 0)) {
    return { required: true };
  }
  return null;
}

/** Internal model for a single preview card. */
export interface FileEntry {
  /** Stable identifier for @for tracking. */
  id: string;
  /** 'existing' = remote URL from server; 'new' = local blob URL. */
  type: 'existing' | 'new';
  /** Displayable URL — blob: for new, remote URL for existing. */
  url: string;
  /** Present only for type === 'new'. */
  file?: File;
  /** Human-readable filename. */
  name: string;
  /** Present only for type === 'new'. */
  sizeBytes?: number;
  /** True when the MIME type or filename extension indicates an image. */
  isImage: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatIconModule, TablerIconsModule],
  templateUrl: './file-upload.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
  ],
})
export class FileUploadComponent implements ControlValueAccessor, OnChanges {
  // ── Configurable inputs ────────────────────────────────────────────────────

  /** Label shown above the upload zone. */
  @Input() public label = '';

  /**
   * Override the auto-generated hint line.
   * When omitted, hint is built from acceptLabel, maxSizeMb, and recommendedSize.
   */
  @Input() public hint = '';

  /**
   * Accepted MIME types / extensions, forwarded to `<input type="file" accept>`.
   * E.g. `"image/jpeg,image/png,image/webp"` or `"image/*"` or `".csv"`.
   * Default: `"image/*"`.
   */
  @Input() public accept = 'image/*';

  /** Human-readable label for accepted formats, used in the hint. E.g. "JPG, PNG, WebP". */
  @Input() public acceptLabel = '';

  /** Allow multiple file selection. When false, picking a new file replaces the previous one. */
  @Input({ transform: booleanAttribute }) public multiple = false;

  /** Maximum file size in MB (validated client-side before adding to the list). Default: 2 MB. */
  @Input({ transform: numberAttribute }) public maxSizeMb = 2;

  /** Maximum total number of files allowed (multi mode only). Default: 20. */
  @Input({ transform: numberAttribute }) public maxFiles = 20;

  /** Shows an asterisk and affects validation hint text. Does NOT add Validators.required. */
  @Input({ transform: booleanAttribute }) public required = false;

  /** Recommended dimension string shown in the hint. E.g. "360×185 px". */
  @Input() public recommendedSize = '';

  // ── Outputs ────────────────────────────────────────────────────────────────

  /**
   * Fires whenever an *existing* URL card is removed.
   * Useful when the parent needs to send a "remove_logo=1" flag to the backend.
   */
  @Output() public readonly existingUrlRemoved = new EventEmitter<string>();

  // ── View refs ─────────────────────────────────────────────────────────────

  @ViewChild('fileInput') private readonly fileInputRef!: ElementRef<HTMLInputElement>;

  // ── Internal state ────────────────────────────────────────────────────────

  public entries: FileEntry[] = [];
  public isDragging = false;
  public isDisabled = false;
  public validationErrors: string[] = [];

  private blobUrls: string[] = [];
  private readonly destroyRef = inject(DestroyRef);

  // ── ControlValueAccessor ──────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private cvOnChange: (v: FileUploadValue | null) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private cvOnTouched: () => void = () => {};

  constructor() {
    this.destroyRef.onDestroy(() => this.revokeBlobUrls());
  }

  public ngOnChanges(changes: SimpleChanges): void {
    // Re-validate if maxSizeMb or accept changes at runtime.
    if (changes['maxSizeMb'] || changes['accept']) {
      this.revalidateEntries();
    }
  }

  public writeValue(value: FileUploadValue | null): void {
    this.revokeBlobUrls();
    this.entries = [];

    if (!value) return;

    // Restore existing-URL cards (already-saved server files).
    (value.existingUrls ?? []).filter(Boolean).forEach((url, i) => {
      this.entries.push({
        id: `existing-${i}-${url.slice(-24)}`,
        type: 'existing',
        url,
        name: this.filenameFromUrl(url),
        isImage: this.isImageUrl(url),
      });
    });

    // Restore new-file cards (e.g. after a failed submit when caller patches back).
    (value.files ?? []).forEach((file) => {
      const blobUrl = URL.createObjectURL(file);
      this.blobUrls.push(blobUrl);
      this.entries.push(this.buildEntry(file, blobUrl));
    });
  }

  public registerOnChange(fn: (v: FileUploadValue | null) => void): void {
    this.cvOnChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.cvOnTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  // ── Computed properties ───────────────────────────────────────────────────

  public get hasEntries(): boolean {
    return this.entries.length > 0;
  }

  /** True when the user may still add files (not disabled, not at capacity). */
  public get canAddMore(): boolean {
    if (this.isDisabled) return false;
    return this.multiple ? this.entries.length < this.maxFiles : this.entries.length === 0;
  }

  /** Auto-generated hint line assembled from inputs. */
  public get displayHint(): string {
    if (this.hint) return this.hint;
    const parts: string[] = [];
    if (this.acceptLabel) {
      parts.push(this.acceptLabel);
    } else if (this.accept && this.accept !== '*') {
      // Convert "image/jpeg,image/png,image/webp" → "JPEG, PNG, WebP"
      const exts = this.accept
        .split(',')
        .map((a) =>
          a
            .trim()
            .replace(/^(image|application|text)\//, '')
            .replace(/^\*$/, 'all')
            .toUpperCase()
        )
        .filter((v, i, arr) => arr.indexOf(v) === i); // dedupe
      parts.push(exts.join(', '));
    }
    parts.push(`Max ${this.maxSizeMb} MB${this.multiple ? ' each' : ''}`);
    if (this.recommendedSize) parts.push(this.recommendedSize);
    return parts.filter(Boolean).join(' · ');
  }

  // ── Drag and drop ─────────────────────────────────────────────────────────

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.canAddMore) this.isDragging = true;
  }

  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (!this.canAddMore) return;
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.processFiles(files);
    this.cvOnTouched();
  }

  // ── File input ────────────────────────────────────────────────────────────

  public triggerFileInput(): void {
    if (!this.canAddMore) return;
    this.fileInputRef.nativeElement.click();
  }

  public onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = ''; // reset so same file can be re-selected
    this.processFiles(files);
    this.cvOnTouched();
  }

  // ── Entry removal ─────────────────────────────────────────────────────────

  public removeEntry(entry: FileEntry, event: MouseEvent): void {
    event.stopPropagation();
    if (this.isDisabled) return;

    if (entry.type === 'new' && entry.url.startsWith('blob:')) {
      URL.revokeObjectURL(entry.url);
      this.blobUrls = this.blobUrls.filter((u) => u !== entry.url);
    }

    if (entry.type === 'existing') {
      this.existingUrlRemoved.emit(entry.url);
    }

    this.entries = this.entries.filter((e) => e.id !== entry.id);
    this.validationErrors = [];
    this.emit();
    this.cvOnTouched();
  }

  // ── Formatting helpers ────────────────────────────────────────────────────

  public formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private processFiles(files: File[]): void {
    if (!files.length) return;
    this.validationErrors = [];

    // In single mode, always replace — no point accepting multiple even if the
    // OS file picker somehow returns several.
    const candidates = this.multiple ? files : [files[0]];

    for (const file of candidates) {
      const err = this.validateFile(file);
      if (err) {
        this.validationErrors.push(err);
        continue;
      }

      if (!this.multiple) {
        // Replace: revoke any existing blob URLs and start fresh.
        this.revokeBlobUrls();
        this.entries = [];
      } else if (this.entries.length >= this.maxFiles) {
        this.validationErrors.push(`Maximum ${this.maxFiles} files allowed.`);
        break;
      }

      // Skip true duplicate in multi mode (same name + size + lastModified).
      const isDuplicate = this.entries.some(
        (e) =>
          e.type === 'new' &&
          e.file?.name === file.name &&
          e.file?.size === file.size &&
          e.file?.lastModified === file.lastModified
      );
      if (isDuplicate) continue;

      const blobUrl = URL.createObjectURL(file);
      this.blobUrls.push(blobUrl);
      this.entries.push(this.buildEntry(file, blobUrl));
    }

    this.emit();
  }

  private validateFile(file: File): string | null {
    // Type check
    if (this.accept && this.accept !== '*') {
      const accepted = this.accept.split(',').map((a) => a.trim().toLowerCase());
      const matches = accepted.some((rule) => {
        if (rule.startsWith('.')) {
          return file.name.toLowerCase().endsWith(rule);
        }
        if (rule.endsWith('/*')) {
          return file.type.toLowerCase().startsWith(rule.slice(0, -1));
        }
        return file.type.toLowerCase() === rule;
      });
      if (!matches) {
        const label = this.acceptLabel || this.accept;
        return `"${file.name}" is not an accepted file type (${label}).`;
      }
    }

    // Size check
    if (file.size > this.maxSizeMb * 1024 * 1024) {
      return `"${file.name}" exceeds the ${this.maxSizeMb} MB size limit.`;
    }

    return null;
  }

  private revalidateEntries(): void {
    // Remove new-file entries that no longer pass validation after config change.
    const toRemove = this.entries.filter((e) => e.type === 'new' && e.file && this.validateFile(e.file) !== null);
    toRemove.forEach((e) => {
      if (e.url.startsWith('blob:')) {
        URL.revokeObjectURL(e.url);
        this.blobUrls = this.blobUrls.filter((u) => u !== e.url);
      }
    });
    this.entries = this.entries.filter((e) => !toRemove.includes(e));
    if (toRemove.length) this.emit();
  }

  private emit(): void {
    const files = this.entries.filter((e) => e.type === 'new').map((e) => e.file!);
    const existingUrls = this.entries.filter((e) => e.type === 'existing').map((e) => e.url);
    // Emit null when empty so Validators.required works out of the box.
    const value: FileUploadValue | null = files.length === 0 && existingUrls.length === 0 ? null : { files, existingUrls };
    this.cvOnChange(value);
  }

  private buildEntry(file: File, blobUrl: string): FileEntry {
    return {
      id: `new-${file.name}-${file.lastModified}-${file.size}`,
      type: 'new',
      url: blobUrl,
      file,
      name: file.name,
      sizeBytes: file.size,
      isImage: file.type.startsWith('image/'),
    };
  }

  private revokeBlobUrls(): void {
    this.blobUrls.forEach((u) => URL.revokeObjectURL(u));
    this.blobUrls = [];
  }

  private filenameFromUrl(url: string): string {
    try {
      return new URL(url).pathname.split('/').pop() ?? url;
    } catch {
      return url.split('/').pop() ?? url;
    }
  }

  private isImageUrl(url: string): boolean {
    return /\.(jpe?g|png|gif|webp|svg|bmp|avif|ico)(\?.*)?$/i.test(url);
  }
}
