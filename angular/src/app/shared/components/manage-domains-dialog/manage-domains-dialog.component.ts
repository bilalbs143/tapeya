import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { AgentsManagementService } from '../../services/agents-management.service';
import { MessageService } from '../../services/message.service';
import { SharedModule } from '../../shared.module';
import { DialogWrapperModule } from '../dialog-wrapper/dialog-wrapper.module';

@Component({
  selector: 'app-manage-domains-dialog',
  templateUrl: './manage-domains-dialog.component.html',
  imports: [SharedModule, ReactiveFormsModule, TranslateModule, DialogWrapperModule],
})
export class ManageDomainsDialogComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  private adminIpsManagementService = inject(AgentsManagementService);
  private messageService = inject(MessageService);
  private dialogRef = inject<MatDialogRef<ManageDomainsDialogComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);

  public form: FormGroup;
  public isSubmitting: boolean = false;
  public allDomains: any;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.getAllDomains();
    this.initializeForm();
  }

  private initializeForm(): void {
    const domainFormGroups = this.allDomains.map((domain: any) =>
      this.fb.group({
        domain: [domain.data, Validators.required], // Assuming 'data' holds the domain string
      })
    );

    // If there are no existing domains, start with an empty form group
    if (domainFormGroups.length === 0) {
      domainFormGroups.push(this.createDomainGroup());
    }

    this.form = this.fb.group({
      domains: this.fb.array(domainFormGroups),
    });
  }

  public getAllDomains(): void {
    this.allDomains = this.data.record.domains.filter((domain: any) => domain.type_enum === 'DOMAIN');
  }

  public createDomainGroup(): FormGroup {
    return this.fb.group({
      domain: ['', Validators.required],
    });
  }

  public get domains(): FormArray {
    return this.form.get('domains') as FormArray;
  }

  public addDomain(): void {
    this.domains.push(this.createDomainGroup());
  }

  public removeDomain(index: number): void {
    this.domains.removeAt(index);
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const domainsArray = this.domains.value.map((domainGroup: any) => domainGroup.domain);

    this.isSubmitting = true;
    this.adminIpsManagementService
      .update({ domains: domainsArray }, this.data.record.id)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.messageService.snackBar(response.message);
          this.form.reset();
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.messageService.snackBar(error.error.message);
        },
      });
  }
}
