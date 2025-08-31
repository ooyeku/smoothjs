import { Component, http, Query, utils } from '../../index.js';

// Fetch Demo Page with Query Cache
export class FetchPage extends Component {
  constructor() {
    super(null, {
      loading: false,
      error: null,
      data: null,
      cacheEnabled: true,
      backgroundRefresh: false,
      queryKey: 'demo-data'
    });
  }

  onCreate() {
    this
      .on('click', '#load', this.loadData)
      .on('click', '#load-cached', this.loadWithCache)
      .on('click', '#invalidate', this.invalidateCache)
      .on('click', '#background-refresh', this.toggleBackgroundRefresh)
      .on('change', '#cache-toggle', (e) => this.setState({ cacheEnabled: e.target.checked }));

    // Auto-load data if cache exists
    this.loadWithCache();
  }

  async loadData() {
    this.setState({ loading: true, error: null });
    try {
      const api = http.withBase('/examples', { timeout: 2000 });
      const data = await api.get('/data.json');
      await new Promise(r => setTimeout(r, 400)); // Simulate delay
      this.setState({ data, loading: false });
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      this.setState({ error: msg, loading: false });
    }
  }

  async loadWithCache() {
    if (!this.state.cacheEnabled) {
      return this.loadData();
    }

    this.setState({ loading: true, error: null });

    try {
      // Use Query cache for network request management
      const data = await Query.fetch(
        this.state.queryKey,
        () => http.withBase('/examples', { timeout: 2000 }).get('/data.json'),
        {
          staleTime: 30000, // Cache for 30 seconds
          cacheTime: 300000, // Keep in memory for 5 minutes
          refetchOnWindowFocus: this.state.backgroundRefresh
        }
      );

      this.setState({ data, loading: false });
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      this.setState({ error: msg, loading: false });
    }
  }

  invalidateCache() {
    Query.invalidate(this.state.queryKey);
    console.log('Cache invalidated for:', this.state.queryKey);
  }

  toggleBackgroundRefresh() {
    this.setState({ backgroundRefresh: !this.state.backgroundRefresh });
    if (this.state.backgroundRefresh) {
      // Start background refresh
      this.startBackgroundRefresh();
    } else {
      // Stop background refresh
      if (this._refreshInterval) {
        clearInterval(this._refreshInterval);
        this._refreshInterval = null;
      }
    }
  }

  startBackgroundRefresh() {
    this._refreshInterval = setInterval(() => {
      if (this.state.cacheEnabled && this.state.backgroundRefresh) {
        Query.refetch(this.state.queryKey);
      }
    }, 10000); // Refresh every 10 seconds
  }

  onUnmount() {
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
    }
    // Note: Query module doesn't have an unsubscribe method
    // The cache is automatically managed by the Query module
  }

  template() {
    return this.html`
      <div style="max-width: 960px; margin: 0 auto; padding: 0.75rem 1rem;">
        <div style="background: white; border-radius: 12px; padding: 1rem 1.25rem; box-shadow: 0 10px 20px rgba(0,0,0,.14), 0 2px 6px rgba(0,0,0,.08); border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <h2 style="margin: 0 0 0.5rem 0; font-size: 1.875rem; font-weight: 600;">Query Cache Demo</h2>
            <p style="margin: 0; color: #6b7280;">Advanced network request management with caching, background refresh, and invalidation</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(1, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Cache Settings</h3>

              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <label style="display: flex; align-items: center; gap: 0.5rem;">
                  <input
                    type="checkbox"
                    id="cache-toggle"
                    ${this.state.cacheEnabled ? 'checked' : ''}
                    style="width: 1rem; height: 1rem;"
                  >
                  <span style="font-size: 0.875rem; color: #374151;">Enable Query Cache</span>
                </label>

                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <button
                    id="background-refresh"
                    style="background: ${this.state.backgroundRefresh ? '#0ea5e9' : 'transparent'}; color: ${this.state.backgroundRefresh ? 'white' : '#6b7280'}; border: 1px solid ${this.state.backgroundRefresh ? '#0ea5e9' : '#d1d5db'}; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.875rem;"
                  >
                    ${this.state.backgroundRefresh ? 'Pause' : 'Start'} Background Refresh
                  </button>
                  <span style="font-size: 0.75rem; color: #9ca3af;">
                    ${this.state.backgroundRefresh ? 'Every 10s' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            <div style="padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Query Actions</h3>

              <div style="display: grid; grid-template-columns: repeat(1, 1fr); gap: 0.5rem;">
                <button
                  id="load-cached"
                  style="background: #0ea5e9; color: white; border: 1px solid #0ea5e9; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;"
                  ${this.state.loading ? 'disabled' : ''}
                >
                  ${this.state.loading ? 'Loading...' : 'Load with Cache'}
                </button>

                <button
                  id="load"
                  style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;"
                  ${this.state.loading ? 'disabled' : ''}
                >
                  Load Fresh
                </button>

                <button
                  id="invalidate"
                  style="background: transparent; color: #6b7280; border: 1px solid #d1d5db; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;"
                >
                  Invalidate Cache
                </button>
              </div>
            </div>
          </div>

          ${this.state.error ? this.html`
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #dc2626;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-weight: 500;">Error:</span>
                <span>${utils.escapeHtml(this.state.error)}</span>
              </div>
            </div>
          ` : ''}

          ${this.state.data ? this.html`
            <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <div style="padding: 0.75rem 1rem; background: #f1f5f9; border-bottom: 1px solid #e5e7eb; font-size: 0.875rem; font-weight: 500; color: #475569;">
                Cached Response Data
                ${this.state.cacheEnabled ? this.html`
                  <span style="margin-left: 0.5rem; font-size: 0.75rem; color: #059669; font-weight: 500;">(Cached)</span>
                ` : ''}
              </div>
              <pre style="margin: 0; padding: 1rem; background: #0f172a; color: #e2e8f0; font-size: 0.875rem; line-height: 1.5; overflow: auto; font-family: ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', monospace;">${utils.escapeHtml(JSON.stringify(this.state.data, null, 2))}</pre>
            </div>
          ` : ''}

          <div style="margin-top: 1.5rem; padding: 1rem; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px;">
            <h4 style="margin: 0 0 0.75rem 0; font-size: 0.875rem; font-weight: 600; color: #0c4a6e;">Query Cache Features</h4>
            <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.875rem; color: #374151; line-height: 1.6;">
              <li><strong>Automatic Caching:</strong> 30s stale time, 5min cache time</li>
              <li><strong>Background Refresh:</strong> Refetch data automatically</li>
              <li><strong>Cache Invalidation:</strong> Manually clear cached data</li>
              <li><strong>Request Deduplication:</strong> Multiple calls use cached result</li>
              <li><strong>Error Recovery:</strong> Cached data shown on network failure</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }
}
