function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sanitizeHref(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (/^https?:\/\/\S+$/i.test(trimmed)) {
    return escapeHtml(trimmed);
  }
  return null;
}

export function renderInlineMarkdown(raw: string): string {
  const codePlaceholders: string[] = [];
  let text = escapeHtml(raw);

  // Allow literal <br> line breaks (common in AI-generated table cells); nothing else is unescaped.
  text = text.replace(/&lt;br\s*\/?&gt;/gi, '<br />');

  // Protect inline code spans from emphasis/link replacements.
  text = text.replace(/`([^`\n]+)`/g, (_match, code: string) => {
    const idx = codePlaceholders.push(`<code>${code}</code>`) - 1;
    return `\u0000CODE${idx}\u0000`;
  });

  // Safe external links: [label](https://...)
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (full, label: string, url: string) => {
    const safeUrl = sanitizeHref(url);
    if (!safeUrl) {
      return full;
    }
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  // Bold (**text** or __text__) before italic so bold inside italic works cleanly.
  text = text.replace(/\*\*([^*\n]+(?:\*(?!\*)[^*\n]*)*)\*\*/g, '<strong>$1</strong>');
  text = text.replace(
    /(^|[^\p{L}\p{N}_])__([^_\n]+(?:_(?!_)[^_\n]*)*)__(?=[^\p{L}\p{N}_]|$)/gu,
    '$1<strong>$2</strong>',
  );

  // Strikethrough (~~text~~)
  text = text.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');

  // Italic (*text* or boundary-safe _text_)
  text = text.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
  text = text.replace(/(^|[^\p{L}\p{N}_])_([^_\n]+)_(?=[^\p{L}\p{N}_]|$)/gu, '$1<em>$2</em>');

  return text.replace(/\u0000CODE(\d+)\u0000/g, (_m, idx: string) => {
    return codePlaceholders[Number(idx)] ?? '';
  });
}

function isTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  return (
    /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(trimmed) ||
    /^\|?\s*:?-{3,}:?\s*\|$/.test(trimmed)
  );
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((cell) => cell.trim());
}

function parseTableAlignments(separatorLine: string): Array<'left' | 'center' | 'right' | null> {
  return splitTableRow(separatorLine).map((cell) => {
    const startsColon = cell.startsWith(':');
    const endsColon = cell.endsWith(':');
    if (startsColon && endsColon) return 'center';
    if (endsColon) return 'right';
    if (startsColon) return 'left';
    return null;
  });
}

interface ListMarker {
  indent: number;
  type: 'ul' | 'ol';
  content: string;
}

function matchListMarker(line: string): ListMarker | null {
  const ulMatch = /^( *)([*-])\s+(.+)$/.exec(line);
  if (ulMatch) {
    return { indent: ulMatch[1].length, type: 'ul', content: ulMatch[3] };
  }
  const olMatch = /^( *)(\d+)\.\s+(.+)$/.exec(line);
  if (olMatch) {
    return { indent: olMatch[1].length, type: 'ol', content: olMatch[3] };
  }
  return null;
}

function isBlockStarter(lines: string[], idx: number): boolean {
  const line = lines[idx];
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (/^```/.test(trimmed)) return true;
  if (/^#{1,6}\s+/.test(trimmed)) return true;
  if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) return true;
  if (/^>\s?/.test(trimmed)) return true;
  if (matchListMarker(line) !== null) return true;
  if (idx + 1 < lines.length && line.includes('|') && isTableSeparator(lines[idx + 1])) {
    return true;
  }
  return false;
}

interface ListFrame {
  type: 'ul' | 'ol';
  indent: number;
  items: string[];
}

/**
 * Split sequential inline numbered points (`1. ... . 2. ... . 3. ...`) outside code blocks
 * so compact single-paragraph AI JSON responses render as structured ordered lists.
 */
function splitInlineOrderedList(line: string): string[] {
  const startMatch = /^(\s*)1\.\s+\S/.exec(line);
  if (!startMatch) {
    return [line];
  }

  const indent = startMatch[1];
  const parts: string[] = [];
  let cursor = 0;
  let nextNum = 2;

  while (nextNum <= 20) {
    const markerPattern = new RegExp(`([.!?]['"”’)]?\\s+)(${nextNum}\\.\\s+\\S)`, 'g');
    markerPattern.lastIndex = cursor + 1;
    const match = markerPattern.exec(line);
    if (!match) {
      break;
    }

    const splitAt = match.index + match[1].length;
    parts.push(line.slice(cursor, splitAt).trimEnd());
    cursor = splitAt;
    nextNum += 1;
  }

  if (parts.length === 0) {
    return [line];
  }

  parts.push(line.slice(cursor));
  return parts.map((part, idx) => (idx === 0 ? part : `${indent}${part}`));
}

function expandInlineListsOutsideCode(lines: string[]): string[] {
  const expanded: string[] = [];
  let inFence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      expanded.push(line);
      continue;
    }
    expanded.push(...(inFence ? [line] : splitInlineOrderedList(line)));
  }
  return expanded;
}

export function renderMarkdownToHtml(markdown: string): string {
  if (!markdown || !markdown.trim()) {
    return '';
  }

  const lines = expandInlineListsOutsideCode(markdown.replace(/\r\n?/g, '\n').split('\n'));
  const blocks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // Fenced code block
    if (/^```/.test(trimmed)) {
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length && /^```/.test(lines[i].trim())) {
        i += 1;
      }
      blocks.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      continue;
    }

    // Headings (# to ###### -> rendered as h2..h4 for balanced chat scale)
    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      const level = Math.min(4, Math.max(2, headingMatch[1].length));
      blocks.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      i += 1;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push('<hr />');
      i += 1;
      continue;
    }

    // Markdown table
    if (i + 1 < lines.length && line.includes('|') && isTableSeparator(lines[i + 1])) {
      const headers = splitTableRow(line);
      const alignments = parseTableAlignments(lines[i + 1]);
      i += 2;
      const bodyRows: string[][] = [];
      while (i < lines.length && lines[i].trim() && lines[i].includes('|')) {
        bodyRows.push(splitTableRow(lines[i]));
        i += 1;
      }

      const ths = headers
        .map((h, colIdx) => {
          const align = alignments[colIdx];
          const cls = align ? ` class="oq-md-align-${align}"` : '';
          return `<th${cls}>${renderInlineMarkdown(h)}</th>`;
        })
        .join('');

      const trs = bodyRows
        .map((row) => {
          const tds = headers
            .map((_h, colIdx) => {
              const align = alignments[colIdx];
              const cls = align ? ` class="oq-md-align-${align}"` : '';
              return `<td${cls}>${renderInlineMarkdown(row[colIdx] ?? '')}</td>`;
            })
            .join('');
          return `<tr>${tds}</tr>`;
        })
        .join('');

      blocks.push(
        `<div class="oq-md-table-wrap"><table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`,
      );
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      blocks.push(`<blockquote>${renderMarkdownToHtml(quoteLines.join('\n'))}</blockquote>`);
      continue;
    }

    // Ordered / unordered lists (supports nested indentation & wrapped continuation lines)
    if (matchListMarker(line) !== null) {
      const stack: ListFrame[] = [];

      const closeTopList = (): string => {
        const top = stack.pop()!;
        const html = `<${top.type}>${top.items.map((item) => `<li>${item}</li>`).join('')}</${top.type}>`;
        if (stack.length > 0) {
          const parent = stack[stack.length - 1];
          parent.items[parent.items.length - 1] += html;
          return '';
        }
        return html;
      };

      while (i < lines.length) {
        const currentLine = lines[i];
        if (!currentLine.trim()) {
          // Allow single blank line only if next non-empty line continues the list at valid indent.
          const nextIdx = i + 1;
          if (nextIdx < lines.length && matchListMarker(lines[nextIdx]) !== null) {
            i += 1;
            continue;
          }
          break;
        }

        const marker = matchListMarker(currentLine);
        if (marker) {
          while (stack.length > 0 && marker.indent < stack[stack.length - 1].indent) {
            closeTopList();
          }

          if (
            stack.length === 0 ||
            marker.indent > stack[stack.length - 1].indent ||
            (marker.indent === stack[stack.length - 1].indent &&
              marker.type !== stack[stack.length - 1].type)
          ) {
            if (
              stack.length > 0 &&
              marker.indent === stack[stack.length - 1].indent &&
              marker.type !== stack[stack.length - 1].type
            ) {
              const closed = closeTopList();
              if (closed) blocks.push(closed);
            }
            stack.push({ type: marker.type, indent: marker.indent, items: [] });
          }

          stack[stack.length - 1].items.push(renderInlineMarkdown(marker.content));
          i += 1;
          continue;
        }

        // Indented continuation line inside current list item
        if (stack.length > 0 && /^ {2,}\S/.test(currentLine) && !isBlockStarter(lines, i)) {
          const top = stack[stack.length - 1];
          top.items[top.items.length - 1] += `<br />${renderInlineMarkdown(currentLine.trim())}`;
          i += 1;
          continue;
        }

        break;
      }

      while (stack.length > 1) {
        closeTopList();
      }
      if (stack.length === 1) {
        blocks.push(closeTopList());
      }
      continue;
    }

    // Paragraph (consecutive non-block-starter lines joined with <br />)
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() && !isBlockStarter(lines, i)) {
      paraLines.push(renderInlineMarkdown(lines[i].trim()));
      i += 1;
    }
    if (paraLines.length > 0) {
      blocks.push(`<p>${paraLines.join('<br />')}</p>`);
    }
  }

  return blocks.join('');
}
