class HTTPError extends Error {
  constructor(message, { status, statusText, url, body }) {
    super(message);
    this.name = 'HTTPError';
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.body = body;
  }
}

const buildUrl = (url, baseURL = '') => {
  if (!baseURL) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (baseURL.endsWith('/') && url.startsWith('/')) return baseURL + url.slice(1);
  if (!baseURL.endsWith('/') && !url.startsWith('/')) return baseURL + '/' + url;
  return baseURL + url;
};

const createClient = ({ baseURL = '', headers: defaultHeaders = {}, timeout: defaultTimeout = 0 } = {}) => {
  return {
    async get(url, options = {}) {
      return this.request(url, { ...options, method: 'GET' });
    },
  
    async post(url, data = null, options = {}) {
      const isFormData = (typeof FormData !== 'undefined') && (data instanceof FormData);
      return this.request(url, { 
        ...options, 
        method: 'POST', 
        body: data == null ? null : (isFormData ? data : JSON.stringify(data)),
        headers: isFormData ? { ...options.headers } : { 'Content-Type': 'application/json', ...options.headers }
      });
    },
  
    async put(url, data = null, options = {}) {
      const isFormData = (typeof FormData !== 'undefined') && (data instanceof FormData);
      return this.request(url, { 
        ...options, 
        method: 'PUT', 
        body: data == null ? null : (isFormData ? data : JSON.stringify(data)),
        headers: isFormData ? { ...options.headers } : { 'Content-Type': 'application/json', ...options.headers }
      });
    },
  
    async delete(url, options = {}) {
      return this.request(url, { ...options, method: 'DELETE' });
    },

    async raw(url, options = {}) {
      return this._fetch(url, options);
    },
  
    async request(url, options = {}) {
      const response = await this._fetch(url, options);
      if (!response.ok) {
        let bodyText;
        try { bodyText = await response.text(); } catch { bodyText = undefined; }
        let message = `HTTP ${response.status} ${response.statusText}`;
        try {
          const maybeJson = bodyText && JSON.parse(bodyText);
          if (maybeJson && maybeJson.message) message += ` - ${maybeJson.message}`;
        } catch {}
        throw new HTTPError(message, { status: response.status, statusText: response.statusText, url: response.url, body: bodyText });
      }
      const contentType = response.headers.get('content-type') || '';
      if (options.responseType === 'text') return await response.text();
      if (options.responseType === 'json' || contentType.includes('application/json')) {
        try { return await response.json(); } catch { return null; }
      }
      return await response.text();
    },

    async _fetch(url, options = {}) {
      const finalUrl = buildUrl(url, baseURL);
      const headers = { ...defaultHeaders, ...(options.headers || {}) };
      const controller = new AbortController();
      const signals = [];
      if (options.signal) signals.push(options.signal);
      const timeout = options.timeout != null ? options.timeout : defaultTimeout;
      let timeoutId;
      if (timeout && typeof timeout === 'number' && timeout > 0) {
        timeoutId = setTimeout(() => controller.abort(new DOMException('Request timeout', 'AbortError')), timeout);
      }
      const onAbort = () => controller.abort();
      signals.forEach(sig => {
        if (sig && typeof sig.addEventListener === 'function') {
          if (sig.aborted) controller.abort(sig.reason);
          else sig.addEventListener('abort', onAbort, { once: true });
        }
      });

      try {
        const res = await fetch(finalUrl, { ...options, headers, signal: controller.signal });
        return res;
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        signals.forEach(sig => {
          if (sig && typeof sig.removeEventListener === 'function') sig.removeEventListener('abort', onAbort);
        });
      }
    },

    withBase(newBaseURL, defaults = {}) {
      return createClient({ baseURL: newBaseURL, headers: { ...defaultHeaders, ...(defaults.headers || {}) }, timeout: defaults.timeout ?? defaultTimeout });
    }
  };
};

export const http = createClient();
export { HTTPError };
