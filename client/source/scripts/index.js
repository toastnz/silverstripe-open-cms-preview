import '../styles/index.scss';

const defaultSrc = 'about:blank?CMSPreview=true';
const previewPanel = document.createElement('div');
const iframe = document.createElement('iframe');

let input = null;
let container = null;
let refreshTimeout = null;
let isRefreshing = false;

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

  clearTimeout(refreshTimeout);

  isRefreshing = true;

  refreshTimeout = setTimeout(() => {
    iframe.src = defaultSrc;

    clearTimeout(refreshTimeout);

    refreshTimeout = setTimeout(() => {
      isRefreshing = false;

      if (!input) return;

      iframe.src = input.value;
    }, 500);
  }, 500);
}

function makePreviewResizeable() {
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
}

function addPreview() {
  if (!document.body.contains(previewPanel)) {
    container.appendChild(previewPanel);
  }

  // Update the preview
  updatePreview();
}

function removePreview() {
  if (document.body.contains(previewPanel)) {
    previewPanel.remove();
  }
}

const Observer = new MutationObserver((mutations) => {
  // Check if the input exists
  input = document.querySelector(selectors.input);
  // Check if the container exists
  container = document.querySelector(selectors.container);

  // If any of the mutations involve added or removed element nodes
  if (mutations.some((mutation) =>
    Array.from(mutation.addedNodes).some(node => node.nodeType === 1) ||
    Array.from(mutation.removedNodes).some(node => node.nodeType === 1)
  )) {
    // Show or hide the preview based on the presence of the input
    (input && container) ? addPreview() : removePreview();
  }
});

// Watch the body for changes
Observer.observe(document.body, {
  childList: true,
  subtree: true,
});

makePreviewResizeable();
