// TypeScript type declarations for SmoothJS

export type Dict<T = any> = { [key: string]: T };

export interface MountOptions<P = any, S = any> {
  props?: P;
  state?: Partial<S> | any;
  children?: any[];
}

export interface ComponentLike<P = any> {
  element: Element | null;
  html(strings: TemplateStringsArray, ...values: any[]): string;
  mount(selector: string | Element, options?: MountOptions<P, any>): this;
  hydrate(selector: string | Element, options?: MountOptions<P, any>): this;
  unmount(): void;
  find<T extends Element = Element>(selector: string): T | null;
  findAll<T extends Element = Element>(selector: string): T[];
}

// Class-based Component (runtime alias of SmoothComponent)
export class Component<P = any, S = any> implements ComponentLike<P> {
  constructor(element?: Element | null, initialState?: S, props?: P);
  element: Element | null;
  state: S;
  props: P;

  // Lifecycle hooks
  onCreate(): void;
  onMount(): void;
  onUnmount(): void;
  onStateChange(prevState: S, newState: S): void;
  onPropsChange(prevProps: P, newProps: P): void;

  // Core methods
  html(strings: TemplateStringsArray, ...values: any[]): string;
  template(): any;
  render(): void;
  mount(selector: string | Element, options?: MountOptions<P, S>): this;
  hydrate(selector: string | Element, options?: MountOptions<P, S>): this;
  unmount(): void;
  find<T extends Element = Element>(selector: string): T | null;
  findAll<T extends Element = Element>(selector: string): T[];

  // State/props and events
  setState(partial: Partial<S> | ((prev: S) => Partial<S>)): void;
  setProps(next: Partial<P> | ((prev: P) => Partial<P>)): void;
  on(event: string, selectorOrHandler: string | ((e: Event) => void), handler?: (e: Event) => void): void;
  off(event?: string, selectorOrHandler?: string | ((e: Event) => void), handler?: (e: Event) => void): void;
  emit<T = any>(target: Element, type: string, init?: CustomEventInit<T>): void;

  // Context API
  provideContext<T>(Context: symbol, value: T): void;
  useContext<T>(Context: symbol): T | undefined;

  // Utilities
  portal(target: string | Element, content: any, key?: string): void;
}

export interface RouterBeforeEach {
  (to: string, from: string | null): boolean | void | string | Promise<boolean | void | string>;
}

export interface RouterOptions {
  mode?: 'hash' | 'history';
  root?: string | Element;
  notFound?: new () => ComponentLike<any>;
  beforeEach?: RouterBeforeEach;
}

export type RouteTarget =
  | (new () => ComponentLike<any>)
  | (() => Promise<any>)
  | { component?: new () => ComponentLike<any>; load?: () => Promise<any>; children?: Array<{ path: string; component?: new () => ComponentLike<any>; load?: () => Promise<any>; }>; };

export class Router {
  constructor(options?: RouterOptions);
  route(path: string, target: RouteTarget): this;
  link(to: string, label: string, options?: { exact?: boolean; activeClass?: string; attrs?: string }): string;
  navigate(path: string, opts?: { replace?: boolean }): Promise<void>;
  start(): void;
  onChange(cb: (path: string) => void): () => void;
  destroy(): void;
}

export interface Store<T extends object = Dict> {
  getState(): T;
  setState(update: Partial<T> | ((prev: T) => Partial<T>)): void;
  replaceState(next: T): void;
  reset(): void;
  subscribe(listener: (state: T) => void): () => void;
  select<U>(selector: (state: T) => U, onChange?: (value: U) => void, isEqual?: ((a: U, b: U) => boolean) | 'shallow'): () => void;
}

export function createStore<T extends object = Dict>(initialState?: T): Store<T>;

export type Selector<T, A extends any[], R> = (state: T, ...args: A) => R;
export function createSelector<A extends any[], R>(...funcs: [...selectors: Array<(...args: any[]) => any>, resultFn: (...args: any[]) => R]): (...args: any[]) => R;

export interface HttpClientOptions {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  responseType?: 'text' | 'json';
  signal?: AbortSignal;
}

export interface HttpClient {
  get<T = any>(url: string, options?: RequestOptions): Promise<T>;
  post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>;
  put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>;
  delete<T = any>(url: string, options?: RequestOptions): Promise<T>;
  raw(url: string, options?: RequestOptions): Promise<Response>;
  request<T = any>(url: string, options?: RequestOptions & { method?: string; body?: any }): Promise<T>;
  withBase(baseURL: string, defaults?: Omit<HttpClientOptions, 'baseURL'>): HttpClient;
}

export class HTTPError extends Error {
  constructor(message: string, info: { status: number; statusText: string; url: string; body?: any });
  status: number;
  statusText: string;
  url: string;
  body?: any;
}

export const http: HttpClient;

export function $(selector: string): Element | null;
export function $$(selector: string): Element[];
export function createElement<K extends keyof HTMLElementTagNameMap>(tag: K, props?: any, ...children: any[]): HTMLElementTagNameMap[K];

export namespace utils {
  const isBrowser: boolean;
  function ready(callback: () => void): void;
  function batch<T>(fn: () => T): T;
  function debounce<F extends (...args: any[]) => any>(fn: F, wait: number): (...args: Parameters<F>) => void;
  function throttle<F extends (...args: any[]) => any>(fn: F, limit: number): (...args: Parameters<F>) => void;
  function escapeHtml(text: any): string;
  namespace formatters {
    function currency(amount: number, currency?: string): string;
    function date(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string;
    function number(num: number): string;
  }
}

export const version: string;

// SSR utilities
export const SSR: {
  renderToString(
    ComponentClass: new (...args: any[]) => ComponentLike<any>,
    options?: { props?: any; state?: any; containerId?: string | null }
  ): string;
};

// Query/cache layer
export type QuerySnapshot<T = any> = { data: T | undefined; error: any; updatedAt: number };
export interface QueryClient {
  getData<T = any>(key: string): T | undefined;
  setData<T = any>(key: string, updater: T | ((prev: T | undefined) => T)): T;
  subscribe<T = any>(key: string, listener: (snapshot: QuerySnapshot<T>) => void): () => void;
  fetch<T = any>(
    key: string,
    fetcher?: () => Promise<T>,
    options?: {
      staleTime?: number;
      force?: boolean;
      cacheTime?: number;
      tags?: string[];
      swr?: boolean;
      refetchOnWindowFocus?: boolean;
      refetchOnReconnect?: boolean;
    }
  ): Promise<T>;
  refetch<T = any>(key: string): Promise<T>;
  invalidate(key: string): void;
  invalidateTag(tag: string): void;
  mutate<T = any, R = any>(
    key: string,
    mutationFn: () => Promise<R>,
    options?: {
      optimisticData?: T | ((prev: T | undefined) => T);
      rollbackOnError?: boolean;
      invalidateKeys?: string[];
      invalidateTags?: string[];
    }
  ): Promise<T | R>;
  remove(key: string): void;
}
export const Query: QueryClient;

// Velvet: loose typings mapped to runtime object
export const Velvet: any;

// A11y utilities
export const A11y: {
  focusTrap(container: Element | string): () => void;
  announce(message: any, options?: { politeness?: 'polite' | 'assertive'; timeout?: number }): void;
  createSkipLink(target?: string, opts?: { text?: string }): Element | null;
  aria(el: Element | null, attrs?: Record<string, any>): void;
};

// Testing utilities
export const Testing: {
  mount<T extends new (...args: any[]) => ComponentLike<any>>(Comp: T, options?: { props?: any; state?: any; container?: Element | null }): { instance: InstanceType<T>; container: Element; unmount: () => void };
  render(html?: string): { container: Element; unmount: () => void };
  fire(target: Element | null, type: string, init?: any): boolean;
  wait(ms?: number): Promise<void>;
  tick(): Promise<void>;
  waitFor(predicate: () => any, options?: { timeout?: number; interval?: number }): Promise<boolean>;
  act<T = any>(fnOrPromise: (() => T) | Promise<T>): Promise<T>;
  getByTestId(container: Element, testId: string): Element | null;
  getAllByTestId(container: Element, testId: string): Element[];
};

// Security utilities
export const Security: {
  sanitize(html: any, options?: { allowTags?: string[]; allowAttrs?: Record<string, string[]> }): string;
  configureSanitizer(fn?: (html: any, options?: any) => string): void;
};

// Forms helpers
export namespace Forms {
  function createForm<TValues extends Record<string, any> = any>(
    initialValues?: TValues,
    validators?: Partial<Record<keyof TValues, (value: any, values: TValues) => string | void>>
  ): {
    readonly values: TValues;
    readonly errors: Partial<Record<keyof TValues, string>>;
    readonly touched: Partial<Record<keyof TValues, boolean>>;
    readonly dirty: boolean;
    readonly submitted: boolean;
    setField(name: keyof TValues, value: any): void;
    setValues(patch: Partial<TValues> | ((prev: TValues) => Partial<TValues>)): void;
    validate(): boolean;
    reset(nextInitial?: TValues): void;
    handleChange(e: any): void;
    handleBlur(e: any): void;
    handleSubmit(
      onValid?: (values: TValues) => any,
      onInvalid?: (errors: Partial<Record<keyof TValues, string>>, values: TValues) => any
    ): (e?: any) => Promise<any>;
  };
}

// DevTools
export const DevTools: {
  enableOverlay(): void;
  disableOverlay(): void;
  setDebug(v: boolean): void;
  time<T>(label: string, fn: () => T): T;
};

// Default export namespace
declare const SmoothJS: {
  Router: typeof Router;
  createStore: typeof createStore;
  createSelector: typeof createSelector;
  createElement: typeof createElement;
  http: typeof http;
  HTTPError: typeof HTTPError;
  utils: typeof utils;
  $: typeof $;
  $$: typeof $$;
  version: string;
  defineComponent: typeof defineComponent;
  SSR: typeof SSR;
  Query: typeof Query;
  DevTools: typeof DevTools;
  A11y: typeof A11y;
  Velvet: typeof Velvet;
  Testing: typeof Testing;
  Security: typeof Security;
  Forms: typeof Forms;
  Component: typeof Component;
};
export default SmoothJS;


// Functional components
export interface FunctionalSetupContext<P = any> {
  // Hooks
  useState<T>(initial: T | (() => T)): [T, (next: T | ((prev: T) => T)) => void];
  useRef<T = any>(initial?: T): { current: T };
  useMemo<T>(factory: () => T, deps?: any[]): T;
  useEffect(effect: () => void | (() => void), deps?: any[]): void;
  // Data
  useQuery<T = any>(key: string, fetcher?: () => Promise<T>, options?: any): [T, { data: T; error: any; updatedAt: number; refetch: () => Promise<any>; invalidate: () => void; remove: () => void; invalidateTag: (tag: string) => void }];
  // Utilities
  html(strings: TemplateStringsArray, ...values: any[]): string;
  portal(target: string | Element, content: any, key?: string): any;
  provideContext(Context: any, value: any): void;
  useContext<T = any>(Context: any): T;
  on(event: string, selector: string | ((e: Event) => any), handler?: (e: Event) => any): any;
  // Accessors
  readonly props: P;
  readonly children: any[];
  readonly element: Element | null;
  find<T extends Element = Element>(selector: string): T | null;
  findAll<T extends Element = Element>(selector: string): T[];
}

export interface FunctionalSetupResult<P = any> {
  render: (ctx?: FunctionalSetupContext<P>) => string | Node | null | undefined;
  onMount?(): void;
  onUnmount?(): void;
  onPropsChange?(prev: P, next: P): void;
  onError?(err: unknown): void;
}

export function defineComponent<P = any>(setup: (ctx: FunctionalSetupContext<P>) => FunctionalSetupResult<P>): new (
  element?: Element | string | null,
  initialState?: any,
  props?: Partial<P>
) => ComponentLike<P>;
