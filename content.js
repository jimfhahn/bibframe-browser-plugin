// content.js
console.log('Content script loaded');

function rewriteHTML(apiData) {
  console.log('rewriteHTML function called with data:', apiData);

  // Create the new button element
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-secondary mt-3 mb-3';
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#knowledgeCardModal');
  button.title = `Author/Creator: ${apiData.svde_agent}`;
  button.setAttribute('data-preview-url', `http://localhost:8080/entity/${apiData.qid}`);
  button.textContent = `Author Knowledge Card: ${apiData.svde_agent}`;

  // Find the target <a> element and insert the new button after it
  const targetLink = document.querySelector('a.btn.btn-success[data-controller="request-button"]');
  if (targetLink) {
    targetLink.insertAdjacentElement('afterend', button);
    console.log('Button inserted');
  } else {
    console.error('Target link not found');
  }
}

// Use MutationObserver to detect changes in the DOM
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

// Listen for messages from the background script
browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'rewriteHTML') {
    console.log('Message received from background script:', message);
    rewriteHTML(message.data);
  }
});