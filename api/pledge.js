export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: 'Method not allowed.'
    });
  }

  const message =
    typeof req.body?.message === 'string'
      ? req.body.message.trim()
      : '';

  if (!message || message.length > 500) {
    return res.status(400).json({
      error: 'Please enter a commitment of 1 to 500 characters.'
    });
  }

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.error('EmailJS environment variables are missing.');

    return res.status(500).json({
      error: 'Email service is not configured yet.'
    });
  }

  try {
    const emailResponse = await fetch(
      'https://api.emailjs.com/api/v1.0/email/send',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            message,
            submitted_at: new Date().toISOString()
          }
        })
      }
    );

    if (!emailResponse.ok) {
      const details = await emailResponse.text();
      console.error('EmailJS request failed:', details);

      return res.status(502).json({
        error: 'The email could not be sent. Please try again later.'
      });
    }

    return res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error('Pledge API error:', error);

    return res.status(500).json({
      error: 'An unexpected error occurred while submitting your pledge.'
    });
  }
}