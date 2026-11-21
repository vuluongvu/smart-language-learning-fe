import { renderMarkdownToHtml } from './markdown.util';

describe('renderMarkdownToHtml', () => {
  it('renders headings, nested lists, bold inside italic, and continuation lines', () => {
    const input = [
      '### 1. Affect (Động từ)',
      '*   **Mẹo nhớ:** **A**ffect bắt đầu bằng chữ **A** → **A**ction.',
      '*   **Ví dụ:**',
      '    *   *The weather **affects** my mood.*',
      '        (Thời tiết **ảnh hưởng** đến tâm trạng của tôi.)',
    ].join('\n');

    const html = renderMarkdownToHtml(input);

    expect(html).toContain('<h3>1. Affect (Động từ)</h3>');
    expect(html).toContain(
      '<strong>Mẹo nhớ:</strong> <strong>A</strong>ffect bắt đầu bằng chữ <strong>A</strong>',
    );
    expect(html).toContain(
      '<ul><li><em>The weather <strong>affects</strong> my mood.</em><br />(Thời tiết <strong>ảnh hưởng</strong> đến tâm trạng của tôi.)</li></ul>',
    );
  });

  it('renders tables, blockquotes, and fenced code blocks cleanly', () => {
    const input = [
      '> "She **hasn\'t** liked waking up early **for** two years."',
      '',
      '| Before | After |',
      '| :--- | :--- |',
      "| She **don't** like | She **hasn't liked** |",
      '',
      '```ts',
      'const a = 1 < 2 && "**not bold**";',
      '```',
    ].join('\n');

    const html = renderMarkdownToHtml(input);

    expect(html).toContain('<blockquote><p>');
    expect(html).toContain('<table><thead><tr>');
    expect(html).toContain(
      '<td class="oq-md-align-left">She <strong>hasn&#39;t liked</strong></td>',
    );
    expect(html).toContain(
      '<pre><code>const a = 1 &lt; 2 &amp;&amp; &quot;**not bold**&quot;;</code></pre>',
    );
  });

  it('escapes raw HTML and blocks unsafe javascript links', () => {
    const input =
      '<script>alert(1)</script> [click](javascript:alert(1)) [docs](https://example.com) `a_b` model_not_found';
    const html = renderMarkdownToHtml(input);

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain('<a href="https://example.com"');
    expect(html).toContain('<code>a_b</code>');
    expect(html).toContain('model_not_found');
  });

  it('splits inline sequential numbered points into a structured ordered list without breaking decimals or code blocks', () => {
    const input =
      "1. **Chia động từ**: Dùng **Simple Past** (2.5s delay). 2. **Cấu trúc thời gian**: Ví dụ: 'It took me 8 hours to deploy it'. 3. **Từ vựng**: Dùng `managed to finish it`.";
    const html = renderMarkdownToHtml(input);

    expect(html).toContain('<ol><li><strong>Chia động từ</strong>:');
    expect(html).toContain('(2.5s delay).</li><li><strong>Cấu trúc thời gian</strong>:');
    expect(html).toContain(
      '<li><strong>Từ vựng</strong>: Dùng <code>managed to finish it</code>.</li></ol>',
    );

    const codeInput = '```\n1. Keep me. 2. Together inside code.\n```';
    expect(renderMarkdownToHtml(codeInput)).toContain(
      '<pre><code>1. Keep me. 2. Together inside code.</code></pre>',
    );
  });
});

describe('renderMarkdownToHtml line breaks', () => {
  it('renders literal <br> inside table cells as line breaks and still escapes other tags', () => {
    const html = renderMarkdownToHtml(
      ['| A | B |', '| --- | --- |', '| x<br>y | <script>z</script> |'].join('\n'),
    );

    expect(html).toContain('<td>x<br />y</td>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });
});
