export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { zoneId, token, domain, subdomain, ip } = req.body;
  const fullDomain = `${subdomain}.${domain}`;

  try {
    const cfRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "A",
        name: fullDomain,
        content: ip,
        ttl: 1,
        proxied: false
      })
    });

    const data = await cfRes.json();
    if (!data.success) return res.status(400).json(data.errors);

    res.send(`✅ Subdomain ${fullDomain} berhasil diarahkan ke IP ${ip}`);
  } catch (err) {
    res.status(500).send("⚠️ Error: " + err.message);
  }
}