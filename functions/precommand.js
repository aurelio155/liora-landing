const RESEND_API_KEY = process.env.RESEND_API_KEY;

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

    // Send admin notification
    try {
      const adminResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'noreply@resend.dev',
          to: 'liora.jewelry.fr@outlook.com',
          subject: `Nouvelle pré-commande : ${productName}`,
          html: `
            <h2>Nouvelle pré-commande</h2>
            <p><strong>Client :</strong> ${email}</p>
            <p><strong>Produit :</strong> ${productName}</p>
            <p><strong>Quantité :</strong> ${quantity}</p>
            <p><strong>Prix unitaire :</strong> ${price}€</p>
            <p><strong>Total :</strong> ${totalPrice}€</p>
          `
        })
      });
      const adminData = await adminResponse.json();
      console.log('Admin email response:', adminData);
    } catch (adminError) {
      console.error('Admin email error:', adminError);
    }

    // Send client confirmation
    try {
      const clientResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'noreply@resend.dev',
          to: email,
          subject: 'Votre pré-commande Liora est confirmée 💎',
          html: `
            <h2>Pré-commande confirmée !</h2>
            <p>Merci pour ta pré-commande.</p>
            <p><strong>${productName}</strong> x${quantity} = <strong>${totalPrice}€</strong></p>
            <p>On te contactera bientôt pour les détails de livraison.</p>
            <p>Liora</p>
          `
        })
      });
      const clientData = await clientResponse.json();
      console.log('Client email response:', clientData);
    } catch (clientError) {
      console.error('Client email error:', clientError);
    }

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
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Erreur serveur'
      })
    };
  }
};
