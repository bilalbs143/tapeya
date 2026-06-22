import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TablerIconsModule } from 'angular-tabler-icons';
import { take } from 'rxjs/operators';

import { MessageService } from 'src/app/services/message.service';

import { AvatarCropDialogComponent } from './avatar-crop-dialog.component';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Circular avatar uploader with built-in crop/adjust step.
 *
 * Usage:
 *   <app-avatar-uploader [currentUrl]="player.avatar_url" (fileChange)="onAvatarChange($event)" />
 *
 * Emits:
 *   fileChange(File)  — new cropped JPEG ready to upload
 *   fileChange(null)  — user removed the current avatar
 */
@Component({
  selector: 'app-avatar-uploader',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTooltipModule, TablerIconsModule],
  templateUrl: './avatar-uploader.component.html',
})
export class AvatarUploaderComponent implements OnDestroy {
  /** Existing avatar URL (from the server). Shown until the user picks a new one. */
  @Input() public currentUrl: string | null | undefined = null;

  /** Alt text for the avatar image — set to the entity type (e.g. "Player photo"). */
  @Input() public altText = 'Avatar';

  /** Emits the cropped File to upload, or null to signal removal. */
  @Output() public readonly fileChange = new EventEmitter<File | null>();

  @ViewChild('fileInput') private readonly fileInputRef!: ElementRef<HTMLInputElement>;

  private readonly dialog = inject(MatDialog);
  private readonly messageService = inject(MessageService);

  /** Local preview URL — takes precedence over currentUrl once set. */
  public previewUrl: string | null = null;
  /** True after the user explicitly removes the avatar. */
  public removed = false;

  public get displayUrl(): string | null | undefined {
    if (this.removed) return null;
    return this.previewUrl ?? this.currentUrl;
  }

  public get hasAvatar(): boolean {
    return !!this.displayUrl;
  }

  public ngOnDestroy(): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
  }

  public triggerPicker(): void {
    this.fileInputRef.nativeElement.value = '';
    this.fileInputRef.nativeElement.click();
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.messageService.error('Only JPEG, PNG, and WebP images are supported.');
      return;
    }
    if (file.size > MAX_BYTES) {
      this.messageService.error('Image must be smaller than 5 MB.');
      return;
    }

    const ref = this.dialog.open(AvatarCropDialogComponent, {
      data: { imageFile: file },
      width: '480px',
      maxWidth: '95vw',
      panelClass: 'rounded-xl',
    });

    ref
      .afterClosed()
      .pipe(take(1))
      .subscribe((result: File | undefined) => {
        if (!result) return;
        if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
        this.previewUrl = URL.createObjectURL(result);
        this.removed = false;
        this.fileChange.emit(result);
      });
  }

  public remove(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
    this.removed = true;
    this.fileChange.emit(null);
  }
}
