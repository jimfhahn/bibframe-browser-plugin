// content.js
console.log('Content script loaded');

// Inject Vue.js library
const vueScript = document.createElement('script');
vueScript.src = 'https://cdn.jsdelivr.net/npm/vue@2';
vueScript.onload = () => {
  // Inject Vue.js component script
  const appScript = document.createElement('script');
  appScript.src = browser.runtime.getURL('app.js');
  document.body.appendChild(appScript);
};
document.head.appendChild(vueScript);

// Create a div for the Vue.js app
const appDiv = document.createElement('div');
appDiv.id = 'app';
document.body.appendChild(appDiv);