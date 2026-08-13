export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Servicio de email no configurado.' });
    }

    const { nombre, email, telefono, servicio, mensaje } = req.body || {};

    if (!nombre || !email || !mensaje) {
        return res.status(400).json({ error: 'Faltan campos requeridos: nombre, email y mensaje.' });
    }

    const servicioLabel = {
        investigacion: 'Investigación de Mercados',
        naiming: 'Naming, Diseño y Producción',
        web: 'Diseño Web',
        redes: 'Gestión de Redes Sociales',
        cursos: 'Cursos y Capacitación',
        otro: 'Otro',
    }[servicio] || servicio || 'No especificado';

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva consulta de ${nombre}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#121212;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#f6cf3d;padding:28px 40px;text-align:center;">
              <span style="font-size:2rem;font-weight:900;color:#121212;letter-spacing:2px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">RG</span>
              <p style="margin:4px 0 0;font-size:0.8rem;font-weight:600;color:#121212;letter-spacing:3px;text-transform:uppercase;">Gestión de Marcas</p>
            </td>
          </tr>

          <!-- SUBHEADER -->
          <tr>
            <td style="background-color:#1a1a1a;padding:20px 40px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:1rem;color:#f6cf3d;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Nueva consulta recibida</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:32px 40px;">

              <!-- Nombre -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#1e1e1e;border-radius:10px;padding:16px 20px;border-left:3px solid #f6cf3d;">
                    <p style="margin:0 0 4px;font-size:0.7rem;font-weight:700;color:#f6cf3d;text-transform:uppercase;letter-spacing:1.5px;">Nombre</p>
                    <p style="margin:0;font-size:1rem;color:#ffffff;">${escapeHtml(nombre)}</p>
                  </td>
                </tr>
              </table>

              <!-- Email -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#1e1e1e;border-radius:10px;padding:16px 20px;border-left:3px solid #f6cf3d;">
                    <p style="margin:0 0 4px;font-size:0.7rem;font-weight:700;color:#f6cf3d;text-transform:uppercase;letter-spacing:1.5px;">Email</p>
                    <p style="margin:0;font-size:1rem;color:#ffffff;">${escapeHtml(email)}</p>
                  </td>
                </tr>
              </table>

              <!-- Teléfono -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#1e1e1e;border-radius:10px;padding:16px 20px;border-left:3px solid #f6cf3d;">
                    <p style="margin:0 0 4px;font-size:0.7rem;font-weight:700;color:#f6cf3d;text-transform:uppercase;letter-spacing:1.5px;">Teléfono</p>
                    <p style="margin:0;font-size:1rem;color:#ffffff;">${escapeHtml(telefono || 'No proporcionado')}</p>
                  </td>
                </tr>
              </table>

              <!-- Servicio -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#1e1e1e;border-radius:10px;padding:16px 20px;border-left:3px solid #f6cf3d;">
                    <p style="margin:0 0 4px;font-size:0.7rem;font-weight:700;color:#f6cf3d;text-transform:uppercase;letter-spacing:1.5px;">Servicio de interés</p>
                    <p style="margin:0;font-size:1rem;color:#ffffff;">${escapeHtml(servicioLabel)}</p>
                  </td>
                </tr>
              </table>

              <!-- Mensaje -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                <tr>
                  <td style="background-color:#1e1e1e;border-radius:10px;padding:16px 20px;border-left:3px solid #f6cf3d;">
                    <p style="margin:0 0 8px;font-size:0.7rem;font-weight:700;color:#f6cf3d;text-transform:uppercase;letter-spacing:1.5px;">Mensaje</p>
                    <p style="margin:0;font-size:1rem;color:#cccccc;line-height:1.6;white-space:pre-wrap;">${escapeHtml(mensaje)}</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="mailto:${escapeHtml(email)}" style="display:inline-block;background-color:#f6cf3d;color:#121212;text-decoration:none;font-weight:700;font-size:0.9rem;padding:14px 36px;border-radius:8px;letter-spacing:0.5px;">Responder a ${escapeHtml(nombre)}</a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#161616;padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0 0 6px;font-size:0.8rem;color:#666666;">RG Gestión de Marcas</p>
              <p style="margin:0 0 6px;font-size:0.75rem;color:#555555;">contacto@rg-gestiondemarcas.com · +52 222 446 7947</p>
              <p style="margin:0;font-size:0.7rem;color:#444444;">Este correo fue generado automáticamente desde el formulario de contacto del sitio web.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                from: 'RG Gestión de Marcas <noreply@rg-gestiondemarcas.com>',
                to: ['contacto@rg-gestiondemarcas.com'],
                reply_to: email,
                subject: `Nueva consulta de ${nombre} — ${servicioLabel}`,
                html
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Resend error:', data);
            return res.status(response.status).json({ error: data.message || 'Error al enviar el correo.' });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Contact handler error:', error);
        return res.status(500).json({ error: 'Error interno al enviar el mensaje.' });
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
