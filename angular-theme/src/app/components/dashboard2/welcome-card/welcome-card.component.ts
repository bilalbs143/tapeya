import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { CounterComponent } from '../../dashboard1/counter-component/counter.component';

@Component({
  selector: 'app-welcome-card',
  imports: [MaterialModule, TablerIconsModule, CounterComponent],
  templateUrl: './welcome-card.component.html',
})
export class AppWelcomeCardComponent {}
