const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('C:/Users/cy155/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'deliverables', 'documents');
const esc = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = value => esc(value).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
function renderMarkdown(source) {
  const lines = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').split('\n');
  const result = []; let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (/^#{1,6} /.test(line)) { const match = line.match(/^(#{1,6}) (.*)$/); result.push(`<h${match[1].length}>${inline(match[2])}</h${match[1].length}>`); i++; continue; }
    if (/^```/.test(line)) { const code = []; i++; while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]); i++; result.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`); continue; }
    if (/^\|/.test(line)) {
      const rows = []; while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
      const cells = row => row.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      result.push('<table><thead><tr>' + cells(rows[0]).map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>' + rows.slice(2).map(row => '<tr>' + cells(row).map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table>'); continue;
    }
    if (/^(?:- |\d+\. )/.test(line)) {
      const ordered = /^\d/.test(line), tag = ordered ? 'ol' : 'ul', items = [];
      while (i < lines.length && (ordered ? /^\d+\. / : /^- /).test(lines[i])) items.push(`<li>${inline(lines[i++].replace(/^(?:- |\d+\. )/, ''))}</li>`);
      result.push(`<${tag}>${items.join('')}</${tag}>`); continue;
    }
    const paragraph = [line]; i++;
    while (i < lines.length && lines[i].trim() && !/^(?:#|- |\d+\. |\||```)/.test(lines[i])) paragraph.push(lines[i++]);
    result.push(`<p>${inline(paragraph.join(' '))}</p>`);
  }
  return result.join('\n');
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  for (const name of ['PRD', 'TECH_DESIGN', 'AGENTS']) {
    const source = fs.readFileSync(path.join(root, `${name}.md`), 'utf8');
    const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>${name}.md · 课程项目文档</title><style>*{box-sizing:border-box}body{margin:0;background:#edf1f6;color:#17243b;font:20px/1.85 "Microsoft YaHei","Segoe UI",sans-serif}main{max-width:1280px;margin:36px auto;background:white;padding:48px 64px;border:1px solid #dce2ec;border-radius:16px}header{color:#52647f;border-bottom:1px solid #dce2ec;padding-bottom:18px;font-size:17px}h1{font-size:34px;line-height:1.55;margin:30px 0}h2{font-size:27px;border-bottom:1px solid #e4e8ee;padding-bottom:8px;margin:32px 0 14px}h3{font-size:23px;margin:25px 0 12px}p{margin:14px 0}ul,ol{padding-left:30px;margin:14px 0}li{margin:7px 0}code{background:#eef2f7;padding:2px 6px;border-radius:4px;font:18px/1.7 Consolas,"Microsoft YaHei",monospace;overflow-wrap:anywhere}pre{padding:18px;background:#eef2f7;white-space:pre-wrap}pre code{padding:0}table{border-collapse:collapse;width:100%;margin:22px 0;font-size:19px;table-layout:auto}th,td{border:1px solid #dce2ec;padding:11px 16px;text-align:left;overflow-wrap:anywhere}th{background:#eef3fa}footer{margin-top:34px;padding-top:18px;border-top:1px solid #e4e8ee;color:#60708a;font-size:16px}</style></head><body><main><header>CY · 星间档案 / 项目文档 / ${name}.md</header>${renderMarkdown(source)}<footer>源文件：${name}.md · 本页由源文档内容直接生成，用于课程提交截图。</footer></main></body></html>`;
    const htmlPath = path.join(out, `${name}.html`);
    fs.writeFileSync(htmlPath, html);
    await page.goto(pathToFileURL(htmlPath).href);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
    console.log(`${name}: ${await page.locator('body').evaluate(el => el.scrollHeight)}px, screenshot saved`);
  }
  await browser.close();
})().catch(error => { console.error(error.message); process.exitCode = 1; });
