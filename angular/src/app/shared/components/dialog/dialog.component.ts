import { Component, ComponentRef, OnDestroy, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  template: ` <ng-template #target></ng-template> `,
  standalone: false,
})
export class DialogComponent implements OnInit, OnDestroy {
  private readonly data = inject(MAT_DIALOG_DATA);

  public componentRef: ComponentRef<any>;
  @ViewChild('target', { static: true, read: ViewContainerRef })
  public viewContainerRef: ViewContainerRef;

  public ngOnDestroy(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }

  public ngOnInit(): void {
    const { component, moduleRef, data } = this.data;
    const factory = moduleRef.componentFactoryResolver.resolveComponentFactory(component);
    this.componentRef = this.viewContainerRef.createComponent(factory);
    this.componentRef.instance.data = { record: {}, action: '', ...data };
  }
}
