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

    // Send admin notification via Formspree
    try {
      await fetch('https://formspree.io/f/mlgvngwe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          productName: productName,
          productId: productId,
          quantity: quantity,
          price: price,
          totalPrice: totalPrice
        })
      });
    } catch (formspreeError) {
      console.error('Formspree admin error:', formspreeError);
    }

    // Send client confirmation via Resend
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
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
    } catch (resendError) {
      console.error('Resend client error:', resendError);
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
