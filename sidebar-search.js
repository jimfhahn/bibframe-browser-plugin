(function() {
  // Removed debugging logs
  const urlParams = new URL(window.location.href).searchParams;
  const qParam = urlParams.get('q') || '';
  const iframeSrc = "https://penn.svde.org/search?q=" + encodeURIComponent(qParam);
  
  document.getElementById('sidebar-content').innerHTML = `
    <iframe
      src="${iframeSrc}"
      width="100%"
      height="600"
      style="border:none;">
    </iframe>
  `;
})();
