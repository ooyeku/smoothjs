// TypeScript type declarations for SmoothJS

export type Dict<T = any> = { [key: string]: T };

export interface MountOptions<P = any, S = any> {
  props?: P;
  state?: Partial<S> | any;
  children?: any[];
}

export class Component<S = any, P = any> {
  constructor(element?: Element | string | null, initialState?: Partial<S>, props?: Partial<P>);
  element: Element | null;
  state: S;
  props: P;
  children: any[];
  // Lifecycle hooks
  onCreate(): void;
  onMount(): void;
  onUnmount(): void;
  onStateChange(prev: S, next: S): void;
  onPropsChange(prev: P, next: P): void;
  onError?(error: unknown): void;
  renderError?(error: unknown): string | Node | null | undefined;
  // Update helpers
  static batch<T>(fn: () => T): T;
  setChildren(children: any | any[]): void;
  setState(update: Partial<S> | ((prev: S) => Partial<S>)): void;
  setProps(update: Partial<P> | ((prev: P) => Partial<P>)): void;
  template(): string | Node;
  html(strings: TemplateStringsArray, ...values: any[]): string;
  bindEvents(): void;
  on(event: string, selector: string, handler: (e: Event) => any): this;
  on(event: string, handler: (e: Event) => any): this;
  off(event: string, selector?: string): this;
  mount(selector: string | Element, options?: MountOptions<P>): this;
  hydrate(selector: string | Element, options?: MountOptions<P>): this;
  unmount(): void;
  find<T extends Element = Element>(selector: string): T | null;
  findAll<T extends Element = Element>(selector: string): T[];
}

export interface RouterBeforeEach {
  (to: string, from: string | null): boolean | void | string | Promise<boolean | void | string>;
}

export interface RouterOptions {
  mode?: 'hash' | 'history';
  root?: string | Element;
  notFound?: new () => Component<any, any>;
  beforeEach?: RouterBeforeEach;
}

export type RouteTarget =
  | (new () => Component<any, any>)
  | (() => Promise<any>)
  | { component?: new () => Component<any, any>; load?: () => Promise<any>; children?: Array<{ path: string; component?: new () => Component<any, any>; load?: () => Promise<any>; }>; };

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
    ComponentClass: new (...args: any[]) => Component<any, any>,
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

// Testing utilities
export const Testing: {
  mount<T extends new (...args: any[]) => Component<any, any>>(Comp: T, options?: { props?: ConstructorParameters<T>[2]; state?: any; container?: Element | null }): { instance: InstanceType<T>; container: Element; unmount: () => void };
  render(html?: string): { container: Element; unmount: () => void };
  fire(target: Element | null, type: string, init?: any): boolean;
  wait(ms?: number): Promise<void>;
  tick(): Promise<void>;
  getByTestId(container: Element, testId: string): Element | null;
  getAllByTestId(container: Element, testId: string): Element[];
};

// DevTools
export const DevTools: {
  enableOverlay(): void;
  disableOverlay(): void;
  setDebug(v: boolean): void;
  time<T>(label: string, fn: () => T): T;
};

// Default export namespace
declare const SmoothJS: {
  Component: typeof Component;
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
  SSR: typeof SSR;
  Query: typeof Query;
  DevTools: typeof DevTools;
  Velvet: typeof Velvet;
  Testing: typeof Testing;
};
export default SmoothJS;
