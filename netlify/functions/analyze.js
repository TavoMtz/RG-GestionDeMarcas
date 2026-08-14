const DEEPSEEK_API_KEYS = [
    'DEEPSEEK_API_KEY'
];

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
        return jsonResponse(405, { error: 'Method not allowed' });
    }

    const apiKey = getFirstEnvValue(DEEPSEEK_API_KEYS);
    if (!apiKey) {
        return jsonResponse(500, {
            error: 'API key no configurada en el servidor.',
            expectedEnv: DEEPSEEK_API_KEYS
        });
    }

    let payload;
    try {
        payload = JSON.parse(event.body || '{}');
    } catch (error) {
        return jsonResponse(400, { error: 'JSON inválido en el body.' });
    }

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return jsonResponse(response.status, data);
    } catch (error) {
        return jsonResponse(500, { error: 'Error al conectar con la API de DeepSeek.' });
    }
};

function getFirstEnvValue(keys) {
    for (const key of keys) {
        if (process.env[key]) {
            return process.env[key].trim();
        }
    }
    return '';
}

function jsonResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
}
