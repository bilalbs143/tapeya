import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { TablerIconsModule } from '@luoxiao123/angular-tabler-icons';
import * as TablerIcons from '@luoxiao123/angular-tabler-icons/icons';
import { TranslateModule } from '@ngx-translate/core';
import { NgxTouchKeyboardModule } from 'ngx-touch-keyboard';

import { SubmitButtonComponent } from '../../shared/components/submit-button/submit-button.component';

import { AuthenticationRoutes } from './authentication.routing';
import { AppErrorComponent } from './error/error.component';
import { AppLoginComponent } from './login/login.component';

@NgModule({
  declarations: [AppLoginComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(AuthenticationRoutes),
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule.pick(TablerIcons),
    AppErrorComponent,
    NgxTouchKeyboardModule,
    SubmitButtonComponent,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
})
export class AuthenticationModule {}
