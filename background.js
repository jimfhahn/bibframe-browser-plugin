// background.js

// Remove the injectCSS function entirely
/*
function injectCSS(tabId) {
  return browser.tabs.insertCSS(tabId, {
    file: 'lib/bootstrap.min.css'
  }).catch(error => {
    console.error('Error injecting CSS:', error);
  });
}
*/

// Modify the injectScripts function to no longer inject CSS
function injectScripts(tabId, scripts) {
  if (scripts.length === 0) {
    // Remove the injectCSS call
    return Promise.resolve();
  }
  const script = scripts.shift();
  return browser.tabs.executeScript(tabId, {
    file: script,
    runAt: 'document_idle'
  }).then(() => {
    return injectScripts(tabId, scripts);
  }).catch(error => {
    console.error('Error injecting script:', script, error);
  });
}

browser.webNavigation.onHistoryStateUpdated.addListener(details => {
  console.log('History state updated:', details.url);

  const scripts = [
    'lib/jquery.min.js',
    'lib/popper.min.js',
    'lib/bootstrap.min.js',
    'lib/vue.min.js',
    'content.js'
  ];

  injectScripts(details.tabId, scripts.slice());

}, {
  url: [
    { hostEquals: 'find.library.upenn.edu' }
  ]
});

// Listen for completed navigation to ensure content script is injected
browser.webNavigation.onCompleted.addListener(details => {
  console.log('Navigation completed:', details.url);

  const scripts = [
    'lib/jquery.min.js',
    'lib/popper.min.js',
    'lib/bootstrap.min.js',
    'lib/vue.min.js',
    'content.js'
  ];

  injectScripts(details.tabId, scripts.slice());

}, {
  url: [
    { hostEquals: 'find.library.upenn.edu' }
  ]
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('/catalog/')) {
      // Extract MMSID from URL
      const match = tab.url.match(/catalog\/(\d+)/);
      if (match) {
        const mmsid = match[1];
        console.log('Extracted MMSID:', mmsid);
        const apiUrl = `https://id.bibframe.app/app/lcnaf/${mmsid}`;
        console.log('Fetching LCNAF API:', apiUrl);
        fetch(apiUrl)
          .then(res => res.json())
          .then(data => {
            console.log('LCNAF API response data:', data);
            // Trim response values to avoid extraneous spaces
            const qid = (data.qid && data.qid.trim()) || (data.authorQid && data.authorQid.trim()) || '';
            console.log('Fetched qid:', qid);
            if (qid) {
              // Only update the sidebar for the item page if a valid qid is returned
              const panelUrl = 'sidebar-item.html?qid=' + encodeURIComponent(qid) + '&t=' + new Date().getTime();
              chrome.sidebarAction.setPanel({ panel: panelUrl });
            } else {
              console.log('No valid qid returned; keeping the previous sidebar.');
            }
          })
          .catch(err => {
            console.error('Error fetching LCNAF data:', err);
            console.log('Keeping the previous sidebar due to fetch error.');
          });
      } else {
        console.error('No MMSID match found in URL.');
        // Do nothing to retain previous sidebar
      }
    } else if (
      tab.url.includes('/search') ||
      tab.url.includes('/documents') ||
      tab.url.includes('?search_field') ||
      tab.url.match(/[?&]q=/) ||
      tab.url.includes('?page=')
    ) {
      // Extract the "q" parameter from the active tab URL
      const urlObj = new URL(tab.url);
      const qParam = urlObj.searchParams.get('q') || '';
      // Append a timestamp to force panel reloading (avoid caching)
      const panelUrl = 'sidebar-search.html?q=' + encodeURIComponent(qParam) + '&t=' + new Date().getTime();
      chrome.sidebarAction.setPanel({ panel: panelUrl });
    }
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.runtime.sendMessage({ type: 'update-sidebar', url: tab.url });
  }
});