import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-counter',
  standalone: true,                      // ✅ mark as standalone
  imports: [CommonModule, DecimalPipe],  // ✅ import required Angular features
  templateUrl: './counter.component.html',
})
export class CounterComponent implements OnInit {
  @Input() countTo: number = 0;
  @Input() duration: number = 2000;

  currentCount = 0;

  ngOnInit() {
    this.startCounting();
  }

  startCounting() {
    const frameRate = 30;
    const totalFrames = this.duration / frameRate;
    const increment = this.countTo / totalFrames;

    const counter = setInterval(() => {
      this.currentCount += increment;
      if (this.currentCount >= this.countTo) {
        this.currentCount = this.countTo;
        clearInterval(counter);
      }
    }, frameRate);
  }
}
