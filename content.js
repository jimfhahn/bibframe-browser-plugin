// content.js
console.log('Content script loaded');

// Function to extract the mmsid from the URL
function extractMmsidFromUrl() {
  const url = window.location.href;
  const match = url.match(/catalog\/(\d+)/);
  return match ? match[1] : null;
}

// Function to initialize the app
function initializeApp() {
  console.log('Initializing app...');

  // Remove existing app div if any
  const existingAppDiv = document.getElementById('bibframinator-app');
  if (existingAppDiv) {
    existingAppDiv.remove();
  }

  // Create a unique div for the app
  const appDiv = document.createElement('div');
  appDiv.id = 'bibframinator-app';
  document.body.appendChild(appDiv);

  // Inject the modal HTML
  injectModalHTML();

  // Initialize the Vue app
  new Vue({
    el: '#bibframinator-app',
    data: {
      apiData: null,
      mmsid: null,
    },
    methods: {
      fetchData() {
        const apiUrl = `https://id.bibframe.app/app/mmsid/${this.mmsid}`;
        console.log('Fetching data from API:', apiUrl);
        fetch(apiUrl)
          .then((response) => {
            console.log('API response received:', response);
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then((data) => {
            console.log('Fetched data:', data);
            this.apiData = data;
          })
          .catch((error) => console.error('Error fetching data:', error));
      },
      insertButton() {
        if (this.apiData && this.apiData.qid && this.apiData.qid !== 'null') {
          // Check if the button already exists
          const existingButton = document.querySelector(
            `button[data-preview-url="https://id.bibframe.app/entity/${this.apiData.qid}"]`
          );
          if (existingButton) {
            console.log('Button already exists');
            return;
          }
      
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'btn btn-secondary'; // Removed mt-3 mb-3 classes
          button.setAttribute('data-toggle', 'modal');
          button.setAttribute('data-target', '#knowledgeCardModal');
          button.title = `Author/Creator Knowledge Card: works, biographical information, and more`;
          button.setAttribute('data-preview-url', `https://id.bibframe.app/entity/${this.apiData.qid}`);
          button.textContent = `Author/Creator Knowledge Card`;
      
          // Find the existing button and insert the new button below it
          const existingButtonElement = document.querySelector('.btn.btn-success'); // Target the existing button with class 'btn btn-success'
          if (existingButtonElement) {
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'mt-2'; // Add some margin-top for spacing
            buttonContainer.appendChild(button);
            existingButtonElement.insertAdjacentElement('afterend', buttonContainer);
            console.log('Button inserted below the existing button');
          } else {
            console.error('Existing button element not found');
          }
      
          // Add event listener to the button to set the iframe URL
          button.addEventListener('click', () => {
            const iframe = document.getElementById('knowledgeCardIframe');
            const url = button.getAttribute('data-preview-url');
            console.log('Button clicked, loading URL:', url);
            iframe.setAttribute('src', url + '?t=' + new Date().getTime());
          });
        } else {
          console.log('qid is null or undefined, not displaying the button');
        }
      },
    },
    mounted() {
      console.log('Vue app mounted');

      const mmsid = extractMmsidFromUrl();
      if (mmsid) {
        console.log('Extracted mmsid from URL:', mmsid);
        this.mmsid = mmsid;
        this.fetchData();
      } else {
        console.log('Failed to extract mmsid from URL');
      }
    },
    watch: {
      apiData(newData) {
        if (newData) {
          console.log('apiData updated, inserting button');
          this.insertButton();
        }
      },
    },
  });

  // Initialize the modal events
  initializeModalEvents();
}

// Function to inject the modal HTML
function injectModalHTML() {
  if (document.getElementById('knowledgeCardModal')) {
    console.log('Modal HTML already injected');
    return;
  }
  const modalHTML = `
    <!-- Modal -->
    <div class="modal fade" id="knowledgeCardModal" tabindex="-1" role="dialog" aria-labelledby="knowledgeCardModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document" style="max-width: 90%; height: 90%;">
        <div class="modal-content" style="height: 100%;">
          <div class="modal-header">
            <h5 class="modal-title" id="knowledgeCardModalLabel">Author/Creator Knowledge Card</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body" style="flex: 1; overflow: auto;">
            <iframe id="knowledgeCardIframe" allowfullscreen style="width: 100%; height: 100%; border: none;"></iframe>
          </div>
          <div class="modal-footer">
            <p>Powered by <a href="https://www.svde.org/" target="_blank">Share-VDE</a> and <a href="https://www.wikidata.org/" target="_blank">Wikidata</a></p>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  console.log('Modal HTML injected');
}

// Function to initialize modal events
function initializeModalEvents() {
  const modal = $('#knowledgeCardModal');

  // When the modal is shown
  modal.on('show.bs.modal', function (event) {
    const button = $(event.relatedTarget); // Button that triggered the modal
    const url = button.data('preview-url');
    const iframe = document.getElementById('knowledgeCardIframe');
    console.log('Modal shown, loading URL:', url);
    iframe.src = url + '?t=' + new Date().getTime();
  });

  // When the modal is closed
  modal.on('hidden.bs.modal', function () {
    const iframe = document.getElementById('knowledgeCardIframe');
    console.log('Modal hidden, clearing iframe src');
    iframe.src = '';
  });
}

// Initialize the app when the content script runs
initializeApp();

// Detect URL changes and re-initialize the app
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    console.log('URL changed from', lastUrl, 'to', url);
    lastUrl = url;
    initializeApp();
  }
}).observe(document, { subtree: true, childList: true });

// Monkey-patch history methods to detect URL changes
(function (history) {
  const pushState = history.pushState;
  const replaceState = history.replaceState;

  history.pushState = function () {
    const result = pushState.apply(history, arguments);
    window.dispatchEvent(new Event('locationchange'));
    return result;
  };
  history.replaceState = function () {
    const result = replaceState.apply(history, arguments);
    window.dispatchEvent(new Event('locationchange'));
    return result;
  };
})(window.history);

window.addEventListener('locationchange', function () {
  console.log('Location changed to', window.location.href);
  initializeApp();
});