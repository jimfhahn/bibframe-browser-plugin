(function() {
  const urlParams = new URL(window.location.href).searchParams;
  const qid = urlParams.get('qid') || '';
  console.log("sidebar-item.js loaded, fetched qid:", qid);

  // Fetch the agent ID and update the iframe source
  fetch(`https://id.bibframe.app/qid2svde?qid=${qid}`)
    .then(response => response.json())
    .then(data => {
      const agentId = data.svde_agent_id;
      const iframeSrc = `https://penn.svde.org/agents/${agentId}`;
      console.log("Constructed iframe src:", iframeSrc);
      
      document.getElementById('sidebar-item-content').innerHTML = `
        <iframe
          src="${iframeSrc}"
          width="100%"
          height="600"
          style="border:none;">
        </iframe>
      `;
    })
    .catch(error => {
      console.error('Error fetching agent id:', error);
      document.getElementById('sidebar-item-content').innerHTML = `
        <h1>Error loading agent details</h1>
      `;
    });

  function updateAgentLink(agentId) {
    const agentLinkDiv = document.getElementById('agent-link');
    const agentPageLink = document.getElementById('agent-page-link');
    if (agentId) {
      agentPageLink.href = `https://penn.svde.org/agents/${agentId}`;
      agentLinkDiv.style.display = 'block';
    } else {
      agentLinkDiv.style.display = 'none';
    }
  }

  function fetchAgentIdAndUpdateLink(itemId) {
    fetch(`https://api.example.com/qid2agent?itemId=${itemId}`)
      .then(response => response.json())
      .then(data => {
        const agentId = data.agentId;
        updateAgentLink(agentId);
      })
      .catch(error => {
        console.error('Error fetching agent id:', error);
        updateAgentLink(null);
      });
  }

  // Call this function with the appropriate item ID when needed
  // fetchAgentIdAndUpdateLink('some-item-id');
})();
