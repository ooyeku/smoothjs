// Minimal ESM entry that composes SmoothJS from modular pieces
import { SmoothComponent as Component } from './src/component/SmoothComponent.js';
import { createContext } from './src/component/context.js';
import { SmoothRouter as Router } from './src/router/SmoothRouter.js';
import { createStore, createSelector } from './src/state/createStore.js';
import { createElement, $, $$ } from './src/dom/index.js';
import { http, HTTPError } from './src/net/http.js';
import { utils } from './src/utils/index.js';

// SSR and Data Query layer
import SSR from './src/ssr/index.js';
import { Query } from './src/data/query.js';

// Velvet Design System
import * as Velvet from './src/design-system/index.js';

// Testing utilities
import * as Testing from './src/testing/index.js';

const version = '0.0.0';

const SmoothJS = {
  Component,
  createContext,
  Router,
  createStore,
  createSelector,
  createElement,
  http,
  HTTPError,
  utils,
  $,
  $$,
  version,
  SSR,
  Query,
  Velvet,
  Testing
};

// Expose to window for convenience in browsers
if (typeof window !== 'undefined') {
  window.SmoothJS = SmoothJS;
}

export { Component, createContext, Router, createStore, createSelector, createElement, http, HTTPError, utils, $, $$, version, SSR, Query, Velvet, Testing };
export default SmoothJS;