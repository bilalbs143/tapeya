import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-url-display',
  imports: [MatButtonModule],
  templateUrl: './url-display.component.html',
})
export class UrlDisplayComponent implements OnInit {
  @Input() public url: string;
  @Input() public displayUrl: string;

  public ngOnInit(): void {
    try {
      const urlObj = new URL(this.url);
      this.displayUrl = urlObj.hostname;
    } catch (_) {
      this.displayUrl = '';
    }
  }
}
