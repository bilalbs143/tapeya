import { Pipe, PipeTransform } from '@angular/core';

interface ItemWithDisplayName {
  displayName: string;
}

@Pipe({ name: 'appFilter' })
export class FilterPipe implements PipeTransform {
  public transform(items: ItemWithDisplayName[] | null | undefined, searchText: string): ItemWithDisplayName[] {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    searchText = searchText.toLocaleLowerCase();

    return items.filter((it) => it.displayName.toLocaleLowerCase().includes(searchText));
  }
}
