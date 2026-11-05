export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Povoleni CORS pro pripadne volani z prohlizece
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Povolena je pouze metoda POST.'
    });
  }

  // Nacteni webhook URL z Vercel Environment Variables
  const webhookUrl = process.env.DOCS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('[SUBMIT-DOC] DOCS_WEBHOOK_URL neni nastaveno ve Vercel Environment Variables.');
    return res.status(500).json({
      error: 'DOCS_WEBHOOK_URL neni nastaveno ve Vercel Environment Variables!'
    });
  }

  try {
    // Nacteme streamovana binarni / multipart data odeslana z curl
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const bodyBuffer = Buffer.concat(chunks);

    // Preposleme presne ten samy multipart pozadavek na Discord Webhook
    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'content-type': req.headers['content-type'] || 'application/json'
      },
      body: bodyBuffer
    });

    const responseText = await discordResponse.text();

    if (!discordResponse.ok) {
      console.error(`[SUBMIT-DOC] Discord vratil chybu ${discordResponse.status}:`, responseText);
      return res.status(discordResponse.status).send(responseText);
    }

    res.setHeader('Content-Type', 'application/json');
    try {
      const data = JSON.parse(responseText);
      return res.status(200).json(data);
    } catch {
      return res.status(200).json({
        success: true,
        message: responseText || 'OK'
      });
    }
  } catch (error) {
    console.error('[SUBMIT-DOC] Chyba pri preposilani na Discord:', error);
    return res.status(502).json({
      error: 'Chyba pri preposilani dat na Discord Webhook.',
      details: error.message
    });
  }
}
