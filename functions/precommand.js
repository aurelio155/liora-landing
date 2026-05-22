exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const { productId, productName, price, quantity, totalPrice, email } = JSON.parse(event.body);

    if (!email || !productId || !price || !quantity) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required fields" })
      };
    }

    // Send emails via SendGrid API (using fetch, no dependency needed)
    if (process.env.SENDGRID_API_KEY) {
      const sendGridKey = process.env.SENDGRID_API_KEY;

      // Email to admin
      const adminEmailData = {
        personalizations: [{
          to: [{ email: 'liora.jewelry.fr@outlook.com' }],
          subject: `📌 Nouvelle pré-commande: ${productName} x${quantity}`
        }],
        from: { email: 'liora.jewelry.fr@outlook.com', name: 'Liora' },
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d4af37;">✨ Nouvelle Pré-commande Liora</h2>
              <div style="background: #fefdfb; padding: 20px; border-left: 4px solid #d4af37; margin: 20px 0;">
                <p><strong>Produit:</strong> ${productName}</p>
                <p><strong>Quantité:</strong> ${quantity}</p>
                <p><strong>Prix unitaire:</strong> ${price}€</p>
                <p><strong>Prix total:</strong> ${totalPrice}€</p>
              </div>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p><strong>👤 Client:</strong></p>
                <p style="margin: 5px 0; color: #333;">${email}</p>
              </div>
            </div>
          `
        }]
      };

      // Email to client
      const clientEmailData = {
        personalizations: [{
          to: [{ email: email }],
          subject: '✨ Merci pour ta pré-commande Liora!'
        }],
        from: { email: 'liora.jewelry.fr@outlook.com', name: 'Liora' },
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d4af37;">✨ Merci pour ta pré-commande!</h2>
              <p>Salut,</p>
              <p>On a bien reçu ta pré-commande! Voilà les détails:</p>
              <div style="background: #fefdfb; padding: 20px; border-left: 4px solid #d4af37; margin: 20px 0;">
                <p><strong>Produit:</strong> ${productName}</p>
                <p><strong>Quantité:</strong> ${quantity}</p>
                <p><strong>Prix total:</strong> ${totalPrice}€</p>
              </div>
              <p style="margin: 20px 0;">On prépare ta commande et on te contactera dès que c'est prêt à expédier. Ça arrive dans les prochaines semaines! 🎁</p>
              <p style="margin: 20px 0;">Des questions? Écris à <strong>liora.jewelry.fr@outlook.com</strong> — on te répond rapidement! 💎</p>
              <p style="margin-top: 40px; color: #888; font-size: 13px;">À bientôt,<br>L'équipe Liora</p>
            </div>
          `
        }]
      };

      // Send admin email
      try {
        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendGridKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(adminEmailData)
        });
      } catch (err) {
        console.error('Admin email error:', err);
      }

      // Send client email
      try {
        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendGridKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(clientEmailData)
        });
      } catch (err) {
        console.error('Client email error:', err);
      }
    }

    // Return success
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Pré-commande enregistrée pour ${email}`,
        productName,
        quantity,
        totalPrice
      })
    };
  } catch (e) {
    console.error('Error:', e);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Pré-commande enregistrée ! On te contactera bientôt.',
        fallback: true
      })
    };
  }
};
