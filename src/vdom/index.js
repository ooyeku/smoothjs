/**
 * Virtual DOM implementation for SmoothJS
 * Provides efficient diffing and patching of DOM trees
 */

/**
 * Creates a virtual DOM node
 * @param {string} type - Node type ('element', 'text', 'fragment')
 * @param {string|Object} tagOrData - HTML tag name or text data
 * @param {Object} props - Element properties and attributes
 * @param {Array} children - Child virtual nodes
 * @param {string} key - Optional key for reconciliation
 * @returns {Object} Virtual DOM node
 */
export function createVNode(type, tagOrData, props = {}, children = [], key = null) {
  return {
    type,
    tag: type === 'element' ? tagOrData : null,
    data: type === 'text' ? tagOrData : null,
    props: props || {},
    children: children || [],
    key: key || null,
    el: null, // Reference to actual DOM element
    text: type === 'text' ? String(tagOrData) : null
  };
}

/**
 * Creates a virtual element node
 * @param {string} tag - HTML tag name
 * @param {Object} props - Element properties and attributes
 * @param {Array} children - Child virtual nodes
 * @param {string} key - Optional key for reconciliation
 * @returns {Object} Virtual element node
 */
export function createElement(tag, props = {}, children = [], key = null) {
  return createVNode('element', tag, props, children, key);
}

/**
 * Creates a virtual text node
 * @param {string|number} text - Text content
 * @returns {Object} Virtual text node
 */
export function createText(text) {
  return createVNode('text', String(text));
}

/**
 * Creates a virtual fragment node
 * @param {Array} children - Child virtual nodes
 * @returns {Object} Virtual fragment node
 */
export function createFragment(children = []) {
  return createVNode('fragment', null, {}, children);
}

/**
 * Checks if two virtual nodes are the same type
 * @param {Object} a - First virtual node
 * @param {Object} b - Second virtual node
 * @returns {boolean} True if same type
 */
export function sameType(a, b) {
  if (!a || !b) return false;
  return a.type === b.type && 
         (a.type !== 'element' || a.tag === b.tag);
}

/**
 * Checks if two virtual nodes are equal
 * @param {Object} a - First virtual node
 * @param {Object} b - Second virtual node
 * @returns {boolean} True if equal
 */
export function isEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (!sameType(a, b)) return false;
  
  if (a.type === 'text') {
    return a.text === b.text;
  }
  
  if (a.type === 'element') {
    return a.tag === b.tag && 
           a.key === b.key &&
           propsEqual(a.props, b.props) &&
           childrenEqual(a.children, b.children);
  }
  
  return false;
}

/**
 * Checks if two props objects are equal
 * @param {Object} a - First props object
 * @param {Object} b - Second props object
 * @returns {boolean} True if equal
 */
function propsEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  
  if (aKeys.length !== bKeys.length) return false;
  
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  
  return true;
}

/**
 * Checks if two children arrays are equal
 * @param {Array} a - First children array
 * @param {Array} b - Second children array
 * @returns {boolean} True if equal
 */
function childrenEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (!isEqual(a[i], b[i])) return false;
  }
  
  return true;
}

/**
 * Creates a DOM element from a virtual node
 * @param {Object} vnode - Virtual node
 * @returns {Node} DOM node
 */
export function createDOMNode(vnode) {
  if (!vnode) return null;
  
  switch (vnode.type) {
    case 'text':
      return document.createTextNode(vnode.text);
      
    case 'element':
      const el = document.createElement(vnode.tag);
      setElementProps(el, vnode.props);
      vnode.children.forEach(child => {
        const childNode = createDOMNode(child);
        if (childNode) el.appendChild(childNode);
      });
      vnode.el = el;
      return el;
      
    case 'fragment':
      const fragment = document.createDocumentFragment();
      vnode.children.forEach(child => {
        const childNode = createDOMNode(child);
        if (childNode) fragment.appendChild(childNode);
      });
      return fragment;
      
    default:
      return null;
  }
}

/**
 * Sets element properties and attributes
 * @param {Element} el - DOM element
 * @param {Object} props - Properties object
 */
function setElementProps(el, props) {
  if (!props || typeof props !== 'object') return;
  
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'style' && value && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key === 'dataset' && value && typeof value === 'object') {
      Object.assign(el.dataset, value);
    } else if (key === 'className' || key === 'class') {
      el.className = value || '';
    } else if (key.startsWith('on') && typeof value === 'function') {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, value);
    } else if (key in el) {
      try {
        el[key] = value;
      } catch {
        if (value === true) {
          el.setAttribute(key, '');
        } else if (value !== false && value != null) {
          el.setAttribute(key, String(value));
        }
      }
    } else {
      if (value === true) {
        el.setAttribute(key, '');
      } else if (value !== false && value != null) {
        el.setAttribute(key, String(value));
      }
    }
  });
}

/**
 * Updates element properties
 * @param {Element} el - DOM element
 * @param {Object} oldProps - Old properties
 * @param {Object} newProps - New properties
 */
function updateElementProps(el, oldProps, newProps) {
  const allKeys = new Set([...Object.keys(oldProps || {}), ...Object.keys(newProps || {})]);
  
  allKeys.forEach(key => {
    const oldValue = oldProps?.[key];
    const newValue = newProps?.[key];
    
    if (oldValue === newValue) return;
    
    if (key === 'style' && typeof newValue === 'object') {
      // Update styles
      if (oldValue && typeof oldValue === 'object') {
        Object.keys(oldValue).forEach(styleKey => {
          if (!(styleKey in newValue)) {
            el.style[styleKey] = '';
          }
        });
      }
      Object.assign(el.style, newValue);
    } else if (key === 'dataset' && typeof newValue === 'object') {
      // Update dataset
      if (oldValue && typeof oldValue === 'object') {
        Object.keys(oldValue).forEach(dataKey => {
          if (!(dataKey in newValue)) {
            delete el.dataset[dataKey];
          }
        });
      }
      Object.assign(el.dataset, newValue);
    } else if (key === 'className' || key === 'class') {
      el.className = newValue || '';
    } else if (key.startsWith('on') && typeof newValue === 'function') {
      const event = key.slice(2).toLowerCase();
      if (oldValue) el.removeEventListener(event, oldValue);
      el.addEventListener(event, newValue);
    } else if (key in el) {
      try {
        el[key] = newValue;
      } catch {
        if (newValue === true) {
          el.setAttribute(key, '');
        } else if (newValue !== false && newValue != null) {
          el.setAttribute(key, String(newValue));
        } else {
          el.removeAttribute(key);
        }
      }
    } else {
      if (newValue === true) {
        el.setAttribute(key, '');
      } else if (newValue !== false && newValue != null) {
        el.setAttribute(key, String(newValue));
      } else {
        el.removeAttribute(key);
      }
    }
  });
}

/**
 * Patches a DOM node with a new virtual node
 * @param {Node} parent - Parent DOM node
 * @param {Object} oldVNode - Old virtual node
 * @param {Object} newVNode - New virtual node
 * @param {number} index - Index in parent
 */
export function patchNode(parent, oldVNode, newVNode, index = 0) {
  if (!oldVNode && newVNode) {
    // Insert new node
    const newNode = createDOMNode(newVNode);
    if (newNode) {
      const refNode = parent.childNodes[index] || null;
      parent.insertBefore(newNode, refNode);
    }
    return;
  }
  
  if (oldVNode && !newVNode) {
    // Remove old node
    if (oldVNode.el && oldVNode.el.parentNode) {
      oldVNode.el.parentNode.removeChild(oldVNode.el);
    }
    return;
  }
  
  if (!sameType(oldVNode, newVNode)) {
    // Replace node
    const newNode = createDOMNode(newVNode);
    if (oldVNode.el && newNode) {
      oldVNode.el.parentNode.replaceChild(newNode, oldVNode.el);
    }
    return;
  }
  
  if (oldVNode.type === 'text') {
    // Update text content
    if (oldVNode.text !== newVNode.text) {
      if (oldVNode.el) {
        oldVNode.el.textContent = newVNode.text;
      } else {
        // If old node doesn't have DOM reference, create new one
        const newNode = createDOMNode(newVNode);
        if (newNode) {
          const refNode = parent.childNodes[0] || null;
          parent.insertBefore(newNode, refNode);
        }
      }
    }
    newVNode.el = oldVNode.el;
    return;
  }
  
  if (oldVNode.type === 'element') {
    // Update element
    if (oldVNode.el) {
      updateElementProps(oldVNode.el, oldVNode.props, newVNode.props);
      patchChildren(oldVNode.el, oldVNode.children, newVNode.children);
      newVNode.el = oldVNode.el;
    } else {
      // If old node doesn't have DOM reference, create new one
      const newNode = createDOMNode(newVNode);
      if (newNode) {
        const refNode = parent.childNodes[0] || null;
        parent.insertBefore(newNode, refNode);
      }
    }
    return;
  }
}

/**
 * Patches children of a DOM element
 * @param {Element} parent - Parent DOM element
 * @param {Array} oldChildren - Old children virtual nodes
 * @param {Array} newChildren - New children virtual nodes
 */
export function patchChildren(parent, oldChildren = [], newChildren = []) {
  // Check if we should use keyed reconciliation
  const hasKeys = newChildren.some(child => child.key != null) || 
                  oldChildren.some(child => child.key != null);
  
  if (hasKeys) {
    patchChildrenKeyed(parent, oldChildren, newChildren);
  } else {
    patchChildrenUnkeyed(parent, oldChildren, newChildren);
  }
}

/**
 * Patches children using keyed reconciliation
 * @param {Element} parent - Parent DOM element
 * @param {Array} oldChildren - Old children virtual nodes
 * @param {Array} newChildren - New children virtual nodes
 */
function patchChildrenKeyed(parent, oldChildren, newChildren) {
  const oldMap = new Map();
  oldChildren.forEach((child, index) => {
    if (child.key != null) {
      oldMap.set(child.key, { child, index });
    }
  });
  
  let lastPlacedIndex = 0;
  let i = 0;
  
  for (const newChild of newChildren) {
    if (newChild.key == null) {
      // Unkeyed child, patch by position
      const oldChild = oldChildren[i];
      patchNode(parent, oldChild, newChild, i);
      i++;
      continue;
    }
    
    const oldRecord = oldMap.get(newChild.key);
    if (oldRecord) {
      // Move existing node if needed
      const currentNode = oldRecord.child.el;
      const currentIndex = Array.prototype.indexOf.call(parent.childNodes, currentNode);
      const referenceNode = parent.childNodes[i] || null;
      
      if (currentIndex !== i) {
        parent.insertBefore(currentNode, referenceNode);
      }
      
      patchNode(parent, oldRecord.child, newChild, i);
      oldMap.delete(newChild.key);
      i++;
    } else {
      // New node
      patchNode(parent, null, newChild, i);
      i++;
    }
  }
  
  // Remove remaining old nodes
  oldMap.forEach(({ child }) => {
    if (child.el && child.el.parentNode) {
      child.el.parentNode.removeChild(child.el);
    }
  });
  
  // Remove extra trailing nodes
  while (parent.childNodes.length > newChildren.length) {
    parent.removeChild(parent.lastChild);
  }
}

/**
 * Patches children without keys
 * @param {Element} parent - Parent DOM element
 * @param {Array} oldChildren - Old children virtual nodes
 * @param {Array} newChildren - New children virtual nodes
 */
function patchChildrenUnkeyed(parent, oldChildren, newChildren) {
  const minLen = Math.min(oldChildren.length, newChildren.length);
  
  // Patch existing children
  for (let i = 0; i < minLen; i++) {
    patchNode(parent, oldChildren[i], newChildren[i], i);
  }
  
  // Add new children
  for (let i = minLen; i < newChildren.length; i++) {
    patchNode(parent, null, newChildren[i], i);
  }
  
  // Remove old children
  for (let i = minLen; i < oldChildren.length; i++) {
    if (oldChildren[i].el && oldChildren[i].el.parentNode) {
      oldChildren[i].el.parentNode.removeChild(oldChildren[i].el);
    }
  }
}

/**
 * Converts HTML string to virtual nodes
 * @param {string} html - HTML string
 * @returns {Array} Array of virtual nodes
 */
export function htmlToVNodes(html) {
  if (typeof document === 'undefined') return [];
  
  const container = document.createElement('div');
  container.innerHTML = html;
  
  return Array.from(container.childNodes).map(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      return createText(node.textContent);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const props = {};
      const children = [];
      
      // Extract attributes
      Array.from(node.attributes).forEach(attr => {
        if (attr.name === 'class') {
          props.className = attr.value;
        } else if (attr.name.startsWith('data-')) {
          if (!props.dataset) props.dataset = {};
          props.dataset[attr.name.slice(5)] = attr.value;
        } else {
          props[attr.name] = attr.value;
        }
      });
      
      // Extract key
      const key = node.getAttribute('data-key');
      if (key) {
        props.key = key;
      }
      
      // Process children
      Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          children.push(createText(child.textContent));
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const childVNode = htmlToVNodes(child.outerHTML)[0];
          if (childVNode) children.push(childVNode);
        }
      });
      
      return createElement(node.tagName.toLowerCase(), props, children, key);
    }
    return null;
  }).filter(Boolean);
}

/**
 * Converts virtual nodes to HTML string
 * @param {Array|Object} vnodes - Virtual nodes
 * @returns {string} HTML string
 */
export function vNodesToHtml(vnodes) {
  if (!vnodes) return '';
  if (!Array.isArray(vnodes)) vnodes = [vnodes];
  
  return vnodes.map(vnode => {
    if (!vnode) return '';
    
    switch (vnode.type) {
      case 'text':
        return vnode.text;
        
      case 'element':
        const props = Object.entries(vnode.props || {})
          .filter(([key, value]) => value !== undefined && value !== null)
          .map(([key, value]) => {
            if (key === 'className') return `class="${value}"`;
            if (key === 'key') return `data-key="${value}"`;
            if (value === true) return key;
            return `${key}="${value}"`;
          }).join(' ');
        
        const attrs = props ? ` ${props}` : '';
        const children = vNodesToHtml(vnode.children);
        return `<${vnode.tag}${attrs}>${children}</${vnode.tag}>`;
        
      case 'fragment':
        return vNodesToHtml(vnode.children);
        
      default:
        return '';
    }
  }).join('');
}

export default {
  createVNode,
  createElement,
  createText,
  createFragment,
  sameType,
  isEqual,
  createDOMNode,
  patchNode,
  patchChildren,
  htmlToVNodes,
  vNodesToHtml
};
