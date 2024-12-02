(function() {
  console.log('Content script loaded');

  // Function to extract MMSIDs from the document HTML
  function extractMmsidsFromDocument() {
    const mmsidElements = document.querySelectorAll('[data-document-id]');
    console.log('Extracting MMSIDs from document:', mmsidElements);
    return Array.from(mmsidElements).map(el => el.getAttribute('data-document-id'));
  }

  // Function to fetch data for a given MMSID
  function fetchData(mmsid) {
    const apiUrl = `https://id.bibframe.app/app/mmsid/${mmsid}`;
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
        if (data) {
          fetchThumbnail(data);
          if (window.location.href.includes('/catalog/')) {
            insertButton(data);
          }
        }
      })
      .catch(error => console.error('Fetch Error:', error));
  }

  // Function to fetch the thumbnail for a given MMSID
  function fetchThumbnail(data) {
    const apiUrl = `https://id.bibframe.app/app/thumbnail/${data.id}`;
    fetch(apiUrl)
      .then(response => {
        console.log('Thumbnail API response received:', response);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(thumbnailData => {
        console.log('Fetched thumbnail data:', thumbnailData);
        if (thumbnailData && thumbnailData.thumbnail) {
          data.thumbnail = thumbnailData.thumbnail;
          insertThumbnail(data);
        } else {
          console.log('No valid thumbnail data to insert for MMSID:', data.id);
        }
      })
      .catch(error => console.error('Thumbnail Fetch Error:', error));
  }

  // Function to insert the thumbnail into the DOM
  function insertThumbnail(data) {
    console.log('Inserting thumbnail for data:', data);

    const articleElement = document.querySelector(`article[data-document-id="${data.id}"]`);
    if (!articleElement) {
      console.error('Article element not found for MMSID:', data.id);
      return;
    }

    // Check if thumbnail already inserted
    if (articleElement.querySelector('.document-thumbnail')) {
      console.log('Thumbnail already inserted for MMSID:', data.id);
      return;
    }

    if (data && data.thumbnail) {
      const img = document.createElement('img');
      img.src = data.thumbnail;
      img.alt = '';
      img.width = 200;
      img.height = 200;
      img.setAttribute('data-preview-url', `https://id.bibframe.app/entity/${data.qid}`);
      img.onerror = function() {
        console.error('Failed to load thumbnail image:', img.src);
        img.remove(); // Remove the image element if it fails to load
      };

      // Create the anchor element
      const anchor = document.createElement('a');
      anchor.href = '#';
      anchor.setAttribute('data-toggle', 'modal');
      anchor.setAttribute('data-target', '#knowledgeCardModal');
      anchor.setAttribute('data-preview-url', `https://id.bibframe.app/entity/${data.qid}`);
      anchor.appendChild(img);

      // Add click event listener to the anchor
      anchor.addEventListener('click', function(event) {
        event.preventDefault();
        const iframe = document.getElementById('knowledgeCardIframe');
        const url = anchor.getAttribute('data-preview-url');
        console.log('Thumbnail clicked, loading URL:', url);
        iframe.setAttribute('src', url + '?t=' + new Date().getTime());
      });

      // Create the border div
      const borderDiv = document.createElement('div');
      borderDiv.className = 'border border-primary p-2';
      borderDiv.appendChild(anchor);

      // Create the thumbnail div
      const thumbnailDiv = document.createElement('div');
      thumbnailDiv.className = 'document-thumbnail';
      thumbnailDiv.appendChild(borderDiv);

      // Select the document-main-section within the article
      const mainSection = articleElement.querySelector('.document-main-section');
      if (mainSection) {
        mainSection.insertAdjacentElement('afterend', thumbnailDiv);
        console.log('Thumbnail inserted for MMSID:', data.id);
      } else {
        console.error('document-main-section not found for MMSID:', data.id);
      }
    } else {
      console.log('No valid thumbnail data to insert for MMSID:', data.id);
    }
  }

  // Function to insert the button into the DOM
  function insertButton(data) {
    if (data && data.qid && data.qid !== 'null') {
      // Check if the button already exists
      const existingButton = document.querySelector(
        `button[data-preview-url="https://id.bibframe.app/entity/${data.qid}"]`
      );
      if (existingButton) {
        console.log('Button already exists');
        return;
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn-secondary mt-3 mb-3'; // Ensure Bootstrap button classes are used
      button.style.width = 'auto'; // Ensure the button does not span full width
      button.setAttribute('data-toggle', 'modal');
      button.setAttribute('data-target', '#knowledgeCardModal');
      button.title = `Author/Creator Knowledge Card: works, biographical information, and more`;
      button.setAttribute('data-preview-url', `https://id.bibframe.app/entity/${data.qid}`);
      button.textContent = `Author/Creator Knowledge Card`;

      const targetElement = document.querySelector('dt.blacklight-creator_show');
      if (targetElement) {
        targetElement.insertAdjacentElement('afterend', button);
        console.log('Button inserted');
      } else {
        console.error('Target element not found');
        return; // Exit if the target element is not found
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
  }

  // Function to inject the modal HTML
  function injectModalHTML() {
    if (document.getElementById('knowledgeCardModal')) {
      console.log('Modal HTML already injected');
      return;
    }
    const modalHTML = `
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
    const iframe = document.getElementById('knowledgeCardIframe');

    if (modal && iframe) {
      console.log('Modal and iframe elements found');

      modal.on('show.bs.modal', function(event) {
        const button = $(event.relatedTarget); // Button that triggered the modal
        const url = button.data('preview-url');
        console.log('Modal shown, loading URL:', url);
        iframe.src = url + '?t=' + new Date().getTime();
      });

      modal.on('hidden.bs.modal', function() {
        console.log('Modal hidden, clearing iframe src');
        iframe.src = '';
      });

      // Ensure the modal can be closed using jQuery
      $(document).on('click', '[data-dismiss="modal"]', function() {
        $('#knowledgeCardModal').modal('hide');
      });
    } else {
      console.error('Modal or iframe element not found');
    }
  }

  // Function to initialize the app for the catalog detail page
  function initializeCatalogPage() {
    console.log('Initializing app for catalog detail page...');

    // Extract the MMSID from the URL
    const mmsid = extractMmsidFromUrl();
    if (mmsid) {
      console.log('Extracted mmsid from URL:', mmsid);
      fetchData(mmsid);
    } else {
      console.log('Failed to extract mmsid from URL');
    }
  }

  // Function to extract the MMSID from the URL
  function extractMmsidFromUrl() {
    const url = window.location.href;
    const match = url.match(/catalog\/(\d+)/);
    return match ? match[1] : null;
  }

  // Function to initialize the app for the search results page
  function initializeSearchResultsPage() {
    console.log('Initializing app for search results page...');

    // Wait for the documents list to be present
    const observer = new MutationObserver(() => {
      const documentsList = document.getElementById('documents');
      if (documentsList) {
        observer.disconnect();
        console.log('Documents list found, extracting MMSIDs and fetching data...');
        const mmsids = extractMmsidsFromDocument();
        mmsids.forEach(mmsid => {
          fetchData(mmsid);
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Function to initialize the app
  function initializeApp() {
    console.log('Initializing app...');

    // Inject the modal HTML if not already injected
    injectModalHTML();

    // Initialize the modal events
    initializeModalEvents();

    // Determine the page type and initialize accordingly
    if (window.location.href.includes('/catalog/')) {
      initializeCatalogPage();
    } else if (document.getElementById('documents')) {
      initializeSearchResultsPage();
    }
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
})();