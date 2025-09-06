/**
 * Represents an HTTP error that extends the built-in Error class.
 * This error is typically used to encapsulate additional details about
 * failed HTTP requests, such as status code, status text, URL, and response body.
 */
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

/**
 * Constructs a full URL by combining a base URL and a relative or absolute URL.
 * If the provided URL is already an absolute URL (starts with 'http://' or 'https://'),
 * it will be returned as is. Otherwise, it concatenates the base URL with the provided URL,
 * ensuring the correct use of slashes between the two components.
 *
 * @param {string} url - The URL to be resolved. It can be either relative or absolute.
 * @param {string} [baseURL=''] - The base URL to resolve the relative URL against. Defaults to an empty string.
 * @returns {string} The constructed full URL or the original absolute URL if provided.
 */
const buildUrl = (url, baseURL = '') => {
  if (!baseURL) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (baseURL.endsWith('/') && url.startsWith('/')) return baseURL + url.slice(1);
  if (!baseURL.endsWith('/') && !url.startsWith('/')) return baseURL + '/' + url;
  return baseURL + url;
};

/**
 * Creates a client for making HTTP requests with configurable settings.
 *
 * @param {Object} [config={}] - Configuration object for the client.
 * @param {string} [config.baseURL=''] - The base URL for all requests made by the client.
 * @param {Object} [config.headers={}] - Default headers to include with every request.
 * @param {number} [config.timeout=0] - Default timeout in milliseconds for all requests.
 * @returns {Object} An API client object with methods for making HTTP requests.
 *
 * Methods available on the returned client:
 * - `get(url, options)`: Sends a GET request.
 * - `post(url, data, options)`: Sends a POST request with optional data.
 * - `put(url, data, options)`: Sends a PUT request with optional data.
 * - `delete(url, options)`: Sends a DELETE request.
 * - `raw(url, options)`: Sends a request and returns the raw fetch response.
 * - `request(url, options)`: Sends a request with error handling and flexible response type handling.
 * - `_fetch(url, options)`: Internal method for sending raw fetch requests, handling headers, timeout, and abort signals.
 * - `withBase(newBaseURL, defaults)`: Creates a new client instance with a different base URL and optional default settings.
 */
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

/**
 * Represents an instance of an HTTP client used for making requests.
 * The `http` object can be utilized to send and receive data over HTTP.
 * It is created using the `createClient` function.
 */
export const http = createClient();
export { HTTPError };
