import { Component, OnInit } from '@angular/core';

import { getUserTypeByURL } from '../../shared/functions/core.function';

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
  styles: ``,
  standalone: false,
})
export class BasicInfoComponent implements OnInit {
  public userType: any;

  public ngOnInit(): void {
    this.userType = getUserTypeByURL();
  }
}
