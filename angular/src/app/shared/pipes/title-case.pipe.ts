import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titleCase',
  standalone: false,
})
export class TitleCasePipe implements PipeTransform {
  public transform(value: any): any {
    return !value ? '' : value.replace(/\w\S*/g, (txt: any) => txt[0].toUpperCase() + txt.substr(1).toLowerCase()).replace(/_/g, ' ');
  }
}
