import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string, fields: string[]): any[] {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    searchText = searchText.toLowerCase();
  console.log(items);
    return items.filter(item => {
      return fields.some(field => {
        const value = field.split('.').reduce((prev, curr) => prev ? prev[curr] : null, item);
        return value && value.toString().toLowerCase().includes(searchText);
      });
    });
  }
}
