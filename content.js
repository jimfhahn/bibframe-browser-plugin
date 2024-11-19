// content.js
console.log('Content script loaded');

// Inject Vue.js library
const vueScript = document.createElement('script');
vueScript.src = 'https://cdn.jsdelivr.net/npm/vue@2';
vueScript.onload = () => {
  // Inject Bootstrap CSS
  const bootstrapCSS = document.createElement('link');
  bootstrapCSS.rel = 'stylesheet';
  bootstrapCSS.href = 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css';
  document.head.appendChild(bootstrapCSS);

  // Inject Popper.js (required by Bootstrap)
  const popperJS = document.createElement('script');
  popperJS.src = 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.1/umd/popper.min.js';
  popperJS.onload = () => {
    // Inject Bootstrap JS after Popper.js is loaded
    const bootstrapJS = document.createElement('script');
    bootstrapJS.src = 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js';
    bootstrapJS.onload = () => {
      console.log('Bootstrap JS loaded');

      // Inject Vue.js component script
      const appScript = document.createElement('script');
      appScript.src = browser.runtime.getURL('app.js');
      document.body.appendChild(appScript);
    };
    document.body.appendChild(bootstrapJS);
  };
  document.body.appendChild(popperJS);
};
document.head.appendChild(vueScript);

// Create a div for the Vue.js app
const appDiv = document.createElement('div');
appDiv.id = 'app';
document.body.appendChild(appDiv);