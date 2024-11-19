// app.js
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
        .then(response => {
          console.log('API response received:', response);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('Fetched data:', data);
          this.apiData = data;
        })
        .catch(error => console.error('Error fetching data:', error));
    },
    insertButton() {
      if (this.apiData) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-secondary mt-3 mb-3';
        button.setAttribute('data-bs-toggle', 'modal');
        button.setAttribute('data-bs-target', '#knowledgeCardModal');
        button.title = `Author Knowledge Card:`;
        button.setAttribute('data-preview-url', `https://id.bibframe.app/entity/${this.apiData.qid}`);
        button.textContent = `Author Knowledge Card`;

        const targetLink = document.querySelector('a.btn.btn-success[data-controller="request-button"]');
        if (targetLink) {
          targetLink.insertAdjacentElement('afterend', button);
          console.log('Button inserted');
        } else {
          console.error('Target link not found');
        }

        // Add event listener to the button to set the iframe URL
        button.addEventListener('click', () => {
          const iframe = document.getElementById('knowledgeCardIframe');
          const url = button.getAttribute('data-preview-url');
          console.log('Button clicked, loading URL:', url);
          iframe.setAttribute('src', url + '?t=' + new Date().getTime());
        });
      }
    },
    injectModalHTML() {
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
    },
    initializeModalEvents() {
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
  },
  mounted() {
    this.injectModalHTML();
    this.initializeModalEvents();
    const documentElement = document.querySelector('div#document[data-document-id]');
    if (documentElement) {
      console.log('Document element added to the DOM');
      this.mmsid = documentElement.getAttribute('data-document-id');
      console.log('Extracted mmsid:', this.mmsid);
      this.fetchData();
    }
  },
  watch: {
    apiData(newData) {
      if (newData) {
        this.insertButton();
      }
    }
  }
});