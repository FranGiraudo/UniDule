export function parseMd(md?: string | null): string {
  if (!md) return '';
  const html = md
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(
      /`(.*?)`/g,
      '<code style="background:color-mix(in srgb, var(--text) 10%, transparent);padding:2px 4px;border-radius:4px;font-size:0.9em;">$1</code>',
    )
    .replace(/^- (.*)$/gm, '<li>$1</li>');
  return html.replace(/\n/g, '<br>');
}
