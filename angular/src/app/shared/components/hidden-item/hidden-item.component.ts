import { Component, Input, OnInit } from '@angular/core';

import { UserDetailsLinkComponent } from '../user-details-link/user-details-link.component';

@Component({
  selector: 'app-hidden-item',
  imports: [UserDetailsLinkComponent],
  templateUrl: './hidden-item.component.html',
})
export class HiddenItemComponent implements OnInit {
  @Input() public isLink: boolean = false;
  @Input() public id: number;
  @Input() public displayName: any;
  @Input() public userType: string;
  public isHidden: boolean = false;

  public ngOnInit(): void {
    this.isHidden = this.displayName.toString().includes('hidden-item');
  }
}
