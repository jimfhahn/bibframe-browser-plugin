// app.js

// Function to extract the mmsid from the URL
function extractMmsidFromUrl() {
  const url = window.location.href;
  const match = url.match(/catalog\/(\d+)/);
  return match ? match[1] : null;
}

// Function to create and mount the Vue.js app
(function createVueApp() {
  new Vue({
    el: '#app',
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
          button.className = 'btn btn-secondary mt-3 mb-3';
          button.setAttribute('data-bs-toggle', 'modal');
          button.setAttribute('data-bs-target', '#knowledgeCardModal');
          button.title = `Author/Creator Knowledge Card: works, biographical information, and more`;
          button.setAttribute('data-preview-url', `https://id.bibframe.app/entity/${this.apiData.qid}`);
          button.textContent = `Author/Creator Knowledge Card`;

          const targetElement = document.querySelector('dt.blacklight-creator_show');
          if (targetElement) {
            targetElement.insertAdjacentElement('afterend', button);
            console.log('Button inserted');
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
      injectModalHTML() {
        if (document.getElementById('knowledgeCardModal')) {
          console.log('Modal HTML already injected');
          return;
        }
        const modalHTML = `
          <!-- Modal -->
          <div class="modal fade" id="knowledgeCardModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" style="max-width: 90%; height: 90%;">
              <div class="modal-content" style="height: 100%;">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLabel">Author/Creator Knowledge Card</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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
      },
      initializeModalEvents() {
        const modal = document.getElementById('knowledgeCardModal');
        const iframe = document.getElementById('knowledgeCardIframe');

        if (modal && iframe) {
          console.log('Modal and iframe elements found');

          // Remove custom event listeners to let Bootstrap handle them naturally
          /*
          modal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            if (!button) {
              console.error('Button that triggered the modal not found');
              return;
            }
            console.log('Button that triggered the modal:', button);
            const url = button.getAttribute('data-preview-url');
            console.log('Modal shown, loading URL:', url);
            iframe.setAttribute('src', '');
            iframe.setAttribute('src', url + '?t=' + new Date().getTime());
          });

          modal.addEventListener('hidden.bs.modal', function () {
            console.log('Modal hidden, clearing iframe src');
            iframe.setAttribute('src', '');
          });

          // Remove custom jQuery handler for closing the modal
          $(document).on('click', '[data-bs-dismiss="modal"]', function() {
            $('#knowledgeCardModal').modal('hide');
          });
          */
        } else {
          console.error('Modal or iframe element not found');
        }
      },
    },
    mounted() {
      console.log('Vue app mounted');
      this.injectModalHTML();
      this.initializeModalEvents();

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
})();