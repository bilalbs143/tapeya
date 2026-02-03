import { Component, Input, OnInit, inject, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';
import { finalize } from 'rxjs';

import { NGX_EDITOR_TOOLBAR } from '../../constants/constants';
import { AgentsManagementService } from '../../services/agents-management.service';
import { MessageService } from '../../services/message.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-memo-form',
  standalone: true,
  imports: [MatButtonModule, NgxEditorModule, FormsModule, MatFormFieldModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './memo-form.component.html',
})
export class MemoFormComponent implements OnInit, OnDestroy {
  private messageService = inject(MessageService);
  private agentManagementService = inject(AgentsManagementService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);

  @Input() public user: any;
  public isLoading: boolean = true;
  public form: FormGroup;
  public editor: Editor;
  public toolbar: Toolbar = NGX_EDITOR_TOOLBAR;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.editor = new Editor();
    this.initializeForm();
  }

  public ngOnDestroy(): void {
    this.editor.destroy();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      memo: [this.user.memo || ' ', []],
    });
  }

  public onSubmit(): void {
    this.isLoading = true;

    const service = this.user.type_enum === 'USER' ? this.usersService : this.agentManagementService;

    service
      .update(this.form.value, this.user.id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.messageService.snackBar(response.message);
        },
        error: (error) => {
          this.messageService.snackBar(error.error.message);
        },
      });
  }
}
