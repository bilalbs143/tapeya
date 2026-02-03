import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomizerButtonService {
  private isCustomizerOpenSubject = new BehaviorSubject<boolean>(false);
  public isCustomizerOpen$ = this.isCustomizerOpenSubject.asObservable();

  public toggle(): void {
    this.isCustomizerOpenSubject.next(!this.isCustomizerOpenSubject.value);
  }
}
