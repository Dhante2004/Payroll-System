export async function sendEmail(email: string, subject: string, text: string) {
  const agentMailApiKey = process.env.AGENTMAIL_API_KEY;
  const agentMailInboxId = process.env.AGENTMAIL_INBOX_ID;
  if (agentMailApiKey && agentMailInboxId) {
    const response = await fetch(`https://api.agentmail.to/v0/inboxes/${encodeURIComponent(agentMailInboxId)}/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${agentMailApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to: email, subject, text })
    });
    if (!response.ok) {
      const details = await response.text();
      throw new Error(`AgentMail rejected the email (${response.status}). ${details.slice(0, 300)}`);
    }
    return true;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Email delivery is not configured. Add AGENTMAIL_API_KEY and AGENTMAIL_INBOX_ID or RESEND_API_KEY.');
    }
    return false;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.OTP_FROM_EMAIL || 'onboarding@resend.dev',
      to: [email],
      subject,
      text
    })
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend rejected the email (${response.status}). ${details.slice(0, 300)}`);
  }
  return true;
}

export function sendOtpEmail(email: string, code: string) {
  return sendEmail(
    email,
    'Your MIT payroll verification code',
    `Your verification code is ${code}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`
  );
}
