import '../styles/index.scss';

const defaultSrc = 'about:blank?CMSPreview=1';
const previewPanel = document.createElement('div');

let input = null;
let container = null;
let refreshTimeout = null;
let isRefreshing = false;
let iframe = document.createElement('iframe');

// Store some vars in a cache
const cache = {};

// Selectors for the input and preview panel elements
const selectors = {
  container: '.cms-container',
  input: '[name="OpenCMSPreview"]',
}

// Set up some classes and put the iframe into the preview panel
iframe.src = defaultSrc;
iframe.className = 'open-cms-preview__iframe';
previewPanel.classList.add('open-cms-preview');
previewPanel.appendChild(iframe);

// Function to update the preview src
function updatePreview() {
  if (isRefreshing) return;

  // Clear the refresh timeout
  clearTimeout(refreshTimeout);

  // We are refreshing so set isRefreshing to true
  isRefreshing = true;

  // Set a timeout to update the iframe src
  refreshTimeout = setTimeout(() => {
    clearTimeout(refreshTimeout);
    // Reset the iframe src
    iframe.src = defaultSrc;
    // Add a loading class to the iframe
    iframe.classList.add('loading');

    // Set a timeout to update the iframe src
    refreshTimeout = setTimeout(() => {
      if (!input) return isRefreshing = false;

      const onLoad = () => {
        // We are no longer refreshing
        isRefreshing = false;

        // Remove the load event listener
        iframe.removeEventListener('load', onLoad);

        // Remove the loading class to the iframe
        iframe.classList.remove('loading');
      }

      // Add a load event listener to the iframe
      iframe.addEventListener('load', onLoad);

      // Set the iframe src to the input value
      iframe.src = input.value;
    }, 100);
  }, 100);
}

function addPreview() {
  if (!document.body.contains(previewPanel)) {
    container.appendChild(previewPanel);

    // Update the preview
    updatePreview();
  }
}

function removePreview() {
  // Remove the preview panel if it exists
  if (document.body.contains(previewPanel)) {
    previewPanel.remove();
  }
}

const Observer = new MutationObserver(() => {
  // Query for the input and container elements
  input = document.querySelector(selectors.input);
  container = document.querySelector(selectors.container);

  // If the input and container are found, add the preview
  if (input && container) {
    // If the input and container are the same as the cache, return
    if (cache.input && input === cache.input && cache.container && container === cache.container) return;

    // Update the cache
    cache.input = input;
    cache.container = container;

    // Add the preview and return
    return addPreview();
  }

  // If the input or container are not found, remove the preview
  removePreview();
});

// Watch the body for changes
Observer.observe(document.body, {
  childList: true,
  subtree: true,
});

function handlePostRequestURL(path = '') {
  // Ensure the path starts with a '/'
  if (!path.startsWith('/')) path = '/' + path;

  // Set up a post request URL variable
  let postURL = null;
  // Grab the current location
  let location = window.location.href;
  let locationURL = new URL(location);
  let postURLParams = null;

  // Remove everything after the host from the location URL and set it as the location
  location = locationURL.protocol + '//' + locationURL.host;

  // Convert the path to a URL object
  postURL = new URL(location + path);

  postURLParams = postURL.searchParams;

  // Ensure the URL is pointing to /admin
  if (!postURL.pathname.startsWith('/admin')) return; // console.log('Not an admin URL:', postURL);

  // If the last segment of the path is '/search', return
  if (postURL.pathname.endsWith('/search')) return; // console.log('Search request URL:', postURL);

  // If any of the URL parameters are 'search', return
  if (postURLParams.has('search')) return; // console.log('Search request URL:', postURL);


  // If we make it this far, update the preview
  updatePreview();
}

(function makePreviewResizeable() {
  // We will toggle this to toggle the dragging state
  let isDragging = false;

  // Create a new button element to drag the preview width
  const thumb = document.createElement('button');

  // Add a class
  thumb.classList.add('open-cms-preview__thumb');

  // Add the thumb to the preview
  previewPanel.appendChild(thumb);

  // Add a mouse down event listener
  thumb.addEventListener('mousedown', () => {
    // Set dragging to true
    isDragging = true;
    previewPanel.classList.add('dragging');
  });

  window.addEventListener('mouseup', () => {
    // Set dragging to false
    isDragging = false;
    previewPanel.classList.remove('dragging');
  });

  window.addEventListener('mousemove', (e) => {
    // Set the width of the preview
    window.requestAnimationFrame(() => {
      // If we are not dragging, return
      if (!isDragging) return;

      const mouseX = (e.clientX - 10);
      const width = window.innerWidth - mouseX;

      document.body.style.setProperty('--preview-width', `${width}px`);
    });
  });
})();

(function () {
  // Override XMLHttpRequest
  var originalOpen = XMLHttpRequest.prototype.open;
  var originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this.addEventListener('load', function () {
      handlePostRequestURL(url);
    });

    originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function () {
    originalSend.apply(this, arguments);
  };

  // Override fetch
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    try {
      const response = await originalFetch.apply(this, args);
      handlePostRequestURL(response.url);
      return response;
    } catch (error) { /* Do nothing */ }
  };

  // jQuery AJAX events
  if (window.jQuery) {
    jQuery(document).ajaxSuccess(function (event, jqxhr, settings) {
      handlePostRequestURL(settings.url);
    });
  }
})();
