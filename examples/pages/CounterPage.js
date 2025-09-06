import { defineComponent, utils, Velvet, Button } from '../../index.js';
import { 
  counterStore, 
  preferencesStore, 
  selectIsEven, 
  selectDouble, 
  selectCountCategory, 
  selectAnimationDuration, 
  selectAppStatus 
} from '../stores/index.js';

// Counter Page (Advanced Global Store) — functional
export const CounterPage = defineComponent((ctx) => {
  const { html, on, useState, useEffect, find } = ctx;
  const { vs } = Velvet.useVelvet(ctx);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [animationDuration, setAnimationDuration] = useState(300);
  const [isEven, setIsEven] = useState(false);
  const [double, setDouble] = useState(null);
  const [category, setCategory] = useState('unknown');
  const [appStatus, setAppStatus] = useState({ online: false, status: 'unknown' });

  on('click', '#inc', () => counterStore.setState(prev => ({ count: prev.count + 1 })));
  on('click', '#inc2', () => utils.batch(() => { 
    counterStore.setState(prev => ({ count: prev.count + 1 })); 
    counterStore.setState(prev => ({ count: prev.count + 1 })); 
  }));
  on('click', '#dec', () => counterStore.setState(prev => ({ count: prev.count - 1 })));
  on('click', '#reset', () => counterStore.reset());
  on('click', '#replace10', () => counterStore.replaceState({ count: 10 }));
  on('click', '#toggle-advanced', () => setShowAdvanced(v => !v));

  // Debounced log on increment
  const logInc = utils.debounce(() => console.log('Debounced count:', counterStore.getState().count), 300);

  let unsub = null, unsubEven = null, unsubDouble = null, unsubCategory = null, unsubAnimation = null, unsubApp = null;
  const onMount = () => {
    unsubEven = counterStore.select(selectIsEven, (v) => { setIsEven(!!v); });
    unsubDouble = counterStore.select(selectDouble, (v) => { setDouble(v); });
    unsubCategory = counterStore.select(selectCountCategory, (v) => { setCategory(v || 'unknown'); });
    unsubAnimation = preferencesStore.select(selectAnimationDuration, (dur) => { setAnimationDuration(dur); });
    unsubApp = selectAppStatus.subscribe((s) => { setAppStatus(s || { online: false, status: 'unknown' }); });
    unsub = counterStore.subscribe(() => { logInc(); });
  };

  const onUnmount = () => {
    try { unsub && unsub(); } catch {}
    try { unsubEven && unsubEven(); } catch {}
    try { unsubDouble && unsubDouble(); } catch {}
    try { unsubCategory && unsubCategory(); } catch {}
    try { unsubAnimation && unsubAnimation(); } catch {}
    try { unsubApp && unsubApp(); } catch {}
  };

  const render = () => {
    const { count } = counterStore.getState();
    const { theme, animationSpeed } = preferencesStore.getState();
    const cat = category;
    const app = appStatus || {};

    const outerClass = vs({ base: { maxWidth: '960px', margin: '0 auto', padding: '0.75rem 1rem' } });
    const cardClass = vs({ 
      base: { background: 'white', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 10px 20px rgba(0,0,0,.14), 0 2px 6px rgba(0,0,0,.08)', border: '1px solid #e5e7eb' },
      dark: { background: '#0f1a2b', color: '#f0f3f8', border: '1px solid #3b4b63' }
    });
    const btn = vs({ 
      base: { padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', border: '1px solid #d1d5db', background: '#f3f4f6', color: '#374151' }, 
      hover: { background: '#e5e7eb' },
      dark: { background: '#16243a', border: '1px solid #3b4b63', color: '#e5e7eb' }
    });
    const btnPrimary = vs({ 
      base: { padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', border: '1px solid #0ea5e9', background: '#0ea5e9', color: 'white' }, 
      hover: { background: '#0284c7', borderColor: '#0284c7' },
      dark: { background: '#0284c7', border: '1px solid #0284c7' }
    });
    const counterBox = vs({ 
      base: { fontSize: '3rem', fontWeight: '700', color: '#0ea5e9', minWidth: '120px', textAlign: 'center', padding: '0.5rem 1rem', background: '#f0f9ff', borderRadius: '12px', border: '2px solid #bae6fd' },
      dark: { color: '#8dd9ff', background: '#122033', border: '2px solid #1e3a5f' }
    });
    const row = vs({ base: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' } });
    const grid2 = vs({ base: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' } });

    // Themed panels
    const panel = vs({ base: { padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '1.5rem' }, dark: { background: '#0f1a2b', border: '1px solid #3b4b63', color: '#f0f3f8' } });
    const cardSm = vs({ base: { padding: '1rem', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }, dark: { background: '#0f1a2b', border: '1px solid #3b4b63', color: '#f0f3f8' } });
    const infoPanel = vs({ base: { padding: '1rem', background: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd' }, dark: { background: '#122033', border: '1px solid #1e3a5f', color: '#dbeafe' } });
    const muted = vs({ base: { color: '#6b7280' }, dark: { color: '#d1d5db' } });

    const twoColPanel = vs({ base: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }, dark: { background: '#0f1a2b' } });
    const success = vs({ base: { padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }, dark: { background: '#052e16', border: '1px solid #065f46' } });
    const successText = vs({ base: { margin: 0, fontSize: '0.875rem', color: '#166534' }, dark: { color: '#bbf7d0' } });

    return html`
      <div class="${outerClass}">
        <div class="${cardClass}">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <h2 style="margin: 0 0 0.5rem 0; font-size: 1.875rem; font-weight: 600;">Advanced Counter</h2>
            <p class="${muted}" style="margin: 0;">Multi-store state management with complex selectors</p>
          </div>
          
          <div class="${row}">
            <span id="btn-dec"></span>
            <div class="${counterBox}">${count}</div>
            <span id="btn-inc"></span>
          </div>
          
          <div class="${grid2}">
            <span id="btn-inc2"></span>
            <span id="btn-reset"></span>
            <span id="btn-set10"></span>
            <span id="btn-toggle-adv"></span>
          </div>
          
          ${showAdvanced ? html`
            <div class="${panel}">
              <h3 style="margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600;">Advanced State Management</h3>

              <div style="display: grid; grid-template-columns: repeat(1, 1fr); gap: 1rem; margin-bottom: 1rem;">
                <div class="${cardSm}">
                  <div class="${muted}" style="font-size: 0.875rem; margin-bottom: 0.25rem;">Category</div>
                  <div style="font-size: 1.125rem; font-weight: 600; color: ${cat === 'zero' ? '#6b7280' : cat === 'positive' ? '#059669' : '#dc2626'};">${utils.escapeHtml(cat || 'unknown')}</div>
                </div>

                <div class="${cardSm}">
                  <div class="${muted}" style="font-size: 0.875rem; margin-bottom: 0.25rem;">App Status</div>
                  <div style="font-size: 1.125rem; font-weight: 600; color: ${app.online ? '#059669' : '#dc2626'};">${utils.escapeHtml(app.status || 'unknown')}</div>
                </div>

                <div class="${cardSm}">
                  <div class="${muted}" style="font-size: 0.875rem; margin-bottom: 0.25rem;">Animation</div>
                  <div style="font-size: 1.125rem; font-weight: 600; color: #0ea5e9;">${animationSpeed} (${animationDuration}ms)</div>
                </div>
              </div>
          
              <div class="${infoPanel}">
                <div style="font-size: 0.875rem;">
                  <strong>Store States:</strong><br>
                  Counter: ${count} | Double: ${double ?? (count*2)} | Even: ${isEven ? 'Yes' : 'No'}<br>
                  Theme: ${theme} | Online: ${app.online ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          ` : ''}

          <div class="${twoColPanel}">
            <div style="text-align: center;">
              <div class="${muted}" style="font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">Double</div>
              <div style="font-size: 1.25rem; font-weight: 700; color: #2563eb;">${double ?? (count*2)}</div>
            </div>
            <div style="text-align: center;">
              <div class="${muted}" style="font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">Even?</div>
              <div style="font-size: 1.25rem; font-weight: 700; color: ${isEven ? '#059669' : '#dc2626'};">${isEven ? 'Yes' : 'No'}</div>
            </div>
          </div>

          <div class="${success}">
            <p class="${successText}">
              Multi-store state management with memoized selectors, update batching, debounced operations, and cross-store synchronization.
            </p>
          </div>
        </div>
      </div>
    `;
  };

  return { render, onMount, onUnmount };
});
