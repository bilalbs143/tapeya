import { Component, EventEmitter, Input, Output, Renderer2, inject } from '@angular/core';

@Component({
  selector: 'app-hierarchy-tree',
  templateUrl: './hierarchy-tree.component.html',
  standalone: false,
})
export class HierarchyTreeComponent {
  private renderer = inject(Renderer2);

  @Input() public data: any;
  @Output() private readonly itemClicked = new EventEmitter<string>();
  public childrenVisible: boolean = true;

  public toggleChildrenVisibility(): void {
    this.childrenVisible = !this.childrenVisible;
  }

  public get hasChildren(): boolean {
    return this.data && this.data.grand_children && this.data.grand_children.length > 0;
  }

  public onChildItemClicked(id: string): void {
    this.itemClicked.emit(id);
  }

  public onClick(event: MouseEvent, id: string): void {
    event.stopPropagation();
    this.itemClicked.emit(id);
    const elements = document.querySelectorAll('.text-primary');

    elements.forEach((el) => {
      this.renderer.removeClass(el, 'text-primary');
    });

    const target = event.target as HTMLElement;
    if (target) {
      this.renderer.addClass(target, 'text-primary');
    }
  }
}
