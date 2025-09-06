// Minimal ESM entry that composes SmoothJS from modular pieces
import { createContext } from './src/component/context.js';
import { SmoothRouter as Router } from './src/router/SmoothRouter.js';
import { createStore, createSelector } from './src/state/createStore.js';
import { createElement, $, $$ } from './src/dom/index.js';
import { http, HTTPError } from './src/net/http.js';
import { utils } from './src/utils/index.js';
import { SmoothComponent as Component } from './src/component/SmoothComponent.js';

// Functional components
import { defineComponent } from './src/functional/defineComponent.js';

// SSR and Data Query layer
import SSR from './src/ssr/index.js';
import { Query } from './src/data/query.js';

// DevTools
import DevTools from './src/devtools/index.js';

// A11y utilities
import * as A11y from './src/a11y/index.js';

// Velvet Design System
import * as Velvet from './src/design-system/index.js';

// Testing utilities
import * as Testing from './src/testing/index.js';

// Security and Forms
import * as Security from './src/security/index.js';
import * as Forms from './src/forms/index.js';
// UI components (built-ins)
import { Button } from './src/component/ui/index.js';
import { TextField } from './src/component/ui/index.js';
import { Modal } from './src/component/ui/index.js';

const version = '1.0.0';

const SmoothJS = {
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
  defineComponent,
  SSR,
  Query,
  DevTools,
  A11y,
  Velvet,
  Testing,
  Security,
  Forms,
  Button,
  TextField,
  Modal,
  Component
};

// Expose to window for convenience in browsers
if (typeof window !== 'undefined') {
  window.SmoothJS = SmoothJS;
}

export { createContext, Router, createStore, createSelector, createElement, http, HTTPError, utils, $, $$, version, defineComponent, SSR, Query, DevTools, A11y, Velvet, Testing, Security, Forms, Button, TextField, Modal, Component };
export default SmoothJS;