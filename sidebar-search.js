(function() {
  const urlParams = new URL(window.location.href).searchParams;
  const qParam = urlParams.get('q') || '';
  const contentDiv = document.getElementById('sidebar-content');

  if (qParam) {
    const iframeSrc = "https://penn.svde.org/search?q=" + encodeURIComponent(qParam);
    contentDiv.innerHTML = `
      <iframe
        src="${iframeSrc}"
        width="100%"
        height="600"
        style="border:none;">
      </iframe>
    `;
  } else {
    contentDiv.innerHTML = `
      <h1>Search Sidebar</h1>
      <p>This sidebar will display search data once you perform a search from the 
      <a href="https://find.library.upenn.edu/" target="_blank">library catalog</a>. 
      Please go to the catalog, enter your search terms.</p>
    `;
  }
  // Persist the search sidebar content for use in sidebar-item.js fallback
  localStorage.setItem('lastSearchSidebar', contentDiv.innerHTML);
})();
