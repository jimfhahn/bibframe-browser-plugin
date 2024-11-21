// background.js

function injectScripts(tabId, scripts) {
  if (scripts.length === 0) {
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