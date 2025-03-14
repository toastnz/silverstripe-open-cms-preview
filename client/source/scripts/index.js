import '../styles/index.scss';

const defaultSrc = 'about:blank';
const previewPanel = document.createElement('div');

let input = null;
let container = null;
let refreshTimeout = null;
let isRefreshing = false;
let mutationCount = [];
let mutationTimeout = null;
let currentURL = '';
let iframe = document.createElement('iframe');

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
    clearTimeout(refreshTimeout);

    refreshTimeout = setTimeout(() => {
      if (!input) return isRefreshing = false;

      // Create a new iframe element
      const newIframe = document.createElement('iframe');

      const onLoad = () => {
        // Get the scroll position of the old iframe
        const scrollY = iframe.contentWindow.scrollY;

        // Set the scroll position of the new iframe
        newIframe.contentWindow.scrollTo(0, scrollY);

        // Remove the old iframe
        iframe.remove();

        // Set the new iframe as the current iframe
        iframe = newIframe;
        // Set isRefreshing to false
        isRefreshing = false;

        // Remove the load event listener
        newIframe.removeEventListener('load', onLoad);
      }

      // Set the new iframe class to the current iframe class
      newIframe.className = iframe.className;
      previewPanel.appendChild(newIframe);

      // When the newIframe is loaded, remove the old iframe and show the new one
      newIframe.addEventListener('load', onLoad);

      // Set the new iframe src to the input value
      newIframe.src = input.value;
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
  // Clear the current URL
  currentURL = '';

  // Remove the preview panel if it exists
  if (document.body.contains(previewPanel)) {
    previewPanel.remove();
  }
}

const VisibleMutationObserver = new IntersectionObserver((entries) => {
  // Loop through each entry and check if it is visible
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      mutationCount.push(entry);
    }

    VisibleMutationObserver.unobserve(entry.target);
  });
});


const Observer = new MutationObserver((mutations) => {
  // Clear the previous timeout
  clearTimeout(mutationTimeout);

  // Set a timeout to reset the mutation count after 1 second
  mutationTimeout = setTimeout(() => {
    // Clear the previous visible mutations
    mutationCount.length = 0;
  }, 50);

  // Check if the input exists
  input = document.querySelector(selectors.input);
  // Check if the container exists
  container = document.querySelector(selectors.container);

  // Loop through each mutation and check for elements that were added (excluding the preview panel)
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== 1) return;
      if (previewPanel.contains(node)) return;

      VisibleMutationObserver.observe(node);
    });
  });

  // Check if there are 3 or more mutations within 50ms
  if (mutationCount.length >= 3 || window.location.href !== currentURL) {

    // Update the current URL
    currentURL = window.location.href;

    // Clear the previous visible mutations
    mutationCount.length = 0;

    console.log('updating preview');
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
