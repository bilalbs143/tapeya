import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDivider } from '@angular/material/list';
import { Editor, NgxEditorComponent, NgxEditorMenuComponent, type Toolbar } from 'ngx-editor';
import { finalize } from 'rxjs/operators';

import type { StaticPage } from 'src/app/services/static-page.service';
import { StaticPageService } from 'src/app/services/static-page.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { NGX_EDITOR_TOOLBAR } from 'src/app/shared/constants/editor.constants';
import { toKebabCase } from 'src/app/shared/functions/slug.function';

export interface ManageStaticPageDialogData {
  mode: 'create' | 'edit';
  staticPage?: StaticPage;
}

@Component({
  selector: 'app-manage-static-page-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDivider,
    MatFormFieldModule,
    MatInputModule,
    NgxEditorComponent,
    NgxEditorMenuComponent,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './manage-static-page-dialog.component.html',
})
export class ManageStaticPageDialogComponent implements OnInit, OnDestroy {
  public readonly data = inject<ManageStaticPageDialogData>(MAT_DIALOG_DATA);
  private readonly staticPageService = inject(StaticPageService);
  private readonly dialogRef = inject<MatDialogRef<ManageStaticPageDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  public form!: FormGroup;
  public editor!: Editor;
  public readonly toolbar: Toolbar = NGX_EDITOR_TOOLBAR;
  public isSubmitting = false;

  private applyingFromApi = false;
  private slugOverridden = false;

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Static Page' : 'Add Static Page';
  }

  public get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  public ngOnInit(): void {
    this.editor = new Editor();
    const page = this.data.staticPage;
    this.form = this.fb.group({
      title: [page?.title ?? '', [Validators.required, Validators.maxLength(255)]],
      slug: [page?.slug ?? '', [Validators.required, Validators.maxLength(255)]],
      content: [page?.content ?? ''],
    });

    this.applyingFromApi = true;
    if (!page) {
      this.form.patchValue({ slug: toKebabCase(this.form.get('title')?.value) }, { emitEvent: false });
    }
    this.applyingFromApi = false;
    this.slugOverridden = false;

    this.form
      .get('slug')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.applyingFromApi) {
          return;
        }
        this.slugOverridden = true;
      });

    this.form
      .get('title')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((t) => {
        if (this.applyingFromApi) {
          return;
        }
        if (!this.slugOverridden) {
          this.form.patchValue({ slug: toKebabCase(t) }, { emitEvent: false });
        }
      });
  }

  public ngOnDestroy(): void {
    this.editor.destroy();
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue() as { title: string; slug: string; content: string };
    const payload = {
      title: raw.title.trim(),
      slug: raw.slug.trim(),
      content: raw.content?.trim() ? raw.content : null,
    };

    this.isSubmitting = true;
    const request$ =
      this.data.mode === 'create'
        ? this.staticPageService.create(payload)
        : this.staticPageService.update(this.data.staticPage!.id, payload);

    request$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        // Validation/API errors are handled by the global error interceptor
      },
    });
  }
}
