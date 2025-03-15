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

    // Halve the delay time because we wait twice
    const delay = this.refreshDelay * 0.5;

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

    // Make sure the event is an object, if it is not, wrap it in an object
    if (typeof event !== 'object') event = { data: event };

    // Add a prevent refresh function to the event object
    event.preventRefresh = () => {
      this.isRefreshing = false;
      clearTimeout(this.refreshTimeout);
    }

    this.callback('beforeRefresh', event);
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
    const thumb = document.createElement('button');
    thumb.classList.add('open-cms-preview__thumb');
    this.previewPanel.appendChild(thumb);

    thumb.addEventListener('mousedown', () => {
      isDragging = true;
      this.previewPanel.classList.add('dragging');
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      this.previewPanel.classList.remove('dragging');
    });

    window.addEventListener('mousemove', (e) => {
      window.requestAnimationFrame(() => {
        if (!isDragging) return;

        const mouseX = (e.clientX - 10);
        const width = window.innerWidth - mouseX;

        document.body.style.setProperty('--preview-width', `${width}px`);
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

function onAfterFetch(path = '', response) {
  if (!path.startsWith('/')) path = '/' + path;

  const locationURL = new URL(window.location.href);
  const postURL = new URL(locationURL.origin + path);

  if (!postURL.pathname.startsWith('/admin') || postURL.pathname.endsWith('/search') || postURL.searchParams.has('search')) {
    return;
  }

  window.OpenCMSPreviewController.refresh({ path, response });
}

(() => {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this.addEventListener('load', () => onAfterFetch(url));
    originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function () {
    originalSend.apply(this, arguments);
  };

  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    try {
      const response = await originalFetch.apply(this, args);
      onAfterFetch(args[0], response); // Call onAfterFetch with path and response
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  // jQuery AJAX events
  if (window.jQuery) {
    window.$ = jQuery;

    $(document).ajaxSuccess(function (event, jqxhr, settings) {
      onAfterFetch(settings.url, jqxhr); // Call onAfterFetch with path and response
    });

    $(document).ajaxError(function (event, jqxhr, settings, thrownError) {
      console.error("jQuery AJAX request failed", settings, thrownError);
    });
  }
})();
