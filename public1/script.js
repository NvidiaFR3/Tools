window.onload = () => {
  const domainSelect = document.getElementById("domainSelect");
  window.domainSettings.domains.forEach((d, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.innerText = d.name;
    domainSelect.appendChild(opt);
  });
};

async function createSubdomain() {
  const index = document.getElementById("domainSelect").value;
  const sub = document.getElementById("subInput").value;
  const ip = document.getElementById("ipInput").value;

  const domain = window.domainSettings.domains[index];
  const res = await fetch("/api/create-subdomain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      zoneId: domain.zoneId,
      token: domain.token,
      domain: domain.name,
      subdomain: sub,
      ip
    })
  });

  const text = await res.text();
  document.getElementById("result").innerText = text;
}