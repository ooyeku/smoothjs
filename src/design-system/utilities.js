import { defaultTheme } from './theme.js';

/**
 * A utility class for generating a set of pre-defined style configurations based on a provided theme.
 * This class contains utilities for CSS properties such as display, flexbox, alignment, spacing, width, height,
 * and typography. The utilities can be directly applied as style objects.
 */
export class VelvetUtilities {
  constructor(theme = defaultTheme) {
    this.theme = theme;
    this.utilities = this.generateUtilities();
  }
  
  generateUtilities() {
    const utils = {};
    
    // Display utilities
    utils['hidden'] = { display: 'none' };
    utils['block'] = { display: 'block' };
    utils['inline-block'] = { display: 'inline-block' };
    utils['inline'] = { display: 'inline' };
    utils['flex'] = { display: 'flex' };
    utils['inline-flex'] = { display: 'inline-flex' };
    utils['grid'] = { display: 'grid' };
    utils['inline-grid'] = { display: 'inline-grid' };
    
    // Flexbox utilities
    utils['flex-row'] = { flexDirection: 'row' };
    utils['flex-row-reverse'] = { flexDirection: 'row-reverse' };
    utils['flex-col'] = { flexDirection: 'column' };
    utils['flex-col-reverse'] = { flexDirection: 'column-reverse' };
    utils['flex-wrap'] = { flexWrap: 'wrap' };
    utils['flex-nowrap'] = { flexWrap: 'nowrap' };
    utils['flex-1'] = { flex: '1 1 0%' };
    utils['flex-auto'] = { flex: '1 1 auto' };
    utils['flex-initial'] = { flex: '0 1 auto' };
    utils['flex-none'] = { flex: 'none' };
    utils['flex-grow'] = { flexGrow: '1' };
    utils['flex-shrink'] = { flexShrink: '1' };
    utils['flex-grow-0'] = { flexGrow: '0' };
    utils['flex-shrink-0'] = { flexShrink: '0' };
    
    // Alignment utilities
    utils['items-start'] = { alignItems: 'flex-start' };
    utils['items-end'] = { alignItems: 'flex-end' };
    utils['items-center'] = { alignItems: 'center' };
    utils['items-baseline'] = { alignItems: 'baseline' };
    utils['items-stretch'] = { alignItems: 'stretch' };
    
    utils['justify-start'] = { justifyContent: 'flex-start' };
    utils['justify-end'] = { justifyContent: 'flex-end' };
    utils['justify-center'] = { justifyContent: 'center' };
    utils['justify-between'] = { justifyContent: 'space-between' };
    utils['justify-around'] = { justifyContent: 'space-around' };
    utils['justify-evenly'] = { justifyContent: 'space-evenly' };
    
    utils['self-auto'] = { alignSelf: 'auto' };
    utils['self-start'] = { alignSelf: 'flex-start' };
    utils['self-end'] = { alignSelf: 'flex-end' };
    utils['self-center'] = { alignSelf: 'center' };
    utils['self-stretch'] = { alignSelf: 'stretch' };
    
    // Gap utilities
    Object.entries(this.theme.spacing).forEach(([key, value]) => {
      utils[`gap-${key}`] = { gap: value };
      utils[`gap-x-${key}`] = { columnGap: value };
      utils[`gap-y-${key}`] = { rowGap: value };
    });
    
    // Spacing utilities (padding and margin)
    Object.entries(this.theme.spacing).forEach(([key, value]) => {
      // Padding
      utils[`p-${key}`] = { padding: value };
      utils[`px-${key}`] = { paddingLeft: value, paddingRight: value };
      utils[`py-${key}`] = { paddingTop: value, paddingBottom: value };
      utils[`pt-${key}`] = { paddingTop: value };
      utils[`pr-${key}`] = { paddingRight: value };
      utils[`pb-${key}`] = { paddingBottom: value };
      utils[`pl-${key}`] = { paddingLeft: value };
      
      // Margin
      utils[`m-${key}`] = { margin: value };
      utils[`mx-${key}`] = { marginLeft: value, marginRight: value };
      utils[`my-${key}`] = { marginTop: value, marginBottom: value };
      utils[`mt-${key}`] = { marginTop: value };
      utils[`mr-${key}`] = { marginRight: value };
      utils[`mb-${key}`] = { marginBottom: value };
      utils[`ml-${key}`] = { marginLeft: value };
      
      // Negative margins
      utils[`-m-${key}`] = { margin: `-${value}` };
      utils[`-mx-${key}`] = { marginLeft: `-${value}`, marginRight: `-${value}` };
      utils[`-my-${key}`] = { marginTop: `-${value}`, marginBottom: `-${value}` };
      utils[`-mt-${key}`] = { marginTop: `-${value}` };
      utils[`-mr-${key}`] = { marginRight: `-${value}` };
      utils[`-mb-${key}`] = { marginBottom: `-${value}` };
      utils[`-ml-${key}`] = { marginLeft: `-${value}` };
    });
    
    // Auto margins
    utils['mx-auto'] = { marginLeft: 'auto', marginRight: 'auto' };
    utils['my-auto'] = { marginTop: 'auto', marginBottom: 'auto' };
    utils['m-auto'] = { margin: 'auto' };
    utils['ml-auto'] = { marginLeft: 'auto' };
    utils['mr-auto'] = { marginRight: 'auto' };
    utils['mt-auto'] = { marginTop: 'auto' };
    utils['mb-auto'] = { marginBottom: 'auto' };
    
    // Width utilities
    utils['w-full'] = { width: '100%' };
    utils['w-screen'] = { width: '100vw' };
    utils['w-min'] = { width: 'min-content' };
    utils['w-max'] = { width: 'max-content' };
    utils['w-fit'] = { width: 'fit-content' };
    utils['w-auto'] = { width: 'auto' };
    Object.entries(this.theme.spacing).forEach(([key, value]) => {
      utils[`w-${key}`] = { width: value };
    });
    
    // Height utilities
    utils['h-full'] = { height: '100%' };
    utils['h-screen'] = { height: '100vh' };
    utils['h-min'] = { height: 'min-content' };
    utils['h-max'] = { height: 'max-content' };
    utils['h-fit'] = { height: 'fit-content' };
    utils['h-auto'] = { height: 'auto' };
    Object.entries(this.theme.spacing).forEach(([key, value]) => {
      utils[`h-${key}`] = { height: value };
    });
    
    // Min/Max width and height
    utils['min-w-0'] = { minWidth: '0' };
    utils['min-w-full'] = { minWidth: '100%' };
    utils['min-w-min'] = { minWidth: 'min-content' };
    utils['min-w-max'] = { minWidth: 'max-content' };
    utils['min-w-fit'] = { minWidth: 'fit-content' };
    
    utils['max-w-none'] = { maxWidth: 'none' };
    utils['max-w-full'] = { maxWidth: '100%' };
    utils['max-w-min'] = { maxWidth: 'min-content' };
    utils['max-w-max'] = { maxWidth: 'max-content' };
    utils['max-w-fit'] = { maxWidth: 'fit-content' };
    utils['max-w-prose'] = { maxWidth: '65ch' };
    utils['max-w-screen-sm'] = { maxWidth: this.theme.breakpoints.sm };
    utils['max-w-screen-md'] = { maxWidth: this.theme.breakpoints.md };
    utils['max-w-screen-lg'] = { maxWidth: this.theme.breakpoints.lg };
    utils['max-w-screen-xl'] = { maxWidth: this.theme.breakpoints.xl };
    utils['max-w-screen-2xl'] = { maxWidth: this.theme.breakpoints['2xl'] };
    
    // Typography utilities
    Object.entries(this.theme.typography.sizes).forEach(([key, value]) => {
      utils[`text-${key}`] = { fontSize: value };
    });
    
    Object.entries(this.theme.typography.weights).forEach(([key, value]) => {
      utils[`font-${key}`] = { fontWeight: value };
    });
    
    Object.entries(this.theme.typography.lineHeights).forEach(([key, value]) => {
      utils[`leading-${key}`] = { lineHeight: value };
    });
    
    Object.entries(this.theme.typography.letterSpacing).forEach(([key, value]) => {
      utils[`tracking-${key}`] = { letterSpacing: value };
    });
    
    // Text alignment
    utils['text-left'] = { textAlign: 'left' };
    utils['text-center'] = { textAlign: 'center' };
    utils['text-right'] = { textAlign: 'right' };
    utils['text-justify'] = { textAlign: 'justify' };
    
    // Text decoration
    utils['underline'] = { textDecoration: 'underline' };
    utils['line-through'] = { textDecoration: 'line-through' };
    utils['no-underline'] = { textDecoration: 'none' };
    
    // Text transform
    utils['uppercase'] = { textTransform: 'uppercase' };
    utils['lowercase'] = { textTransform: 'lowercase' };
    utils['capitalize'] = { textTransform: 'capitalize' };
    utils['normal-case'] = { textTransform: 'none' };
    
    // Font style
    utils['italic'] = { fontStyle: 'italic' };
    utils['not-italic'] = { fontStyle: 'normal' };
    
    // Color utilities
    Object.entries(this.theme.colors).forEach(([name, shades]) => {
      if (typeof shades === 'object' && !shades.length) {
        Object.entries(shades).forEach(([shade, color]) => {
          if (typeof color === 'string') {
            utils[`text-${name}-${shade}`] = { color };
            utils[`bg-${name}-${shade}`] = { backgroundColor: color };
            utils[`border-${name}-${shade}`] = { borderColor: color };
          }
        });
      } else if (typeof shades === 'string') {
        utils[`text-${name}`] = { color: shades };
        utils[`bg-${name}`] = { backgroundColor: shades };
        utils[`border-${name}`] = { borderColor: shades };
      }
    });
    
    // Opacity utilities
    Object.entries(this.theme.effects.opacity).forEach(([key, value]) => {
      utils[`opacity-${key}`] = { opacity: value };
    });
    
    // Border utilities
    utils['border'] = { borderWidth: '1px', borderStyle: 'solid' };
    utils['border-0'] = { borderWidth: '0' };
    utils['border-2'] = { borderWidth: '2px' };
    utils['border-4'] = { borderWidth: '4px' };
    utils['border-8'] = { borderWidth: '8px' };
    utils['border-t'] = { borderTopWidth: '1px', borderTopStyle: 'solid' };
    utils['border-r'] = { borderRightWidth: '1px', borderRightStyle: 'solid' };
    utils['border-b'] = { borderBottomWidth: '1px', borderBottomStyle: 'solid' };
    utils['border-l'] = { borderLeftWidth: '1px', borderLeftStyle: 'solid' };
    utils['border-none'] = { border: 'none' };
    
    // Border radius utilities
    Object.entries(this.theme.borderRadius).forEach(([key, value]) => {
      utils[`rounded-${key}`] = { borderRadius: value };
    });
    utils['rounded'] = { borderRadius: this.theme.borderRadius.md };
    
    // Shadow utilities
    Object.entries(this.theme.effects.shadows).forEach(([key, value]) => {
      utils[`shadow-${key}`] = { boxShadow: value };
    });
    utils['shadow'] = { boxShadow: this.theme.effects.shadows.base };
    
    // Position utilities
    utils['static'] = { position: 'static' };
    utils['fixed'] = { position: 'fixed' };
    utils['absolute'] = { position: 'absolute' };
    utils['relative'] = { position: 'relative' };
    utils['sticky'] = { position: 'sticky' };
    
    // Position values
    utils['top-0'] = { top: '0' };
    utils['right-0'] = { right: '0' };
    utils['bottom-0'] = { bottom: '0' };
    utils['left-0'] = { left: '0' };
    utils['inset-0'] = { top: '0', right: '0', bottom: '0', left: '0' };
    utils['inset-x-0'] = { left: '0', right: '0' };
    utils['inset-y-0'] = { top: '0', bottom: '0' };
    
    // Z-index utilities
    Object.entries(this.theme.zIndex).forEach(([key, value]) => {
      utils[`z-${key}`] = { zIndex: value };
    });
    
    // Overflow utilities
    utils['overflow-auto'] = { overflow: 'auto' };
    utils['overflow-hidden'] = { overflow: 'hidden' };
    utils['overflow-visible'] = { overflow: 'visible' };
    utils['overflow-scroll'] = { overflow: 'scroll' };
    utils['overflow-x-auto'] = { overflowX: 'auto' };
    utils['overflow-y-auto'] = { overflowY: 'auto' };
    utils['overflow-x-hidden'] = { overflowX: 'hidden' };
    utils['overflow-y-hidden'] = { overflowY: 'hidden' };
    utils['overflow-x-visible'] = { overflowX: 'visible' };
    utils['overflow-y-visible'] = { overflowY: 'visible' };
    utils['overflow-x-scroll'] = { overflowX: 'scroll' };
    utils['overflow-y-scroll'] = { overflowY: 'scroll' };
    
    // Cursor utilities
    utils['cursor-auto'] = { cursor: 'auto' };
    utils['cursor-default'] = { cursor: 'default' };
    utils['cursor-pointer'] = { cursor: 'pointer' };
    utils['cursor-wait'] = { cursor: 'wait' };
    utils['cursor-text'] = { cursor: 'text' };
    utils['cursor-move'] = { cursor: 'move' };
    utils['cursor-not-allowed'] = { cursor: 'not-allowed' };
    
    // User select utilities
    utils['select-none'] = { userSelect: 'none' };
    utils['select-text'] = { userSelect: 'text' };
    utils['select-all'] = { userSelect: 'all' };
    utils['select-auto'] = { userSelect: 'auto' };
    
    // Transition utilities
    utils['transition'] = { transition: this.theme.effects.transitions.all };
    utils['transition-none'] = { transition: 'none' };
    utils['transition-colors'] = { transition: this.theme.effects.transitions.colors };
    utils['transition-opacity'] = { transition: this.theme.effects.transitions.fade };
    utils['transition-transform'] = { transition: this.theme.effects.transitions.slide };
    
    // Transform utilities
    utils['scale-0'] = { transform: 'scale(0)' };
    utils['scale-50'] = { transform: 'scale(0.5)' };
    utils['scale-75'] = { transform: 'scale(0.75)' };
    utils['scale-90'] = { transform: 'scale(0.9)' };
    utils['scale-95'] = { transform: 'scale(0.95)' };
    utils['scale-100'] = { transform: 'scale(1)' };
    utils['scale-105'] = { transform: 'scale(1.05)' };
    utils['scale-110'] = { transform: 'scale(1.1)' };
    utils['scale-125'] = { transform: 'scale(1.25)' };
    utils['scale-150'] = { transform: 'scale(1.5)' };
    
    utils['rotate-0'] = { transform: 'rotate(0deg)' };
    utils['rotate-45'] = { transform: 'rotate(45deg)' };
    utils['rotate-90'] = { transform: 'rotate(90deg)' };
    utils['rotate-180'] = { transform: 'rotate(180deg)' };
    utils['-rotate-45'] = { transform: 'rotate(-45deg)' };
    utils['-rotate-90'] = { transform: 'rotate(-90deg)' };
    utils['-rotate-180'] = { transform: 'rotate(-180deg)' };
    
    // Special utilities
    utils['sr-only'] = {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      borderWidth: '0'
    };
    
    utils['not-sr-only'] = {
      position: 'static',
      width: 'auto',
      height: 'auto',
      padding: '0',
      margin: '0',
      overflow: 'visible',
      clip: 'auto',
      whiteSpace: 'normal'
    };
    
    return utils;
  }
  
  parse(classString) {
    if (!classString) return {};
    
    const classes = classString.split(' ').filter(Boolean);
    const styles = {};
    
    classes.forEach(cls => {
      if (this.utilities[cls]) {
        Object.assign(styles, this.utilities[cls]);
      }
    });
    
    return styles;
  }
  
  has(className) {
    return !!this.utilities[className];
  }
  
  get(className) {
    return this.utilities[className] || {};
  }
}