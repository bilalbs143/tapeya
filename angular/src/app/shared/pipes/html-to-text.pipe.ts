import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'htmlToText',
  standalone: false,
})
export class HtmlToTextPipe implements PipeTransform {
  public transform(value: string): string {
    return value ? this.convertHtmlToText(value) : '';
  }

  private convertHtmlToText(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }
}
