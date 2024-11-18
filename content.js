// content.js
console.log('Content script loaded');

function injectJQuery(callback) {
  const script = document.createElement('script');
  script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
  script.onload = callback;
  document.head.appendChild(script);
}

function injectBootstrap(callback) {
  // Inject Bootstrap CSS
  const bootstrapCSS = document.createElement('link');
  bootstrapCSS.rel = 'stylesheet';
  bootstrapCSS.href = 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css';
  document.head.appendChild(bootstrapCSS);

  // Inject Popper.js (required by Bootstrap)
  const popperJS = document.createElement('script');
  popperJS.src = 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.1/umd/popper.min.js';
  popperJS.onload = () => {
    // Inject Bootstrap JS after Popper.js is loaded
    const bootstrapJS = document.createElement('script');
    bootstrapJS.src = 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js';
    bootstrapJS.onload = () => {
      console.log('Bootstrap JS loaded');
      callback();
    };
    document.body.appendChild(bootstrapJS);
  };
  document.body.appendChild(popperJS);
}

function injectModalHTML() {
  const modalHTML = `
    <!-- Modal -->
    <div class="modal fade" id="knowledgeCardModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 90%; height: 90%;">
        <div class="modal-content" style="height: 100%;">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Author Knowledge Card</h5>
            <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body" style="flex: 1; overflow: auto;">
            <div class="embed-responsive embed-responsive-16by9" style="height: 100%;">
              <iframe class="embed-responsive-item" id="knowledgeCardIframe" allowfullscreen style="height: 100%;"></iframe>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  console.log('Modal HTML injected');
}

function initializeModalEvents() {
  const modal = document.getElementById('knowledgeCardModal');
  const iframe = document.getElementById('knowledgeCardIframe');

  if (modal && iframe) {
    console.log('Modal and iframe elements found');

    modal.addEventListener('show.bs.modal', function (event) {
      const button = event.relatedTarget; // Button that triggered the modal
      if (!button) {
        console.error('Button that triggered the modal not found');
        return;
      }
      console.log('Button that triggered the modal:', button); // Log the button
      const url = button.getAttribute('data-preview-url'); // Extract from data-* attributes
      console.log('Modal shown, loading URL:', url); // Log the URL
      iframe.setAttribute('src', ''); // Clear iframe
      iframe.setAttribute('src', url + '?t=' + new Date().getTime()); // Update the iframe src with timestamp
    });

    modal.addEventListener('hidden.bs.modal', function () {
      console.log('Modal hidden, clearing iframe src');
      iframe.setAttribute('src', ''); // Clear the iframe src
    });
  } else {
    console.error('Modal or iframe element not found');
  }
}

function rewriteHTML(apiData) {
  console.log('rewriteHTML function called with data:', apiData);

  // Check if qid is null or the string "null"
  if (!apiData.qid || apiData.qid === "null") {
    console.error('qid is null or "null", not creating button');
    return;
  }

  // Check if the button already exists
  if (document.querySelector('button[data-preview-url="https://id.bibframe.app/entity/' + apiData.qid + '"]')) {
    console.log('Button already exists');
    return;
  }

  // Create the new button element
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-secondary mt-3 mb-3';
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#knowledgeCardModal');
  button.setAttribute('data-preview-url', `https://id.bibframe.app/entity/${apiData.qid}`);
  button.textContent = 'View Author Knowledge Card';

  // Add event listener to the button to set the iframe URL
  button.addEventListener('click', function() {
    const iframe = document.getElementById('knowledgeCardIframe');
    const url = button.getAttribute('data-preview-url');
    console.log('Button clicked, loading URL:', url);
    iframe.setAttribute('src', url + '?t=' + new Date().getTime());
  });

  // Find the target <a> element and insert the new button after it
  const targetLink = document.querySelector('a.btn.btn-success[data-controller="request-button"]');
  if (targetLink) {
    targetLink.insertAdjacentElement('afterend', button);
    console.log('Button inserted');
  } else {
    console.error('Target link not found');
  }
}

// Function to observe DOM changes
function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        // Check if the document element with the mmsid is added
        const documentElement = document.querySelector('div#document[data-document-id]');
        if (documentElement) {
          console.log('Document element added to the DOM');
          const mmsid = documentElement.getAttribute('data-document-id');
          console.log('Extracted mmsid:', mmsid);

          // Send a message to the background script with the extracted mmsid
          browser.runtime.sendMessage({ action: 'fetchData', id: mmsid });
          console.log('Message sent to background script with mmsid:', mmsid);

          observer.disconnect(); // Stop observing after the element is found
        }
      }
    });
  });

  // Start observing the document for changes
  observer.observe(document.body, { childList: true, subtree: true });
}

// Function to listen for messages from the background script
function listenForMessages() {
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'rewriteHTML') {
      console.log('Message received from background script:', message);
      rewriteHTML(message.data);
    }
  });
}

// Main function to initialize the content script
function initializeContentScript() {
  injectModalHTML();
  injectJQuery(() => {
    injectBootstrap(() => {
      initializeModalEvents();
    });
  });
  observeDOMChanges();
  listenForMessages();
}

// Initialize the content script
initializeContentScript();