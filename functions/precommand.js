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

    // Send to Formspree for admin notification
    const adminPayload = {
      email: email,
      productName: productName,
      productId: productId,
      quantity: quantity,
      price: price,
      totalPrice: totalPrice
    };

    // Send to Formspree for client confirmation
    const clientPayload = {
      email: email,
      productName: productName,
      quantity: quantity,
      totalPrice: totalPrice
    };

    try {
      // Send admin notification
      await fetch('https://formspree.io/f/mlgvngwe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminPayload)
      });

      // Send client confirmation
      await fetch('https://formspree.io/f/xredkywy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientPayload)
      });

      console.log('Precommand and confirmation sent successfully');
    } catch (formspreeError) {
      console.error('Formspree send error:', formspreeError);
      // Don't fail the precommand if Formspree fails
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
