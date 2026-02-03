import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-details-link',
  imports: [MatButtonModule],
  templateUrl: './user-details-link.component.html',
})
export class UserDetailsLinkComponent implements OnInit {
  @Input() public id: number;
  @Input() public displayName: string;
  @Input() public userType: string;
  public link: string;

  public ngOnInit(): void {
    this.link = `/${this.userType.toLowerCase()}/details/${this.id}/basic-info`;
  }

  public openLink(): void {
    const width = 1400;
    const height = 900;
    const toppx = screen.height / 2 - height / 2;
    const leftpx = screen.width / 2 - width / 2;

    window.open(
      this.link,
      '_blank',
      'top=' +
        toppx +
        ', left=' +
        leftpx +
        ', width=' +
        width +
        ', height=' +
        height +
        ', menubar=no, status=no, directories=no, toolbar=yes, scrollbars=yes, resizable=yes'
    );
  }
}
