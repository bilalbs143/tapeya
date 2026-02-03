import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'strReplace',
  standalone: false,
})
export class StrReplacePipe implements PipeTransform {
  public transform(value: string, from: string, to: string): string {
    return value.replace(new RegExp(from, 'g'), to);
  }
}
