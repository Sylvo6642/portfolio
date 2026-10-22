import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

function json(data: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

function buildEmailHtml(name: string, email: string, message: string): string {
  const escaped = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const n = escaped(name);
  const e = escaped(email);
  const m = escaped(message).replace(/\n/g, '<br>');
  const ts = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' });
  const yr = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>New message from ${n}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    /* ── Reset ── */
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { border:0; outline:none; text-decoration:none; }

    /* ── Mobile stack ── */
    @media only screen and (max-width:600px) {
      .email-wrapper { padding:20px 12px 40px !important; }
      .card-body     { padding:28px 24px 28px !important; }
      .col-half      { display:block !important; width:100% !important; padding:0 0 20px 0 !important; }
      .col-half:last-child { padding-bottom:0 !important; }
      .header-row    { padding-bottom:24px !important; }
      h1             { font-size:22px !important; }
    }

    /* ── Dark mode (Apple Mail, Outlook iOS, supported clients) ── */
    @media (prefers-color-scheme: dark) {
      body                    { background-color:#0a0a0b !important; }
      .email-wrapper          { background-color:#0a0a0b !important; }
      .card                   { background-color:#111113 !important; border-color:rgba(255,255,255,0.08) !important; }
      .msg-box                { background-color:#0d0d0f !important; border-color:rgba(255,255,255,0.07) !important; }
      .msg-text               { color:#c8c8d0 !important; }
      .headline               { color:#f5f5f5 !important; }
      .sender-name            { color:#f5f5f5 !important; }
      .subtext                { color:#6b6b7a !important; }
      .label                  { color:#3d3d47 !important; }
      .divider                { background-color:rgba(255,255,255,0.06) !important; }
      .footer-divider         { background-color:rgba(255,255,255,0.04) !important; }
      .footer-text            { color:#2a2a33 !important; }
      .footer-link            { color:#3d3d47 !important; }
      .ts-text                { color:#3d3d47 !important; }
      .kr-box                 { background-color:#0a0a0b !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f6;font-family:'DM Sans',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#f4f4f6;mso-hide:all;">
    ${n} (${e}) sent you a message from your portfolio.&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;
  </div>

  <!-- Wrapper -->
  <table role="presentation" class="email-wrapper" width="100%" cellpadding="0" cellspacing="0"
    style="background-color:#f4f4f6;padding:40px 16px 56px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- ── HEADER ── -->
          <tr>
            <td class="header-row" style="padding-bottom:28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle">
                    <!-- KR monogram with gradient border -->
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:linear-gradient(135deg,#7c3aed,#a78bfa);border-radius:10px;padding:1.5px;">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td class="kr-box" style="background:#f4f4f6;border-radius:9px;padding:7px 13px;">
                                <span style="font-family:'JetBrains Mono',Courier New,monospace;font-size:12px;font-weight:500;letter-spacing:0.1em;color:#7c3aed;">KR</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <span class="ts-text" style="font-family:'JetBrains Mono',Courier New,monospace;font-size:11px;color:#9a9aaa;letter-spacing:0.04em;">${ts}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── CARD ── -->
          <tr>
            <td class="card" style="background-color:#ffffff;border-radius:20px;border:1px solid rgba(0,0,0,0.07);overflow:hidden;">

              <!-- Card body -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="card-body" style="padding:40px 40px 36px;">

                    <!-- Pill badge -->
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:99px;padding:4px 12px 4px 9px;">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-right:6px;vertical-align:middle;line-height:1;">
                                <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#7c3aed;vertical-align:middle;"></span>
                              </td>
                              <td style="vertical-align:middle;">
                                <span style="font-family:'JetBrains Mono',Courier New,monospace;font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:#7c3aed;">New Message</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Headline -->
                    <h1 class="headline" style="margin:0 0 10px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:24px;font-weight:700;color:#0f0f12;letter-spacing:-0.4px;line-height:1.3;">
                      You have a new message
                    </h1>
                    <p class="subtext" style="margin:0 0 36px;font-size:15px;color:#6b6b80;line-height:1.6;">
                      <span style="color:#7c3aed;font-weight:600;">${n}</span> reached out through your portfolio contact form.
                    </p>

                    <!-- Divider -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td class="divider" style="height:1px;background:rgba(0,0,0,0.07);font-size:1px;line-height:1px;">&nbsp;</td>
                      </tr>
                    </table>

                    <!-- From / Email — stacks on mobile via .col-half -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td class="col-half" width="50%" style="vertical-align:top;padding-right:16px;padding-bottom:0;">
                          <p class="label" style="margin:0 0 5px;font-family:'JetBrains Mono',Courier New,monospace;font-size:10px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#9a9aaa;">From</p>
                          <p class="sender-name" style="margin:0;font-size:15px;font-weight:600;color:#0f0f12;">${n}</p>
                        </td>
                        <td class="col-half" width="50%" style="vertical-align:top;padding-left:16px;padding-bottom:0;">
                          <p class="label" style="margin:0 0 5px;font-family:'JetBrains Mono',Courier New,monospace;font-size:10px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#9a9aaa;">Email</p>
                          <p style="margin:0;font-size:15px;font-weight:500;">
                            <a href="mailto:${e}" style="color:#7c3aed;text-decoration:none;">${e}</a>
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Message -->
                    <p class="label" style="margin:0 0 10px;font-family:'JetBrains Mono',Courier New,monospace;font-size:10px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#9a9aaa;">Message</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
                      <tr>
                        <td class="msg-box" style="background:#f8f8fa;border-radius:12px;border:1px solid rgba(0,0,0,0.06);padding:20px 24px;">
                          <p class="msg-text" style="margin:0;font-size:15px;color:#2a2a38;line-height:1.75;">${m}</p>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-radius:99px;background:linear-gradient(135deg,#7c3aed,#6d28d9);">
                          <a href="mailto:${e}?subject=Re%3A%20Your%20message%20on%20kevinsylvester.xyz"
                             style="display:inline-block;padding:12px 30px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;white-space:nowrap;">
                            Reply to ${n} &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="padding-top:32px;" align="center">
              <p class="footer-text" style="margin:0 0 4px;font-family:'JetBrains Mono',Courier New,monospace;font-size:11px;color:#9a9aaa;">
                Kevin Robin &middot; Full-Stack Developer
              </p>
              <p class="footer-text" style="margin:0;font-family:'JetBrains Mono',Courier New,monospace;font-size:11px;color:#9a9aaa;">
                <a class="footer-link" href="https://kevinsylvester.xyz" style="color:#9a9aaa;text-decoration:none;">kevinsylvester.xyz</a>
                &nbsp;&middot;&nbsp; &copy; ${yr}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

serve(async (req) => {
  const cors = corsHeaders();

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405, cors);

  let name: string;
  let email: string;
  let message: string;
  try {
    const body = await req.json() as { name?: unknown; email?: unknown; message?: unknown };
    if (
      typeof body.name !== 'string' || !body.name.trim() ||
      typeof body.email !== 'string' || !body.email.includes('@') ||
      typeof body.message !== 'string' || !body.message.trim()
    ) {
      return json({ error: 'Missing or invalid fields: name, email, message' }, 400, cors);
    }
    name = body.name.trim().slice(0, 200);
    email = body.email.trim().slice(0, 320);
    message = body.message.trim().slice(0, 5000);
  } catch {
    return json({ error: 'invalid request body' }, 400, cors);
  }

  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) return json({ error: 'mail not configured' }, 500, cors);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio <noreply@kevinsylvester.xyz>',
        to: ['kevinrobin673@gmail.com'],
        reply_to: email,
        subject: `New message from ${name}`,
        html: buildEmailHtml(name, email, message),
      }),
    });

    const data = await res.json().catch(() => ({}));
    return json(data, res.status, cors);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return json({ error: message }, 500, cors);
  }
});
