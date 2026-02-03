import { Pipe, PipeTransform } from '@angular/core';

import { mergeArrays } from '../functions/core.function';

@Pipe({
  name: 'filter',
  standalone: false,
})
export class FilterPipe implements PipeTransform {
  public transform(items: Array<any>, searchText: string, extra: Array<any> = [], key: string = 'id'): Array<any> {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    const text = searchText.toLowerCase();
    let data = items.filter((el) =>
      JSON.stringify(el.name || el.title || el)
        .toLowerCase()
        .includes(text)
    );

    if (extra.length) {
      data = mergeArrays(key, data, extra);
    }

    return data;
  }
}
