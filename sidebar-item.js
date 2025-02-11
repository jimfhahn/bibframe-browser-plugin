(function() {
  const urlParams = new URL(window.location.href).searchParams;
  const qid = urlParams.get('qid') || '';
  console.log("sidebar-item.js loaded, fetched qid:", qid);
  const iframeSrc = "https://penn.svde.org/advanced-search/agents?q=(identifier+contains+" + encodeURIComponent(qid) + ")";
  console.log("Constructed iframe src:", iframeSrc);
  
  document.getElementById('sidebar-item-content').innerHTML = `
    <iframe
      src="${iframeSrc}"
      width="100%"
      height="600"
      style="border:none;">
    </iframe>
  `;
})();
