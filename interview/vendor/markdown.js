/* Tiny Markdown subset. No network, no HTML pass-through. */
(function (root) {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function inline(value) {
    var text = escapeHtml(value);
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|#[^)\s]*)\)/g, '<a href="$2">$1</a>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
    return text;
  }

  function isTableSep(line) {
    return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
  }

  function splitRow(line) {
    var cells = line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|');
    return cells.map(function (cell) { return cell.trim(); });
  }

  function render(markdown) {
    var lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
    var html = [];
    var i = 0;
    var paragraph = [];

    function flushParagraph() {
      if (!paragraph.length) return;
      html.push('<p>' + inline(paragraph.join(' ')) + '</p>');
      paragraph = [];
    }

    while (i < lines.length) {
      var line = lines[i];

      if (line.indexOf('??? ') === 0) {
        flushParagraph();
        var title = line.slice(4).trim();
        var answer = [];
        i += 1;
        while (i < lines.length && lines[i].trim() !== '???') {
          answer.push(lines[i]);
          i += 1;
        }
        html.push('<details class="check"><summary>' + inline(title) + '</summary>' + render(answer.join('\n')) + '</details>');
        i += 1;
        continue;
      }

      if (/^```/.test(line)) {
        flushParagraph();
        var lang = line.slice(3).trim();
        var code = [];
        i += 1;
        while (i < lines.length && !/^```/.test(lines[i])) {
          code.push(lines[i]);
          i += 1;
        }
        html.push('<pre><code' + (lang ? ' class="lang-' + escapeHtml(lang) + '"' : '') + '>' + escapeHtml(code.join('\n')) + '</code></pre>');
        i += 1;
        continue;
      }

      if (!line.trim()) {
        flushParagraph();
        i += 1;
        continue;
      }

      var heading = /^(#{1,3})\s+(.*)$/.exec(line);
      if (heading) {
        flushParagraph();
        var level = heading[1].length;
        html.push('<h' + level + '>' + inline(heading[2]) + '</h' + level + '>');
        i += 1;
        continue;
      }

      if (/^\s*---\s*$/.test(line)) {
        flushParagraph();
        html.push('<hr>');
        i += 1;
        continue;
      }

      if (/^>\s?/.test(line)) {
        flushParagraph();
        var quote = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          quote.push(lines[i].replace(/^>\s?/, ''));
          i += 1;
        }
        html.push('<blockquote><p>' + inline(quote.join(' ')) + '</p></blockquote>');
        continue;
      }

      if (/^\s*[-*]\s+/.test(line)) {
        flushParagraph();
        var items = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
          items.push('<li>' + inline(lines[i].replace(/^\s*[-*]\s+/, '')) + '</li>');
          i += 1;
        }
        html.push('<ul>' + items.join('') + '</ul>');
        continue;
      }

      if (/^\s*\d+\.\s+/.test(line)) {
        flushParagraph();
        var ordered = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          ordered.push('<li>' + inline(lines[i].replace(/^\s*\d+\.\s+/, '')) + '</li>');
          i += 1;
        }
        html.push('<ol>' + ordered.join('') + '</ol>');
        continue;
      }

      if (line.indexOf('|') !== -1 && i + 1 < lines.length && isTableSep(lines[i + 1])) {
        flushParagraph();
        var headers = splitRow(line);
        i += 2;
        var rows = [];
        while (i < lines.length && lines[i].indexOf('|') !== -1 && lines[i].trim()) {
          rows.push(splitRow(lines[i]));
          i += 1;
        }
        var table = '<table><thead><tr>' + headers.map(function (cell) {
          return '<th>' + inline(cell) + '</th>';
        }).join('') + '</tr></thead><tbody>';
        rows.forEach(function (row) {
          table += '<tr>' + row.map(function (cell) {
            return '<td>' + inline(cell) + '</td>';
          }).join('') + '</tr>';
        });
        html.push(table + '</tbody></table>');
        continue;
      }

      paragraph.push(line.trim());
      i += 1;
    }

    flushParagraph();
    return html.join('\n');
  }

  root.DEMarkdown = { render: render };
})(window);
