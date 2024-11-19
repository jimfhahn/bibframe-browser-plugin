// background.js

browser.webNavigation.onHistoryStateUpdated.addListener(details => {
  console.log('History state updated:', details.url);

  // Inject content script into the tab where the URL has changed
  browser.tabs.executeScript(details.tabId, {
    file: 'content.js',
    runAt: 'document_idle'
  });

}, {
  url: [
    { hostEquals: 'find.library.upenn.edu' }
  ]
});