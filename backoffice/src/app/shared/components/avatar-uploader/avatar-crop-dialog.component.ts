import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ImageCropperComponent, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';

import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';

export interface AvatarCropDialogData {
  imageFile: File;
}

export type AvatarCropDialogResult = File | undefined;

const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 4;

@Component({
  selector: 'app-avatar-crop-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatTooltipModule,
    TablerIconsModule,
    ImageCropperComponent,
    DialogWrapperComponent,
    MatDivider,
  ],
  template: `
    <app-dialog-wrapper title="Adjust Photo">
      <mat-dialog-content class="!px-5 !pb-2">
        <div class="overflow-hidden rounded-xl bg-black/5 dark:bg-white/5">
          <image-cropper
            [imageFile]="data.imageFile"
            [maintainAspectRatio]="true"
            [aspectRatio]="3 / 4"
            [resizeToWidth]="384"
            [resizeToHeight]="512"
            [transform]="transform"
            outputType="blob"
            format="jpeg"
            backgroundColor="#ffffff"
            (imageCropped)="onCropped($event)"
            class="max-h-[300px]"
          />
        </div>

        <!-- Zoom controls -->
        <div class="mt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            class="cursor-pointer border-0 bg-transparent p-0 align-middle disabled:opacity-40 disabled:cursor-not-allowed"
            [disabled]="scale <= zoomMin"
            [matTooltip]="'Zoom Out'"
            (click)="zoomOut()"
          >
            <i-tabler name="zoom-out" class="size-4.5!"></i-tabler>
          </button>

          <div class="relative h-1.5 w-40 rounded-full bg-gray-200 dark:bg-gray-700">
            <div class="h-full rounded-full bg-primary" [style.width.%]="zoomPercent"></div>
            <input
              type="range"
              class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              [min]="zoomMin"
              [max]="zoomMax"
              [step]="zoomStep"
              [value]="scale"
              (input)="onSlider($event)"
            />
          </div>

          <button
            type="button"
            class="cursor-pointer border-0 bg-transparent p-0 align-middle disabled:opacity-40 disabled:cursor-not-allowed"
            [disabled]="scale >= zoomMax"
            [matTooltip]="'Zoom In'"
            (click)="zoomIn()"
          >
            <i-tabler name="zoom-in" class="size-4.5!"></i-tabler>
          </button>

          <span class="w-10 text-center text-xs text-gray-400">{{ scaleLabel }}</span>
        </div>
      </mat-dialog-content>

      <mat-divider></mat-divider>
      <mat-dialog-actions class="!px-5 !pb-4 !pt-3 gap-2">
        <button mat-stroked-button mat-dialog-close>Cancel</button>
        <button mat-flat-button color="primary" [disabled]="!croppedBlob" (click)="apply()">Apply</button>
      </mat-dialog-actions>
    </app-dialog-wrapper>
  `,
})
export class AvatarCropDialogComponent {
  public readonly data = inject<AvatarCropDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<AvatarCropDialogComponent, AvatarCropDialogResult>>(MatDialogRef);

  public croppedBlob: Blob | null = null;
  public scale = 1;
  public transform: ImageTransform = { scale: 1 };

  public readonly zoomMin = ZOOM_MIN;
  public readonly zoomMax = ZOOM_MAX;
  public readonly zoomStep = ZOOM_STEP;

  public get zoomPercent(): number {
    return ((this.scale - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN)) * 100;
  }

  public get scaleLabel(): string {
    return `${Math.round(this.scale * 100)}%`;
  }

  public zoomIn(): void {
    this.setScale(Math.min(this.scale + ZOOM_STEP, ZOOM_MAX));
  }

  public zoomOut(): void {
    this.setScale(Math.max(this.scale - ZOOM_STEP, ZOOM_MIN));
  }

  public onSlider(event: Event): void {
    this.setScale(Number((event.target as HTMLInputElement).value));
  }

  public onCropped(event: ImageCroppedEvent): void {
    this.croppedBlob = event.blob ?? null;
  }

  public apply(): void {
    if (!this.croppedBlob) return;
    const file = new File([this.croppedBlob], 'avatar-384x512.jpg', { type: 'image/jpeg' });
    this.dialogRef.close(file);
  }

  private setScale(value: number): void {
    this.scale = Math.round(value * 100) / 100;
    this.transform = { ...this.transform, scale: this.scale };
  }
}
