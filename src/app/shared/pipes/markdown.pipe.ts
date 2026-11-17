import { Pipe, PipeTransform } from '@angular/core';
import { renderInlineMarkdown, renderMarkdownToHtml } from '../utils/markdown.util';

@Pipe({
  name: 'md',
})
export class OqMarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined, mode: 'block' | 'inline' = 'block'): string {
    if (!value) {
      return '';
    }
    return mode === 'inline' ? renderInlineMarkdown(value) : renderMarkdownToHtml(value);
  }
}
