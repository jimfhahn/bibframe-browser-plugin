// background.js
function fetchDataAndRewriteHTML(tabId, id) {
  const apiUrl = `http://localhost:5001/mmsid/${id}`;
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
      browser.tabs.sendMessage(tabId, {
        action: 'rewriteHTML',
        data: data
      });
      console.log('Message sent to content script with data:', data);
    })
    .catch(error => console.error('Error fetching data:', error));
}

// Listen for messages from the content script
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === 'fetchData') {
    const tabId = sender.tab.id;
    console.log('Message received from content script:', message);
    fetchDataAndRewriteHTML(tabId, message.id);
  }
});