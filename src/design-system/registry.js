// Centralized style registry for Velvet
export class StyleRegistry {
  static styles = new Map();
  static sheet = null;

  static register(key, css) {
    if (this.styles.has(key)) return key;
    this.styles.set(key, css);
    this.injectStyles(css);
    return key;
  }

  static getSheet() {
    if (typeof document === 'undefined') return null;
    if (!this.sheet) {
      let style = document.getElementById('velvet-registry');
      if (!style) {
        style = document.createElement('style');
        style.id = 'velvet-registry';
        document.head.appendChild(style);
      }
      this.sheet = style.sheet || null;
    }
    return this.sheet;
  }

  static injectStyles(css) {
    if (typeof document === 'undefined') return;
    const sheet = this.getSheet();
    if (sheet && sheet.insertRule) {
      try {
        sheet.insertRule(css, sheet.cssRules.length);
      } catch {
        // Fallback: append text
        const el = sheet.ownerNode;
        if (el) el.textContent += css;
      }
    } else {
      const el = document.getElementById('velvet-registry');
      if (el) el.textContent += css;
    }
  }
}
