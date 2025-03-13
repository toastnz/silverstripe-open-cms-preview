import '../styles/index.scss';

const defaultSrc = 'about:blank';
const previewPanel = document.createElement('div');

let input = null;
let container = null;
let refreshTimeout = null;
let isRefreshing = false;
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
  if (document.body.contains(previewPanel)) {
    previewPanel.remove();
  }
}

const Observer = new MutationObserver((mutations) => {
  // Check if the input exists
  input = document.querySelector(selectors.input);
  // Check if the container exists
  container = document.querySelector(selectors.container);

  // Array to store added nodes
  const addedNodes = [];

  // Loop through each mutation and check for elements that were added (excluding the preview panel)
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (!previewPanel.contains(node) && node.nodeType === 1) {
        addedNodes.push(node);
      }
    });
  });

  // Check if any nodes were added (excluding the preview panel)
  if (addedNodes.length) {
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


// const defaultSrc = 'about:blank?CMSPreview=true';
// const previewPanel = document.createElement('div');
// const iframe = document.createElement('iframe');

// let input = null;
// let container = null;
// let refreshTimeout = null;
// let isRefreshing = false;

// // Selectors for the input and preview panel elements
// const selectors = {
//   container: '.cms-container',
//   input: '[name="OpenCMSPreview"]',
// }

// // Set up some classes and put the iframe into the preview panel
// iframe.src = defaultSrc;
// iframe.className = 'open-cms-preview__iframe';
// previewPanel.classList.add('open-cms-preview');
// previewPanel.appendChild(iframe);

// // Function to update the preview src
// function updatePreview() {
//   if (isRefreshing) return;

//   clearTimeout(refreshTimeout);

//   isRefreshing = true;

//   refreshTimeout = setTimeout(() => {
//     iframe.src = defaultSrc;

//     clearTimeout(refreshTimeout);

//     refreshTimeout = setTimeout(() => {
//       isRefreshing = false;

//       if (!input) return;

//       iframe.src = input.value;
//     }, 500);
//   }, 500);
// }

// function makePreviewResizeable() {
//   // We will toggle this to toggle the dragging state
//   let isDragging = false;

//   // Create a new button element to drag the preview width
//   const thumb = document.createElement('button');

//   // Add a class
//   thumb.classList.add('open-cms-preview__thumb');

//   // Add the thumb to the preview
//   previewPanel.appendChild(thumb);

//   // Add a mouse down event listener
//   thumb.addEventListener('mousedown', () => {
//     // Set dragging to true
//     isDragging = true;
//     previewPanel.classList.add('dragging');
//   });

//   window.addEventListener('mouseup', () => {
//     // Set dragging to false
//     isDragging = false;
//     previewPanel.classList.remove('dragging');
//   });

//   window.addEventListener('mousemove', (e) => {
//     // Set the width of the preview
//     window.requestAnimationFrame(() => {
//       // If we are not dragging, return
//       if (!isDragging) return;

//       const mouseX = (e.clientX - 10);
//       const width = window.innerWidth - mouseX;

//       document.body.style.setProperty('--preview-width', `${width}px`);
//     });
//   });
// }

// function addPreview() {
//   if (!document.body.contains(previewPanel)) {
//     container.appendChild(previewPanel);
//   }

//   // Update the preview
//   updatePreview();
// }

// function removePreview() {
//   if (document.body.contains(previewPanel)) {
//     previewPanel.remove();
//   }
// }

// const Observer = new MutationObserver((mutations) => {
//   // Check if the input exists
//   input = document.querySelector(selectors.input);
//   // Check if the container exists
//   container = document.querySelector(selectors.container);

//   // If any of the mutations involve added or removed element nodes
//   if (mutations.some((mutation) =>
//     Array.from(mutation.addedNodes).some(node => node.nodeType === 1) ||
//     Array.from(mutation.removedNodes).some(node => node.nodeType === 1)
//   )) {
//     // Show or hide the preview based on the presence of the input
//     (input && container) ? addPreview() : removePreview();
//   }
// });

// // Watch the body for changes
// Observer.observe(document.body, {
//   childList: true,
//   subtree: true,
// });

// makePreviewResizeable();
