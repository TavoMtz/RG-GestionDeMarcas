export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
        return res.status(500).json({
            error: 'API key no configurada en el servidor.',
            expectedEnv: ['DEEPSEEK_API_KEY']
        });
    }

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        /* LOG TEMPORAL de diagnóstico: respuesta cruda de DeepSeek (solo visible en logs del servidor) */
        console.log('[analyze] DeepSeek status:', response.status);
        console.log('[analyze] DeepSeek respuesta cruda:', JSON.stringify(data).slice(0, 2000));
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al conectar con la API de DeepSeek.' });
    }
}
