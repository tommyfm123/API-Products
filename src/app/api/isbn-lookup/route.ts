import { obtenerDescripcion } from '@/lib/getDescripcion';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return Response.json({ error: 'Código ISBN no provisto' }, { status: 400 });
    }

    try {
        const res = await fetch(`https://openlibrary.org/isbn/${code}.json`);

        const contentType = res.headers.get('content-type');
        const body = await res.text();

        if (!contentType?.includes('application/json')) {
            return Response.json({ error: 'Respuesta inválida de OpenLibrary', html: body }, { status: 500 });
        }

        const json = JSON.parse(body);

        const title = json.title || 'Título desconocido';
        const description =
            typeof json.description === 'string'
                ? json.description
                : json.description?.value || '';

        const descripcion = await obtenerDescripcion(title, description);

        // Portada libro (si existe)
        const coverId = json.covers?.[0];
        const image = coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
            : null;

        return Response.json({
            title,
            brand: json.publishers?.[0] || 'Desconocido',
            description: descripcion,
            image,
        });
    } catch (err) {
        console.error(err);
        return Response.json({ error: 'Error al consultar OpenLibrary' }, { status: 500 });
    }
}
