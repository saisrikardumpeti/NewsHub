export function removeHtmlBackticks(text: string): string {
  return text.replace("```html", "").replace("```", "").trim();
}
