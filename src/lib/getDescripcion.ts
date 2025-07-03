export async function obtenerDescripcion(nombre: string, original?: string) {
    if (original?.trim()) {
        try {
            const res = await fetch('https://libretranslate.com/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    q: original,
                    source: 'en',
                    target: 'es',
                    format: 'text',
                }),
            });
            const data = await res.json();
            return data.translatedText || original;
        } catch {
            return original;
        }
    }

    // 1. Wikipedia
    const wikipediaURL = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(nombre)}`;
    try {
        const res = await fetch(wikipediaURL);
        if (res.ok) {
            const data = await res.json();
            if (data.extract) return data.extract;
        }
    } catch { }

    // 2. OpenRouter
    try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'mistralai/mistral-7b-instruct',
                messages: [
                    {
                        role: 'user',
                        content: `Escribe una descripción de producto en español para: ${nombre}`,
                    },
                ],
            }),
        });

        const json = await res.json();
        return json.choices?.[0]?.message?.content?.trim() || '';
    } catch {
        return '';
    }
}
