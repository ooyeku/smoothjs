import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SmoothComponent } from '../src/component/SmoothComponent.js';
import { utils } from '../src/utils/index.js';

class SimpleComp extends SmoothComponent {
  constructor() { super(null, { n: 0, crash: false, text: '' }); }
  renderError(err) { return this.html`<div data-testid="err">${err.message}</div>`; }
  template() {
    if (this.state.crash) throw new Error('boom');
    return this.html`<div><span id="val">${this.state.n}</span><input id="inp" value="${this.state.text}"></div>`;
  }
}

class LifecycleComp extends SmoothComponent {
  constructor() { 
    super(null, { mounted: false, unmounted: false, onCreateCalled: false }); 
  }
  
  onCreate() { 
    this.setState({ onCreateCalled: true }); 
  }
  
  onMount() { 
    this.setState({ mounted: true }); 
  }
  
  onUnmount() { 
    this.setState({ unmounted: true }); 
  }
  
  template() {
    return this.html`<div data-testid="lifecycle">
      <span data-testid="mounted">${this.state.mounted}</span>
      <span data-testid="unmounted">${this.state.unmounted}</span>
      <span data-testid="onCreate">${this.state.onCreateCalled}</span>
    </div>`;
  }
}

class EventComp extends SmoothComponent {
  constructor() { 
    super(null, { clickCount: 0, inputValue: '' }); 
  }
  
  onCreate() {
    this.on('click', 'button', () => {
      this.setState({ clickCount: this.state.clickCount + 1 });
    });
    
    this.on('input', 'input', (e) => {
      this.setState({ inputValue: e.target.value });
    });
  }
  
  template() {
    return this.html`<div>
      <button data-testid="btn">Click me</button>
      <input data-testid="input" type="text" value="${this.state.inputValue}">
      <span data-testid="clicks">${this.state.clickCount}</span>
    </div>`;
  }
}

class PropsComp extends SmoothComponent {
  constructor() { 
    super(null, { localValue: 'default' }); 
  }
  
  onPropsChange() {
    if (this.props.externalValue) {
      this.setState({ localValue: this.props.externalValue });
    }
  }
  
  template() {
    return this.html`<div>
      <span data-testid="local">${this.state.localValue}</span>
      <span data-testid="external">${this.props.externalValue || 'none'}</span>
    </div>`;
  }
}

class StateComp extends SmoothComponent {
  constructor() { 
    super(null, { count: 0, items: [], flag: false }); 
  }
  
  increment() {
    this.setState({ count: this.state.count + 1 });
  }
  
  addItem(item) {
    this.setState(prev => ({ 
      items: [...prev.items, item] 
    }));
  }
  
  toggleFlag() {
    this.setState(prev => ({ flag: !prev.flag }));
  }
  
  template() {
    return this.html`<div>
      <span data-testid="count">${this.state.count}</span>
      <span data-testid="flag">${this.state.flag}</span>
      <ul data-testid="items">
        ${this.state.items.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>`;
  }
}

describe('SmoothComponent', () => {
  let host;

  beforeEach(() => {
    host = document.createElement('div');
    host.id = 'host';
    document.body.appendChild(host);
  });

  afterEach(() => {
    if (host.parentNode) {
      host.parentNode.removeChild(host);
    }
  });

  describe('Basic Rendering', () => {
    it('renders and batches setState via utils.batch', async () => {
      const c = new SimpleComp();
      c.mount(host);
      
      utils.batch(() => {
        c.setState({ n: 1 });
        c.setState({ n: 2 });
      });
      
      await Promise.resolve();
      expect(host.querySelector('#val').textContent).toBe('2');
      expect(host.querySelector('#inp')).toBeTruthy();
    });

    it('shows renderError fallback on error', async () => {
      const c = new SimpleComp();
      c.mount(host);
      
      c.setState({ crash: true });
      await Promise.resolve();
      
      const err = host.querySelector('[data-testid="err"]');
      expect(err).toBeTruthy();
      expect(err.textContent).toContain('boom');
      expect(host.querySelector('#val')).toBeFalsy(); // Original content should be replaced
    });

    it('preserves focus and input value across re-render', async () => {
      const c = new SimpleComp();
      c.mount(host);
      
      c.setState({ text: 'hello' });
      await Promise.resolve();
      
      const inp = host.querySelector('#inp');
      inp.focus();
      inp.setSelectionRange(1, 3);
      
      c.setState({ n: 42 });
      await Promise.resolve();
      
      expect(document.activeElement).toBe(inp);
      expect(inp.value).toBe('hello');
      expect(host.querySelector('#val').textContent).toBe('42');
    });

    it('handles multiple rapid state updates correctly', async () => {
      const c = new SimpleComp();
      c.mount(host);
      
      // Multiple rapid updates
      c.setState({ n: 1 });
      c.setState({ n: 2 });
      c.setState({ n: 3 });
      c.setState({ n: 4 });
      c.setState({ n: 5 });
      
      await Promise.resolve();
      expect(host.querySelector('#val').textContent).toBe('5');
    });

    it('renders with initial state correctly', () => {
      const c = new SimpleComp();
      c.mount(host);
      
      expect(host.querySelector('#val').textContent).toBe('0');
      expect(host.querySelector('#inp').value).toBe('');
    });
  });

  describe('Mounting and Unmounting', () => {
    it('mounts and unmounts correctly', async () => {
      const c = new SimpleComp();
      c.mount(host);
      await Promise.resolve();
      
      expect(host.querySelector('#val').textContent).toBe('0');
      expect(c.isMounted).toBe(true);
      
      c.unmount();
      expect(c.isMounted).toBe(false);
      expect(host.querySelector('#val')).toBeFalsy();
    });

    it('mounts with selector correctly', async () => {
      const c = new SimpleComp();
      c.mount('#host');
      await Promise.resolve();
      
      expect(host.querySelector('#val').textContent).toBe('0');
      expect(c.isMounted).toBe(true);
    });

    it('mounts with element correctly', async () => {
      const c = new SimpleComp();
      c.mount(host);
      await Promise.resolve();
      
      expect(host.querySelector('#val').textContent).toBe('0');
      expect(c.isMounted).toBe(true);
    });

    it('handles multiple mount/unmount cycles', async () => {
      const c = new SimpleComp();
      
      // First mount
      c.mount(host);
      await Promise.resolve();
      expect(host.querySelector('#val')).toBeTruthy();
      expect(c.isMounted).toBe(true);
      
      // Unmount
      c.unmount();
      expect(host.querySelector('#val')).toBeFalsy();
      expect(c.isMounted).toBe(false);
      
      // Second mount
      c.mount(host);
      await Promise.resolve();
      expect(host.querySelector('#val')).toBeTruthy();
      expect(c.isMounted).toBe(true);
    });

    it('prevents double mounting', async () => {
      const c = new SimpleComp();
      c.mount(host);
      await Promise.resolve();
      
      expect(c.isMounted).toBe(true);
      
      // Try to mount again
      c.mount(host);
      expect(c.isMounted).toBe(true);
      
      // Should still have only one instance
      expect(host.querySelectorAll('#val')).toHaveLength(1);
    });
  });

  describe('Lifecycle Methods', () => {
    it('calls onCreate when component is constructed', async () => {
      const c = new LifecycleComp();
      c.mount(host);
      await Promise.resolve();
      
      expect(host.querySelector('[data-testid="onCreate"]').textContent).toBe('true');
    });

    it('calls onMount when component is mounted', async () => {
      const c = new LifecycleComp();
      c.mount(host);
      await Promise.resolve();
      
      expect(host.querySelector('[data-testid="mounted"]').textContent).toBe('true');
    });

    it('calls onUnmount when component is unmounted', async () => {
      const c = new LifecycleComp();
      c.mount(host);
      await Promise.resolve();
      
      c.unmount();
      expect(c.state.unmounted).toBe(true);
    });

    it('calls lifecycle methods in correct order', async () => {
      const lifecycleOrder = [];
      const originalOnCreate = LifecycleComp.prototype.onCreate;
      const originalOnMount = LifecycleComp.prototype.onMount;
      
      LifecycleComp.prototype.onCreate = function() {
        lifecycleOrder.push('onCreate');
        originalOnCreate.call(this);
      };
      
      LifecycleComp.prototype.onMount = function() {
        lifecycleOrder.push('onMount');
        originalOnMount.call(this);
      };
      
      const c = new LifecycleComp();
      c.mount(host);
      await Promise.resolve();
      
      expect(lifecycleOrder).toEqual(['onCreate', 'onMount']);
      
      // Restore original methods
      LifecycleComp.prototype.onCreate = originalOnCreate;
      LifecycleComp.prototype.onMount = originalOnMount;
    });
  });

  describe('Event Handling', () => {
    it('handles click events correctly', async () => {
      const c = new EventComp();
      c.mount(host);
      await Promise.resolve();
      
      const button = host.querySelector('[data-testid="btn"]');
      button.click();
      await Promise.resolve();
      
      expect(host.querySelector('[data-testid="clicks"]').textContent).toBe('1');
    });

    it('handles input events correctly', async () => {
      const c = new EventComp();
      c.mount(host);
      await Promise.resolve();
      
      const input = host.querySelector('[data-testid="input"]');
      input.value = 'test input';
      input.dispatchEvent(new Event('input'));
      await Promise.resolve();
      
      expect(host.querySelector('[data-testid="input"]').value).toBe('test input');
    });

    it('removes event listeners on unmount', async () => {
      const c = new EventComp();
      c.mount(host);
      await Promise.resolve();
      
      c.unmount();
      
      // Event listeners should be cleaned up
      expect(c.events.size).toBe(0);
    });

    it('handles multiple event types', async () => {
      const c = new EventComp();
      c.mount(host);
      await Promise.resolve();
      
      const button = host.querySelector('[data-testid="btn"]');
      const input = host.querySelector('[data-testid="input"]');
      
      // Click button
      button.click();
      await Promise.resolve();
      
      // Type in input
      input.value = 'hello';
      input.dispatchEvent(new Event('input'));
      await Promise.resolve();
      
      expect(host.querySelector('[data-testid="clicks"]').textContent).toBe('1');
      expect(host.querySelector('[data-testid="input"]').value).toBe('hello');
    });

    it('prevents event handler memory leaks', async () => {
      const c = new EventComp();
      c.mount(host);
      await Promise.resolve();
      
      const initialEventCount = c.events.size;
      expect(initialEventCount).toBeGreaterThan(0);
      
      c.unmount();
      expect(c.events.size).toBe(0);
    });
  });

  describe('Props Management', () => {
    it('handles null props gracefully', () => {
      const c = new PropsComp();
      c.setProps(null);
      expect(c.props).toEqual({});
    });

    it('handles undefined props gracefully', () => {
      const c = new PropsComp();
      c.setProps(undefined);
      expect(c.props).toEqual({});
    });

    it('merges props correctly', () => {
      const c = new PropsComp();
      c.setProps({ prop1: 'value1' });
      c.setProps({ prop2: 'value2' });
      
      expect(c.props.prop1).toBe('value1');
      expect(c.props.prop2).toBe('value2');
    });

    it('calls onPropsChange when props are updated', async () => {
      const c = new PropsComp();
      c.mount(host);
      await Promise.resolve();
      
      expect(host.querySelector('[data-testid="local"]').textContent).toBe('default');
      
      c.setProps({ externalValue: 'new value' });
      await Promise.resolve();
      
      expect(host.querySelector('[data-testid="local"]').textContent).toBe('new value');
      expect(host.querySelector('[data-testid="external"]').textContent).toBe('new value');
    });

    it('handles props with special characters', () => {
      const c = new PropsComp();
      c.setProps({ 
        'special-prop': 'value',
        'prop.with.dots': 'dotty',
        'prop[with]brackets': 'brackety'
      });
      
      expect(c.props['special-prop']).toBe('value');
      expect(c.props['prop.with.dots']).toBe('dotty');
      expect(c.props['prop[with]brackets']).toBe('brackety');
    });
  });

  describe('State Management', () => {
    it('handles null state updates gracefully', async () => {
      const c = new StateComp();
      c.mount(host);
      await Promise.resolve();
      
      c.setState(null);
      await Promise.resolve();
      
      // Component should still render with existing state
      expect(host.querySelector('[data-testid="count"]')).toBeTruthy();
      expect(host.querySelector('[data-testid="count"]').textContent).toBe('0');
    });

    it('handles undefined state updates gracefully', async () => {
      const c = new StateComp();
      c.mount(host);
      await Promise.resolve();
      
      c.setState(undefined);
      await Promise.resolve();
      
      // Component should still render with existing state
      expect(host.querySelector('[data-testid="count"]')).toBeTruthy();
    });

    it('handles empty object state updates', async () => {
      const c = new StateComp();
      c.mount(host);
      await Promise.resolve();
      
      c.setState({});
      await Promise.resolve();
      
      // Component should still render with existing state
      expect(host.querySelector('[data-testid="count"]')).toBeTruthy();
    });

    it('handles function-based state updates', async () => {
      const c = new StateComp();
      c.mount(host);
      await Promise.resolve();
      
      c.setState(prevState => ({ count: prevState.count + 10 }));
      await Promise.resolve();
      
      expect(host.querySelector('[data-testid="count"]').textContent).toBe('10');
    });

    it('handles complex state updates', async () => {
      const c = new StateComp();
      c.mount(host);
      await Promise.resolve();
      
      c.addItem('item1');
      c.addItem('item2');
      c.toggleFlag();
      await Promise.resolve();
      
      expect(host.querySelector('[data-testid="flag"]').textContent).toBe('true');
      const items = host.querySelectorAll('[data-testid="items"] li');
      expect(items).toHaveLength(2);
      expect(items[0].textContent).toBe('item1');
      expect(items[1].textContent).toBe('item2');
    });

    it('batches multiple state updates correctly', async () => {
      const c = new StateComp();
      c.mount(host);
      await Promise.resolve();
      
      utils.batch(() => {
        c.increment();
        c.increment();
        c.increment();
        c.toggleFlag();
      });
      
      await Promise.resolve();
      
      expect(host.querySelector('[data-testid="count"]').textContent).toBe('3');
      expect(host.querySelector('[data-testid="flag"]').textContent).toBe('true');
    });
  });

  describe('HTML Template Helper', () => {
    it('handles empty strings correctly', () => {
      const c = new SimpleComp();
      const result = c.html``;
      expect(result).toBe('');
    });

    it('handles single string correctly', () => {
      const c = new SimpleComp();
      const result = c.html`Hello`;
      expect(result).toBe('Hello');
    });

    it('handles single value correctly', () => {
      const c = new SimpleComp();
      const result = c.html`${'World'}`;
      expect(result).toBe('World');
    });

    it('handles multiple values correctly', () => {
      const c = new SimpleComp();
      const result = c.html`Hello ${'World'}!`;
      expect(result).toBe('Hello World!');
    });

    it('handles null values correctly', () => {
      const c = new SimpleComp();
      const result = c.html`Hello ${null}!`;
      expect(result).toBe('Hello !');
    });

    it('handles undefined values correctly', () => {
      const c = new SimpleComp();
      const result = c.html`Hello ${undefined}!`;
      expect(result).toBe('Hello !');
    });

    it('handles number values correctly', () => {
      const c = new SimpleComp();
      const result = c.html`Count: ${42}`;
      expect(result).toBe('Count: 42');
    });

    it('handles boolean values correctly', () => {
      const c = new SimpleComp();
      const result = c.html`Flag: ${true}`;
      expect(result).toBe('Flag: true');
    });

    it('handles array values correctly', () => {
      const c = new SimpleComp();
      const result = c.html`Items: ${['a', 'b', 'c']}`;
      expect(result).toBe('Items: a,b,c');
    });

    it('handles object values correctly', () => {
      const c = new SimpleComp();
      const result = c.html`Object: ${{ key: 'value' }}`;
      expect(result).toBe('Object: [object Object]');
    });
  });

  describe('Error Handling', () => {
    it('handles template errors gracefully', async () => {
      class ErrorComp extends SmoothComponent {
        constructor() { super(null, { shouldError: false }); }
        template() { 
          if (this.state.shouldError) throw new Error('Template error');
          return this.html`<div>OK</div>`;
        }
        renderError(err) { return this.html`<div data-testid="error">${err.message}</div>`; }
      }
      
      const c = new ErrorComp();
      c.mount(host);
      await Promise.resolve();
      
      expect(host.querySelector('div').textContent).toBe('OK');
      
      c.setState({ shouldError: true });
      await Promise.resolve();
      
      expect(host.querySelector('[data-testid="error"]').textContent).toBe('Template error');
    });

    it('handles missing renderError method gracefully', async () => {
      class NoErrorComp extends SmoothComponent {
        constructor() { super(null, { shouldError: false }); }
        template() { 
          if (this.state.shouldError) throw new Error('Template error');
          return this.html`<div>OK</div>`;
        }
      }
      
      const c = new NoErrorComp();
      c.mount(host);
      await Promise.resolve();
      
      expect(host.querySelector('div').textContent).toBe('OK');
      
      // Should not crash even without renderError method
      expect(() => {
        c.setState({ shouldError: true });
      }).not.toThrow();
    });

    it('handles errors in lifecycle methods gracefully', async () => {
      class LifecycleErrorComp extends SmoothComponent {
        constructor() { super(null, { shouldError: false }); }
        
        onMount() {
          if (this.state.shouldError) throw new Error('Lifecycle error');
        }
        
        template() { return this.html`<div>OK</div>`; }
      }
      
      const c = new LifecycleErrorComp();
      
      // Should not crash on lifecycle error
      expect(() => {
        c.mount(host);
      }).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    it('cleans up children on unmount', async () => {
      const c = new SimpleComp();
      c.mount(host);
      await Promise.resolve();
      
      c.setChildren([document.createElement('div')]);
      expect(c.children.length).toBe(1);
      
      c.unmount();
      expect(c.children.length).toBe(0);
    });

    it('handles multiple mount/unmount cycles without memory leaks', async () => {
      const c = new SimpleComp();
      
      for (let i = 0; i < 5; i++) {
        c.mount(host);
        await Promise.resolve();
        expect(host.querySelector('#val')).toBeTruthy();
        
        c.unmount();
        expect(host.querySelector('#val')).toBeFalsy();
      }
    });

    it('cleans up event listeners properly', async () => {
      const c = new EventComp();
      c.mount(host);
      await Promise.resolve();
      
      const initialEventCount = c.events.size;
      expect(initialEventCount).toBeGreaterThan(0);
      
      c.unmount();
      expect(c.events.size).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles component with no template method', () => {
      class NoTemplateComp extends SmoothComponent {
        constructor() { super(null, {}); }
      }
      
      const c = new NoTemplateComp();
      expect(() => c.mount(host)).not.toThrow();
    });

    it('handles component with empty template', async () => {
      class EmptyTemplateComp extends SmoothComponent {
        constructor() { super(null, {}); }
        template() { return ''; }
      }
      
      const c = new EmptyTemplateComp();
      c.mount(host);
      await Promise.resolve();
      
      expect(host.innerHTML).toBe('');
    });

    it('handles component with null template', async () => {
      class NullTemplateComp extends SmoothComponent {
        constructor() { super(null, {}); }
        template() { return null; }
      }
      
      const c = new NullTemplateComp();
      c.mount(host);
      await Promise.resolve();
      
      expect(host.innerHTML).toBe('');
    });

    it('handles component with undefined template', async () => {
      class UndefinedTemplateComp extends SmoothComponent {
        constructor() { super(null, {}); }
        template() { return undefined; }
      }
      
      const c = new UndefinedTemplateComp();
      c.mount(host);
      await Promise.resolve();
      
      expect(host.innerHTML).toBe('');
    });

    it('handles very large state objects', async () => {
      const largeState = {
        items: Array.from({ length: 1000 }, (_, i) => `item${i}`),
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
          config: { theme: 'dark', language: 'en' }
        }
      };
      
      class LargeStateComp extends SmoothComponent {
        constructor() { super(null, largeState); }
        template() { 
          return this.html`<div>
            <span data-testid="count">${this.state.items.length}</span>
            <span data-testid="version">${this.state.metadata.version}</span>
          </div>`;
        }
      }
      
      const c = new LargeStateComp();
      c.mount(host);
      await Promise.resolve();
      
      expect(host.querySelector('[data-testid="count"]').textContent).toBe('1000');
      expect(host.querySelector('[data-testid="version"]').textContent).toBe('1.0.0');
    });
  });
});
