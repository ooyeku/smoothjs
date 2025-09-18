import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
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
} from '../src/vdom/index.js';
import { SmoothComponentVDOM } from '../src/vdom/SmoothComponentVDOM.js';
import { defineComponentVDOM } from '../src/vdom/defineComponentVDOM.js';

describe('Virtual DOM Core Functions', () => {
  describe('createVNode', () => {
    it('creates a text node', () => {
      const vnode = createVNode('text', 'Hello World');
      expect(vnode.type).toBe('text');
      expect(vnode.text).toBe('Hello World');
      expect(vnode.data).toBe('Hello World');
    });

    it('creates an element node', () => {
      const vnode = createVNode('element', 'div', { id: 'test' }, [], 'key1');
      expect(vnode.type).toBe('element');
      expect(vnode.tag).toBe('div');
      expect(vnode.props).toEqual({ id: 'test' });
      expect(vnode.children).toEqual([]);
      expect(vnode.key).toBe('key1');
    });

    it('creates a fragment node', () => {
      const children = [createText('Hello'), createText('World')];
      const vnode = createVNode('fragment', null, {}, children);
      expect(vnode.type).toBe('fragment');
      expect(vnode.children).toEqual(children);
    });
  });

  describe('createElement', () => {
    it('creates an element with props and children', () => {
      const vnode = createElement('div', { className: 'test' }, [createText('Hello')], 'key1');
      expect(vnode.type).toBe('element');
      expect(vnode.tag).toBe('div');
      expect(vnode.props.className).toBe('test');
      expect(vnode.children).toHaveLength(1);
      expect(vnode.key).toBe('key1');
    });
  });

  describe('createText', () => {
    it('creates a text node', () => {
      const vnode = createText('Hello');
      expect(vnode.type).toBe('text');
      expect(vnode.text).toBe('Hello');
    });
  });

  describe('createFragment', () => {
    it('creates a fragment with children', () => {
      const children = [createText('Hello'), createText('World')];
      const vnode = createFragment(children);
      expect(vnode.type).toBe('fragment');
      expect(vnode.children).toEqual(children);
    });
  });

  describe('sameType', () => {
    it('returns true for same type nodes', () => {
      const a = createText('Hello');
      const b = createText('World');
      expect(sameType(a, b)).toBe(true);
    });

    it('returns false for different type nodes', () => {
      const a = createText('Hello');
      const b = createElement('div');
      expect(sameType(a, b)).toBe(false);
    });

    it('returns false for null/undefined', () => {
      expect(sameType(null, createText('Hello'))).toBe(false);
      expect(sameType(createText('Hello'), null)).toBe(false);
    });
  });

  describe('isEqual', () => {
    it('returns true for identical text nodes', () => {
      const a = createText('Hello');
      const b = createText('Hello');
      expect(isEqual(a, b)).toBe(true);
    });

    it('returns false for different text nodes', () => {
      const a = createText('Hello');
      const b = createText('World');
      expect(isEqual(a, b)).toBe(false);
    });

    it('returns true for identical element nodes', () => {
      const a = createElement('div', { id: 'test' }, [createText('Hello')], 'key1');
      const b = createElement('div', { id: 'test' }, [createText('Hello')], 'key1');
      expect(isEqual(a, b)).toBe(true);
    });

    it('returns false for different element nodes', () => {
      const a = createElement('div', { id: 'test' }, [createText('Hello')], 'key1');
      const b = createElement('span', { id: 'test' }, [createText('Hello')], 'key1');
      expect(isEqual(a, b)).toBe(false);
    });
  });
});

describe('DOM Operations', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('createDOMNode', () => {
    it('creates a text node', () => {
      const vnode = createText('Hello World');
      const node = createDOMNode(vnode);
      expect(node.nodeType).toBe(Node.TEXT_NODE);
      expect(node.textContent).toBe('Hello World');
    });

    it('creates an element node', () => {
      const vnode = createElement('div', { id: 'test', className: 'my-class' }, [createText('Hello')]);
      const node = createDOMNode(vnode);
      expect(node.tagName).toBe('DIV');
      expect(node.id).toBe('test');
      expect(node.className).toBe('my-class');
      expect(node.textContent).toBe('Hello');
    });

    it('creates a fragment', () => {
      const vnode = createFragment([createText('Hello'), createText('World')]);
      const node = createDOMNode(vnode);
      expect(node.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);
      expect(node.childNodes).toHaveLength(2);
    });
  });

  describe('patchNode', () => {
    it('inserts a new node', () => {
      const vnode = createText('Hello');
      patchNode(container, null, vnode);
      expect(container.childNodes).toHaveLength(1);
      expect(container.textContent).toBe('Hello');
    });

    it('removes an old node', () => {
      const oldVNode = createText('Hello');
      const oldNode = createDOMNode(oldVNode);
      container.appendChild(oldNode);
      
      patchNode(container, oldVNode, null);
      expect(container.childNodes).toHaveLength(0);
    });

    it('updates text content', () => {
      const oldVNode = createText('Hello');
      const oldNode = createDOMNode(oldVNode);
      container.appendChild(oldNode);
      oldVNode.el = oldNode;
      
      const newVNode = createText('World');
      patchNode(container, oldVNode, newVNode);
      
      expect(container.textContent).toBe('World');
      expect(newVNode.el).toBe(oldNode);
    });

    it('replaces different type nodes', () => {
      const oldVNode = createText('Hello');
      const oldNode = createDOMNode(oldVNode);
      container.appendChild(oldNode);
      oldVNode.el = oldNode;
      
      const newVNode = createElement('div', {}, [createText('World')]);
      patchNode(container, oldVNode, newVNode);
      
      expect(container.childNodes).toHaveLength(1);
      expect(container.firstChild.tagName).toBe('DIV');
      expect(container.textContent).toBe('World');
    });
  });

  describe('patchChildren', () => {
    it('patches unkeyed children', () => {
      const oldChildren = [createText('Hello'), createText('World')];
      const newChildren = [createText('Hello'), createText('Universe')];
      
      // Mount old children
      oldChildren.forEach(child => {
        const node = createDOMNode(child);
        container.appendChild(node);
      });
      
      patchChildren(container, oldChildren, newChildren);
      
      expect(container.childNodes).toHaveLength(2);
      expect(container.childNodes[0].textContent).toBe('Hello');
      expect(container.childNodes[1].textContent).toBe('Universe');
    });

    it('patches keyed children', () => {
      const oldChildren = [
        createElement('div', { key: '1' }, [createText('Item 1')]),
        createElement('div', { key: '2' }, [createText('Item 2')]),
        createElement('div', { key: '3' }, [createText('Item 3')])
      ];
      const newChildren = [
        createElement('div', { key: '3' }, [createText('Item 3 Updated')]),
        createElement('div', { key: '1' }, [createText('Item 1 Updated')]),
        createElement('div', { key: '4' }, [createText('Item 4')])
      ];
      
      // Mount old children
      oldChildren.forEach(child => {
        const node = createDOMNode(child);
        container.appendChild(node);
        child.el = node;
      });
      
      patchChildren(container, oldChildren, newChildren);
      
      expect(container.childNodes).toHaveLength(3);
      expect(container.childNodes[0].textContent).toBe('Item 3 Updated');
      expect(container.childNodes[1].textContent).toBe('Item 1 Updated');
      expect(container.childNodes[2].textContent).toBe('Item 4');
    });
  });
});

describe('HTML Conversion', () => {
  describe('htmlToVNodes', () => {
    it('converts simple HTML to virtual nodes', () => {
      const html = '<div id="test" class="my-class">Hello World</div>';
      const vnodes = htmlToVNodes(html);
      
      expect(vnodes).toHaveLength(1);
      expect(vnodes[0].type).toBe('element');
      expect(vnodes[0].tag).toBe('div');
      expect(vnodes[0].props.id).toBe('test');
      expect(vnodes[0].props.className).toBe('my-class');
      expect(vnodes[0].children).toHaveLength(1);
      expect(vnodes[0].children[0].text).toBe('Hello World');
    });

    it('converts nested HTML to virtual nodes', () => {
      const html = '<div><span>Hello</span><span>World</span></div>';
      const vnodes = htmlToVNodes(html);
      
      expect(vnodes).toHaveLength(1);
      expect(vnodes[0].children).toHaveLength(2);
      expect(vnodes[0].children[0].tag).toBe('span');
      expect(vnodes[0].children[0].children[0].text).toBe('Hello');
    });
  });

  describe('vNodesToHtml', () => {
    it('converts virtual nodes to HTML', () => {
      const vnodes = [
        createElement('div', { id: 'test', className: 'my-class' }, [createText('Hello World')])
      ];
      const html = vNodesToHtml(vnodes);
      
      expect(html).toContain('<div id="test" class="my-class">Hello World</div>');
    });

    it('converts fragments to HTML', () => {
      const vnode = createFragment([
        createText('Hello '),
        createElement('span', {}, [createText('World')])
      ]);
      const html = vNodesToHtml(vnode);
      
      expect(html).toBe('Hello <span>World</span>');
    });
  });
});

describe('SmoothComponentVDOM', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('renders with virtual DOM', () => {
    class TestComponent extends SmoothComponentVDOM {
      constructor() {
        super(null, { message: 'Hello World' });
      }
      
      vtemplate() {
        return this.h('div', { className: 'test' }, [
          this.h('h1', {}, this.t(this.state.message)),
          this.h('button', { 
            onclick: () => this.setState({ message: 'Updated!' })
          }, this.t('Click me'))
        ]);
      }
    }

    const component = new TestComponent();
    component.mount(container);
    
    expect(container.querySelector('.test')).toBeTruthy();
    expect(container.querySelector('h1').textContent).toBe('Hello World');
    
    // Test state update
    const button = container.querySelector('button');
    button.click();
    
    expect(container.querySelector('h1').textContent).toBe('Updated!');
  });

  it('can toggle virtual DOM on/off', () => {
    class TestComponent extends SmoothComponentVDOM {
      constructor() {
        super(null, { message: 'Hello World' });
      }
      
      template() {
        return `<div class="test">${this.state.message}</div>`;
      }
    }

    const component = new TestComponent();
    component.setVDOMEnabled(false);
    component.mount(container);
    
    expect(container.querySelector('.test')).toBeTruthy();
    expect(container.querySelector('.test').textContent).toBe('Hello World');
  });
});

describe('defineComponentVDOM', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('renders functional component with virtual DOM', () => {
    const TestComponent = defineComponentVDOM(({ useState, h, t }) => {
      const [count, setCount] = useState(0);
      
      const vrender = () => h('div', { className: 'test' }, [
        h('h1', {}, t(`Count: ${count}`)),
        h('button', { 
          onclick: () => setCount(count + 1)
        }, t('Increment'))
      ]);
      
      return { vrender };
    });

    const component = new TestComponent();
    component.mount(container);
    
    expect(container.querySelector('.test')).toBeTruthy();
    expect(container.querySelector('h1').textContent).toBe('Count: 0');
    
    // Test state update
    const button = container.querySelector('button');
    button.click();
    
    expect(container.querySelector('h1').textContent).toBe('Count: 1');
  });

  it('falls back to HTML render when vrender not provided', () => {
    const TestComponent = defineComponentVDOM(({ useState, html }) => {
      const [count, setCount] = useState(0);
      
      const render = () => html`<div class="test">Count: ${count}</div>`;
      
      return { render };
    });

    const component = new TestComponent();
    component.mount(container);
    
    expect(container.querySelector('.test')).toBeTruthy();
    expect(container.querySelector('.test').textContent).toBe('Count: 0');
  });
});

describe('Performance Tests', () => {
  it('handles large lists efficiently', () => {
    const items = Array.from({ length: 1000 }, (_, i) => 
      createElement('div', { key: i }, [createText(`Item ${i}`)])
    );
    
    const start = performance.now();
    const html = vNodesToHtml(items);
    const end = performance.now();
    
    expect(html).toContain('Item 0');
    expect(html).toContain('Item 999');
    expect(end - start).toBeLessThan(100); // Should be fast
  });

  it('handles deep nesting efficiently', () => {
    let vnode = createText('Deep');
    for (let i = 0; i < 100; i++) {
      vnode = createElement('div', { key: i }, [vnode]);
    }
    
    const start = performance.now();
    const html = vNodesToHtml(vnode);
    const end = performance.now();
    
    expect(html).toContain('Deep');
    expect(end - start).toBeLessThan(50); // Should be fast
  });
});
