import '../styles/index.scss';

class CMSPreviewController {
  constructor() {
    this.defaultSrc = 'about:blank?CMSPreview=1';
    this.previewPanel = document.createElement('div');
    this.input = null;
    this.container = null;
    this.refreshTimeout = null;
    this.refreshDelay = 100;
    this.isRefreshing = false;
    this.iframe = document.createElement('iframe');
    this.cache = {};
    this.selectors = {
      container: '.cms-container',
      input: '[name="OpenCMSPreview"]',
    };

    this.events = {};

    this.init();
  }

  init() {
    this.setupIframe();
    this.setupObserver();
    this.makePreviewResizeable();
  }

  setupIframe() {
    this.iframe.src = this.defaultSrc;
    this.iframe.className = 'open-cms-preview__iframe';
    this.previewPanel.classList.add('open-cms-preview');
    this.previewPanel.appendChild(this.iframe);
  }

  refresh(event = {}) {
    if (this.isRefreshing) return;

    let prevent = false;

    // Halve the delay time because we wait twice
    const delay = this.refreshDelay * 0.5;

    // Wrap the event in a new object
    event = { data: event };

    // Add a prevent refresh function to the event object
    event.preventRefresh = () => prevent = true;

    this.callback('beforeRefresh', event);

    if (prevent) return;

    clearTimeout(this.refreshTimeout);
    this.isRefreshing = true;

    this.refreshTimeout = setTimeout(() => {
      clearTimeout(this.refreshTimeout);
      this.iframe.src = this.defaultSrc;
      this.iframe.classList.add('loading');

      this.refreshTimeout = setTimeout(() => {
        if (!this.input) return this.isRefreshing = false;

        const onLoad = () => {
          this.isRefreshing = false;
          this.iframe.removeEventListener('load', onLoad);
          this.iframe.classList.remove('loading');
          this.callback('refresh', this.input.value);
        };

        this.iframe.addEventListener('load', onLoad);
        this.iframe.src = this.input.value;
      }, delay);
    }, delay);
  }

  addPreview() {
    if (!document.body.contains(this.previewPanel)) {
      this.container.appendChild(this.previewPanel);
      this.refresh();
      this.callback('addPreview', this.previewPanel);
    }
  }

  removePreview() {
    if (document.body.contains(this.previewPanel)) {
      this.previewPanel.remove();
      this.callback('removePreview');
    }
  }

  setupObserver() {
    const observer = new MutationObserver(() => {
      this.input = document.querySelector(this.selectors.input);
      this.container = document.querySelector(this.selectors.container);

      if (this.input && this.container) {
        if (this.cache.input && this.input === this.cache.input && this.cache.container && this.container === this.cache.container) return;

        this.cache.input = this.input;
        this.cache.container = this.container;

        this.addPreview();
      } else {
        this.removePreview();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  makePreviewResizeable() {
    let isDragging = false;
    let width = 0;
    const prevWidth = window.sessionStorage.getItem('cmsPreviewWidth');
    const thumb = document.createElement('button');
    thumb.classList.add('open-cms-preview__thumb');
    this.previewPanel.appendChild(thumb);

    if (prevWidth) {
      document.body.style.setProperty('--preview-width', prevWidth);
    }

    thumb.addEventListener('mousedown', () => {
      isDragging = true;
      this.previewPanel.classList.add('dragging');
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      this.previewPanel.classList.remove('dragging');
      window.sessionStorage.setItem('cmsPreviewWidth', width);
    });

    window.addEventListener('mousemove', (e) => {
      window.requestAnimationFrame(() => {
        if (!isDragging) return;

        const mouseX = (e.clientX - 10);
        width = `${window.innerWidth - mouseX}px`;

        document.body.style.setProperty('--preview-width', width);
      });
    });
  }

  callback(type, data = false) {
    // run the callback functions
    if (this.events[type]) this.events[type].forEach((event) => event(data));
  }

  on(event, func) {
    // If we loaded an event and it's not the on event and we also loaded a function
    if (event && event != 'on' && event != 'callback' && func && typeof func == 'function') {
      if (this.events[event] == undefined) this.events[event] = [];
      // Push a new event to the event array
      this.events[event].push(func);
    }
  }
}

// Create a new instance of the CMSPreviewController and assign it to the window
window.OpenCMSPreviewController = new CMSPreviewController();

// Some default conditions to prevent refresh
const shouldPreventRefresh = (URL, response) => {
  if (!URL) return false;

  // URL based conditions
  if (!URL.pathname.startsWith('/admin')) return true;
  if (URL.pathname.endsWith('/search')) return true;
  if (URL.pathname.endsWith('/ping')) return true;
  if (URL.pathname.endsWith('/SearchForm')) return true;
  if (URL.searchParams.has('search')) return true;

  // If this is a reorder request, allow the refresh regardless of the response
  if (URL.pathname.endsWith('/reorder')) return false;

  if (!response) return false;

  // Commented this as it was preventing the preview from refreshing when saving the site config, and I cannot remember why it was here...
  // // Response based conditions
  // try {
  //   // Try parse the response as JSON, if it fails, prevent refresh
  //   const contentType = response.getResponseHeader("Content-Type");

  //   if (contentType && contentType !== 'application/json') return true;
  // } catch (error) { /* Do nothing */ }

  return false;
}

// Before the refresh event, check if we should prevent the refresh
window.OpenCMSPreviewController.on('beforeRefresh', (event) => {
  const { URL, response } = event.data;

  if (shouldPreventRefresh(URL, response)) return event.preventRefresh();
});


// After any fetch event, call the refresh method
function onAfterFetch(path = '', response) {
  if (!path.startsWith('/')) path = '/' + path;

  const locationURL = new URL(window.location.href);
  const postURL = new URL(locationURL.origin + path);

  window.OpenCMSPreviewController.refresh({ URL: postURL, response });
}

(() => {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._url = url;
    originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function () {
    this.addEventListener('load', () => onAfterFetch(this._url, this));
    originalSend.apply(this, arguments);
  };
})();
