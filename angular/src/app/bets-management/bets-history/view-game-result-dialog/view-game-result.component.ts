import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-game-result',
  templateUrl: './view-game-result.component.html',
  standalone: false,
})
export class ViewGameResultComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('iframe') public iframe: any;
  public safeUrl: SafeResourceUrl;
  public isLoading = true;
  private timeoutSubscription: Subscription;

  public ngOnInit(): void {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data?.action);
  }

  public onLoad(): void {
    this.isLoading = false;
  }
}
