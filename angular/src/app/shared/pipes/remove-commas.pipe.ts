import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeCommas',
  standalone: false,
})
export class RemoveCommasPipe implements PipeTransform {
  public transform(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const stringValue = value.toString();
    return Number(stringValue.replace(/,/g, ''));
  }
}
