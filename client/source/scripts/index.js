import DomObserverController from 'domobserverjs';

import '../styles/index.scss';

// Create a new observer
const Observer = new DomObserverController;

let input = null;
let previewPanel = null;
let iframe = null;

// Selectors for the input and preview panel elements
const selectors = {
  input: '[name="OpenCMSPreview"]',
  previewPanel: '.cms-preview',
  iframe: '.cms-preview iframe',
}

// const iframeSrcObserver = new MutationObserver(() => {
//   if (!iframe || !input) return;
//   updatePreview();
// });


// Function to update the preview src
function updatePreview() {
  if (iframe.src === input.value || iframe.src.indexOf(input.value) > -1) return;

  // Set the iframe src to the input value
  iframe.src = input.value;
}

function makePreviewResizeable() {
  // We will toggle this to toggle the dragging state
  let isDragging = false;

  // Create a new button element to drag the preview width
  const thumb = document.createElement('button');

  // Add a class
  thumb.classList.add('cms-preview__thumb');

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

function init() {
  // If we dont have an input or iframe, we cant open the preview
  if (!input || !document.body.contains(input)) return;
  if (!iframe || !document.body.contains(iframe)) return;
  if (!previewPanel || !document.body.contains(previewPanel)) return;

  // Update the preview
  makePreviewResizeable();
  updatePreview();
}

// Watch for our input being added to the DOM
Observer.observe(selectors.input, (inputs) => {
  // Update the input var
  input = inputs[0];

  // Initialize the preview
  init();
});

// Watch for the preview panel being added to the DOM
Observer.observe(selectors.previewPanel, (panels) => {
  // If we have an iframe, unoobserve it to start with
  // if (iframe) try { iframeSrcObserver.unobserve(iframe) } catch (e) { }

  // Update the preview panel and iframe vars
  previewPanel = panels[0];
  iframe = document.querySelector(selectors.iframe);

  // Initialize the preview
  init();

  // // Observe the iframe src
  // iframeSrcObserver.observe(iframe, {
  //   attributes: true,
  //   attributeFilter: ['src'],
  // });
});
