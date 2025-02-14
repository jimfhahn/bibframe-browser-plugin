(function() {
  function updateSidebar() {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      if (tabs.length && tabs[0] && tabs[0].url) {
        const url = tabs[0].url;
        const contentDiv = document.getElementById('sidebar-content');
        if (url.includes('/catalog/')) {
          // Item detail page
          contentDiv.innerHTML = '<h1>Item Detail Sidebar</h1><!-- item detail content -->';
        } else if (
          url.includes('?search_field') ||
          url.includes('/search') ||
          url.match(/[?&]q=/) ||
          url.includes('?page=')
        ) {
          // Search results page
          const qParam = new URL(url).searchParams.get('q') || '';
          contentDiv.innerHTML = `
            <h1>Search Results Sidebar</h1>
            <iframe
              src="https://penn.svde.org/search?q=${encodeURIComponent(qParam)}"
              width="100%"
              height="600"
              style="border:none;">
            </iframe>
          `;
        } else {
          // Replace default sidebar text with placeholder text
          contentDiv.innerHTML = `
            <h1>Search Sidebar</h1>
            <p>This sidebar will display search data once you perform a search from the 
            <a href="https://find.library.upenn.edu/" target="_blank">library catalog</a>. 
            Please go to the catalog, enter your search terms.</p>
          `;
        }
      } else {
        console.error("No active tab URL available");
      }
    });
  }  
  // Initial load
  updateSidebar();
  
  // Listen for messages from background.js to update sidebar on tab change, if desired.
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'update-sidebar') {
      updateSidebar();
    }
  });
})();
