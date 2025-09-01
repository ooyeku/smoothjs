import { defineComponent, utils, A11y } from '../../index.js';

// Error Demo Page — functional with onError/renderError fallback
export const ErrorPage = defineComponent(({ html, on, useState }) => {
  const [crash, setCrash] = useState(false);
  const [asyncError, setAsyncError] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [errorHistory, setErrorHistory] = useState([]);

  const addToHistory = (type, description) => {
    const h = [ { id: Date.now(), type, description, timestamp: new Date().toLocaleTimeString() }, ...(errorHistory || []) ];
    setErrorHistory(h.slice(0, 10));
  };

  on('click', '#crashSelf', () => { setCrash(true); addToHistory('Synchronous Error', 'Runtime error thrown in template'); });
  on('click', '#asyncError', async () => {
    setAsyncError(true); addToHistory('Async Error', 'Error in async operation');
    try {
      await new Promise((_, reject) => setTimeout(() => reject(new Error('Async operation failed')), 1000));
    } catch (error) {
      throw new Error('Async Error: ' + error.message);
    }
  });
  on('click', '#networkError', () => { setNetworkError(true); addToHistory('Network Error', 'Failed to fetch data'); throw new Error('Network Error: Unable to connect to server'); });
  on('click', '#validationError', () => { setValidationError(true); addToHistory('Validation Error', 'Invalid input data'); throw new Error('Validation Error: Invalid data provided'); });
  on('click', '#resetErr', () => { setCrash(false); setAsyncError(false); setNetworkError(false); setValidationError(false); });
  on('click', '#clearHistory', () => { setErrorHistory([]); });

  const renderError = (err) => {
    const msg = err && err.message ? String(err.message) : String(err || 'Error');
    const errorType = msg.includes('Async') ? 'Async Error' : msg.includes('Network') ? 'Network Error' : msg.includes('Validation') ? 'Validation Error' : 'Runtime Error';
    try { A11y && A11y.announce && A11y.announce(`Error: ${errorType} - ${msg}`, { politeness: 'assertive', timeout: 0 }); } catch {}
    return html`
      <div style="max-width: 768px; margin: 0 auto; padding: 0.75rem 1rem;">
        <div style="background: white; border-radius: 12px; padding: 1rem 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,.1); border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">!</div>
            <h2 style="margin: 0 0 0.5rem 0; font-size: 1.875rem; font-weight: 600; color: #dc2626;">Error Boundary</h2>
            <p style="margin: 0; color: #6b7280;">Caught a ${errorType.toLowerCase()}</p>
          </div>
          <div style="padding: 1.5rem; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
              <span style="font-weight: 500;">Error Type:</span>
              <span style="padding: 0.25rem 0.5rem; background: #fecaca; color: #991b1b; border-radius: 4px; font-size: 0.875rem; font-weight: 500;">${errorType}</span>
            </div>
            <div style="font-size: 0.875rem; color: #991b1b;"><strong>${utils.escapeHtml(msg)}</strong></div>
          </div>
          <div style="display: flex; gap: 0.75rem; justify-content: center;">
            <button id="resetErr" style="background: #0ea5e9; color: white; border: 1px solid #0ea5e9; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">Reset & Continue</button>
          </div>
        </div>
      </div>
    `;
  };

  const render = () => {
    if (crash) throw new Error('Runtime Error: Something went wrong in ErrorPage component');
    if (asyncError) setTimeout(() => { throw new Error('Async Error: Delayed error occurred'); }, 100);
    if (networkError) throw new Error('Network Error: Failed to connect to server');
    if (validationError) throw new Error('Validation Error: Invalid data provided');

    return html`
      <div style="max-width: 768px; margin: 0 auto; padding: 0.75rem 1rem;">
        <div style="background: white; border-radius: 12px; padding: 1rem 1.25rem; box-shadow: 0 10px 20px rgba(0,0,0,.14), 0 2px 6px rgba(0,0,0,.08); border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <h2 style="margin: 0 0 0.5rem 0; font-size: 1.875rem; font-weight: 600;">Error Boundaries Demo</h2>
            <p style="margin: 0; color: #6b7280;">Test different types of errors and see how they're handled</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(1, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="padding: 1.5rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600; color: #111827;">Error Triggers</h3>

              <div style="display: grid; grid-template-columns: repeat(1, 1fr); gap: 0.5rem;">
                <button id="crashSelf" style="background: #0ea5e9; color: white; border: 1px solid #0ea5e9; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">Runtime Error</button>
                <button id="asyncError" style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">Async Error</button>
                <button id="networkError" style="background: transparent; color: #0ea5e9; border: 1px solid #0ea5e9; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">Network Error</button>
                <button id="validationError" style="background: transparent; color: #0ea5e9; border: 1px solid #0ea5e9; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">Validation Error</button>
              </div>
            </div>

            <div style="padding: 1.5rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600; color: #111827;">Error History</h3>

              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${(!errorHistory || errorHistory.length === 0) ? html`
                  <div style="font-size: 0.875rem; color: #6b7280; font-style: italic;">No errors triggered yet</div>
                ` : errorHistory.slice(0, 3).map(error => html`
                  <div style="padding: 0.5rem; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 4px;">
                    <div style="font-size: 0.75rem; font-weight: 500; color: #991b1b;">${error.type}</div>
                    <div style="font-size: 0.75rem; color: #dc2626;">${error.timestamp}</div>
                  </div>
                `).join('')}

                ${(errorHistory && errorHistory.length > 3) ? html`
                  <div style="font-size: 0.75rem; color: #6b7280;">+${errorHistory.length - 3} more...</div>
                ` : ''}
              </div>

              ${(errorHistory && errorHistory.length > 0) ? html`
                <button id="clearHistory" style="background: transparent; color: #6b7280; border: 1px solid #d1d5db; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem; margin-top: 0.5rem;">Clear History</button>
              ` : ''}
            </div>
          </div>

          <div style="padding: 1rem; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px;">
            <h4 style="margin: 0 0 0.75rem 0; font-size: 0.875rem; font-weight: 600; color: #d97706;">Safety Notice</h4>
            <p style="margin: 0; font-size: 0.875rem; color: #92400e;">These buttons will intentionally trigger errors to demonstrate error boundary functionality. The errors are caught safely and won't crash the entire application.</p>
          </div>
        </div>
      </div>
    `;
  };

  return { render, renderError };
});
