/**
 * Represents an HTTP error that occurs during a request.
 * Extends the built-in JavaScript `Error` object to include additional details
 * about the HTTP response that caused the error.
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
 * Constructs a full URL by combining a base URL with a relative or absolute URL.
 * If the provided URL is already absolute (starts with "http" or "https"), it will be returned as is.
 * Handles cases where slashes at the boundaries of the base URL and the input URL may overlap.
 *
 * @param {string} url - The input URL, which may be absolute or relative.
 * @param {string} [baseURL=''] - The base URL to combine with the input URL. Defaults to an empty string.
 * @returns {string} - The constructed full URL.
 */
const buildUrl = (url, baseURL = '') => {
  if (!baseURL) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (baseURL.endsWith('/') && url.startsWith('/')) return baseURL + url.slice(1);
  if (!baseURL.endsWith('/') && !url.startsWith('/')) return baseURL + '/' + url;
  return baseURL + url;
};

/**
 * Creates an HTTP client instance for making requests with customizable settings.
 *
 * @param {object} [config={}] - Optional configuration for the client.
 * @param {string} [config.baseURL=''] - The base URL to prefix all request URLs.
 * @param {object} [config.headers={}] - Default headers to include in all requests.
 * @param {number} [config.timeout=0] - Default timeout in milliseconds for all requests.
 * @returns {object} A client instance with methods for making HTTP requests, including:
 *                   `get`, `post`, `put`, `delete`, `raw`, `request`, and `withBase`.
 *
 * @property {function} get - Performs a GET request to the specified URL.
 * @property {function} post - Performs a POST request to the specified URL with optional body data.
 * @property {function} put - Performs a PUT request to the specified URL with optional body data.
 * @property {function} delete - Performs a DELETE request to the specified URL.
 * @property {function} raw - Performs a request without error checking, returning the raw response.
 * @property {function} request - A general-purpose method for making HTTP requests, supporting custom options and error handling.
 * @property {function} withBase - Creates a new client instance with a specific base URL and optional default settings.
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
 * The `http` variable represents an HTTP client instance created using the `createClient` function.
 * It is used to initiate and manage HTTP requests and responses.
 *
 * The object provides methods and properties for making HTTP calls, handling request configurations,
 * and processing server responses. It acts as an interface for communication between
 * a client application and a remote server over the HTTP protocol.
 *
 * Common use cases include sending GET, POST, PUT, DELETE, and other HTTP requests
 * as part of client-server interactions.
 */
export const http = createClient();
export { HTTPError };
