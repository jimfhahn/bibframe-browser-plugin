(function() {
  console.log('Content script loaded');

  // Global variable to hold the Vue instance
  let vueApp = null;

  // Function to extract the mmsid from the URL
  function extractMmsidFromUrl() {
    const url = window.location.href;
    const match = url.match(/catalog\/(\d+)/);
    return match ? match[1] : null;
  }

  // Function to initialize the app
  function initializeApp() {
    console.log('Initializing app...');

    // Remove existing app div and Vue instance if any
    if (vueApp) {
      vueApp.$destroy();
      vueApp = null;
    }
    const existingAppDiv = document.getElementById('bibframinator-app');
    if (existingAppDiv) {
      existingAppDiv.remove();
    }

    // Create a unique div for the app
    const appDiv = document.createElement('div');
    appDiv.id = 'bibframinator-app';
    document.body.appendChild(appDiv);

    // Inject the modal HTML if not already injected
    if (!document.getElementById('knowledgeCardModal')) {
      injectModalHTML();
    } else {
      console.log('Modal HTML already injected');
    }

    // Initialize the Vue app
    vueApp = new Vue({
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
              this.observeButtonInsertion(); // Observe DOM changes to insert button
            })
            .catch((error) => console.error('Error fetching data:', error));
        },
        observeButtonInsertion() {
          const existingButtonElement = document.querySelector('.btn.btn-success');
          if (existingButtonElement) {
            console.log('Existing button element found:', existingButtonElement);
            this.insertButton();
          } else {
            const observer = new MutationObserver((mutations) => {
              for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                  const targetButton = document.querySelector('.btn.btn-success');
                  if (targetButton) {
                    console.log('Existing button element found:', targetButton);
                    this.insertButton();
                    observer.disconnect(); // Stop observing after button is inserted
                    break;
                  }
                }
              }
            });

            // Observe the entire body to catch button insertion
            const targetNode = document.body;
            observer.observe(targetNode, { childList: true, subtree: true });
            console.log('MutationObserver is now observing for button insertion');
          }
        },
        insertButton() {
          console.log('Attempting to insert button');
          if (this.apiData && this.apiData.qid && this.apiData.qid !== 'null') {
            console.log('API data is valid, proceeding to insert button');
            // Check if the button already exists
            const existingButton = document.querySelector(
              `button[data-preview-url="https://id.bibframe.app/entity/${this.apiData.qid}"]`
            );
            if (existingButton) {
              console.log('Button already exists');
              return;
            }
      
            // Create the button
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-secondary';
            button.setAttribute('data-toggle', 'modal');
            button.setAttribute('data-target', '#knowledgeCardModal');
            button.title = 'Author/Creator Knowledge Card: works, biographical information, and more';
            button.setAttribute('data-preview-url', `https://id.bibframe.app/entity/${this.apiData.qid}`);
            button.textContent = 'Author/Creator Knowledge Card';
      
            // Create a 'dd' element and append the button to it
            const ddElement = document.createElement('dd');
            ddElement.appendChild(button);
      
            // Find the target element and insert the 'dd' after it
            const targetElement = document.querySelector('dt.blacklight-creator_show');
            if (targetElement) {
              console.log('Target element found:', targetElement);
              targetElement.insertAdjacentElement('afterend', ddElement);
              console.log('Button inserted under the Author/Creator line');
            } else {
              console.error('Target element not found');
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
  let lastUrl = window.location.href;
  new MutationObserver(() => {
    const url = window.location.href;
    if (url !== lastUrl) {
      console.log('URL changed from', lastUrl, 'to', url);
      lastUrl = url;
      initializeApp();
    }
  }).observe(document.body, { childList: true, subtree: true });

  // Remove monkey-patching of history methods and unnecessary event listeners
})();