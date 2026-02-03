import { Component, OnInit } from '@angular/core';

import { getUserTypeByURL } from '../../shared/functions/core.function';

@Component({
  selector: 'app-basic-info-detailed',
  templateUrl: './basic-info-detailed.component.html',
  styles: ``,
  standalone: false,
})
export class BasicInfoDetailedComponent implements OnInit {
  public userType: any;

  public ngOnInit(): void {
    this.userType = getUserTypeByURL();
  }
}
