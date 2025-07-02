// src/app/api/upc-lookup/route.ts

async function traducirLibre(text: string) {
    if (!text) return '';
    try {
        const res = await fetch('https://libretranslate.com/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                q: text,
                source: 'en',
                target: 'es',
                format: 'text',
            }),
        });
        const data = await res.json();
        return data.translatedText || '';
    } catch {
        return text; // si falla traducción, devuelvo el original
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return Response.json({ error: 'Código no provisto' }, { status: 400 });
    }

    try {
        const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`, {
            headers: { Accept: 'application/json' },
        });

        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            const text = await res.text();
            return Response.json({ error: 'Respuesta inválida de UPCItemDB', html: text }, { status: 500 });
        }

        const json = await res.json();

        if (!json.items || json.items.length === 0) {
            return Response.json({ error: 'Producto no encontrado' }, { status: 404 });
        }

        const item = json.items[0];

        const descripcionEsp = await traducirLibre(item.description || '');

        return Response.json({
            title: item.title,
            brand: item.brand,
            description: descripcionEsp,
            image: item.images?.[0] || null,
        });
    } catch (err) {
        console.error(err); // ✅ usamos err para evitar error de ESLint
        return Response.json({ error: 'Error al consultar UPCItemDB' }, { status: 500 });
    }
}
