import { Directive, Input, OnChanges, TemplateRef, ViewContainerRef, inject } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { verifyPermission } from '../functions/permissions.function';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[cannot]',
  standalone: false,
})
export class CannotDirective implements OnChanges {
  private authService = inject(AuthService);
  private templateRef = inject<TemplateRef<any>>(TemplateRef);
  private viewContainer = inject(ViewContainerRef);

  @Input() public cannot: string;

  @Input('cannotIf') public extraConditions: boolean;

  public ngOnChanges(): void {
    if (this.extraConditions === undefined || this.extraConditions) {
      if (!verifyPermission(this.cannot, this.authService.getPermissions())) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    } else {
      this.viewContainer.clear();
    }
  }
}
