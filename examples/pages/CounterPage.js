import { Component, utils } from '../../index.js';
import { 
  counterStore, 
  preferencesStore, 
  selectIsEven, 
  selectDouble, 
  selectCountCategory, 
  selectAnimationDuration, 
  selectAppStatus 
} from '../stores/index.js';

// Counter Page (Advanced Global Store)
export class CounterPage extends Component {
  constructor() {
    super(null, {
      showAdvanced: false,
      animationDuration: 300
    });
  }

  onCreate() {
    this
      .on('click', '#inc', () => counterStore.setState(prev => ({ count: prev.count + 1 })))
      .on('click', '#inc2', () => utils.batch(() => { 
        counterStore.setState(prev => ({ count: prev.count + 1 })); 
        counterStore.setState(prev => ({ count: prev.count + 1 })); 
      }))
      .on('click', '#dec', () => counterStore.setState(prev => ({ count: prev.count - 1 })))
      .on('click', '#reset', () => counterStore.reset())
      .on('click', '#replace10', () => counterStore.replaceState({ count: 10 }))
      .on('click', '#toggle-advanced', () => this.setState({ showAdvanced: !this.state.showAdvanced }));

    // Debounced log on increment
    this.logInc = utils.debounce(() => console.log('Debounced count:', counterStore.getState().count), 300);

    // Subscribe using multiple selectors for derived values
    this.unsubEven = counterStore.select(selectIsEven, (isEven) => { 
      this._isEven = isEven; 
      this.render(); 
    });
    this.unsubDouble = counterStore.select(selectDouble, (double) => { 
      this._double = double; 
    });
    this.unsubCategory = counterStore.select(selectCountCategory, (category) => { 
      this._category = category; 
      this.render(); 
    });

    // Subscribe to preferences for animation speed
    this.unsubAnimation = preferencesStore.select(selectAnimationDuration, (duration) => {
      this.setState({ animationDuration: duration });
    });

    // Combined selector subscription
    this.unsubAppStatus = selectAppStatus.subscribe((status) => {
      this._appStatus = status;
      this.render();
    });

    // Also subscribe to any change to throttle logs and ensure UI re-renders on count changes
    this.unsubscribe = counterStore.subscribe(() => { 
      this.render(); 
      this.logInc(); 
    });
  }

  onUnmount() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubEven) this.unsubEven();
    if (this.unsubDouble) this.unsubDouble();
    if (this.unsubCategory) this.unsubCategory();
    if (this.unsubAnimation) this.unsubAnimation();
    if (this.unsubAppStatus) this.unsubAppStatus();
  }

  template() {
    const { count } = counterStore.getState();
    const { theme, animationSpeed } = preferencesStore.getState();
    const appStatus = this._appStatus || {};

    return this.html`
      <div style="max-width: 960px; margin: 0 auto; padding: 0.75rem 1rem;">
        <div style="background: white; border-radius: 12px; padding: 1rem 1.25rem; box-shadow: 0 10px 20px rgba(0,0,0,.14), 0 2px 6px rgba(0,0,0,.08); border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <h2 style="margin: 0 0 0.5rem 0; font-size: 1.875rem; font-weight: 600;">Advanced Counter</h2>
            <p style="margin: 0; color: #6b7280;">Multi-store state management with complex selectors</p>
          </div>
          
          <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 1.5rem;">
            <button id="dec" style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">-</button>
            <div style="font-size: 3rem; font-weight: 700; color: #0ea5e9; min-width: 120px; text-align: center; padding: 0.5rem 1rem; background: #f0f9ff; border-radius: 12px; border: 2px solid #bae6fd;">${count}</div>
            <button id="inc" style="background: #0ea5e9; color: white; border: 1px solid #0ea5e9; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">+</button>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-bottom: 1.5rem;">
            <button id="inc2" style="background: #0ea5e9; color: white; border: 1px solid #0ea5e9; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">++ twice</button>
            <button id="reset" style="background: transparent; color: #6b7280; border: 1px solid #d1d5db; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">Reset</button>
            <button id="replace10" style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">Set to 10</button>
            <button id="toggle-advanced" style="background: transparent; color: #6b7280; border: 1px solid #d1d5db; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
              ${this.state.showAdvanced ? 'Hide' : 'Show'} Advanced
            </button>
          </div>
          
          ${this.state.showAdvanced ? this.html`
            <div style="padding: 1.5rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 1.5rem;">
              <h3 style="margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600;">Advanced State Management</h3>

              <div style="display: grid; grid-template-columns: repeat(1, 1fr); gap: 1rem; margin-bottom: 1rem;">
                <div style="padding: 1rem; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
                  <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">Category</div>
                  <div style="font-size: 1.125rem; font-weight: 600; color: ${this._category === 'zero' ? '#6b7280' : this._category === 'positive' ? '#059669' : '#dc2626'};">${utils.escapeHtml(this._category || 'unknown')}</div>
                </div>

                <div style="padding: 1rem; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
                  <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">App Status</div>
                  <div style="font-size: 1.125rem; font-weight: 600; color: ${appStatus.online ? '#059669' : '#dc2626'};">${utils.escapeHtml(appStatus.status || 'unknown')}</div>
                </div>

                <div style="padding: 1rem; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
                  <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">Animation</div>
                  <div style="font-size: 1.125rem; font-weight: 600; color: #0ea5e9;">${animationSpeed} (${this.state.animationDuration}ms)</div>
                </div>
              </div>
          
              <div style="padding: 1rem; background: #f0f9ff; border-radius: 6px; border: 1px solid #bae6fd;">
                <div style="font-size: 0.875rem; color: #0c4a6e;">
                  <strong>Store States:</strong><br>
                  Counter: ${count} | Double: ${this._double || (count*2)} | Even: ${this._isEven ? 'Yes' : 'No'}<br>
                  Theme: ${theme} | Online: ${appStatus.online ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          ` : ''}

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem; padding: 1rem; background: #f8fafc; border-radius: 8px;">
            <div style="text-align: center;">
              <div style="font-size: 0.875rem; font-weight: 500; color: #6b7280; margin-bottom: 0.25rem;">Double</div>
              <div style="font-size: 1.25rem; font-weight: 700; color: #2563eb;">${this._double ?? (count*2)}</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 0.875rem; font-weight: 500; color: #6b7280; margin-bottom: 0.25rem;">Even?</div>
              <div style="font-size: 1.25rem; font-weight: 700; color: ${this._isEven ? '#059669' : '#dc2626'};">${this._isEven ? 'Yes' : 'No'}</div>
            </div>
          </div>

          <div style="padding: 1rem; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
            <p style="margin: 0; font-size: 0.875rem; color: #166534;">
              Multi-store state management with memoized selectors, update batching, debounced operations, and cross-store synchronization.
            </p>
          </div>
        </div>
      </div>
    `;
  }
}
