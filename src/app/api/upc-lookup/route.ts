import { obtenerDescripcion } from '@/lib/getDescripcion'; // este archivo lo creás en el paso siguiente

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
        const body = await res.text();

        if (!contentType?.includes('application/json')) {
            return Response.json({ error: 'Respuesta inválida de UPCItemDB', html: body }, { status: 500 });
        }

        const json = JSON.parse(body);

        if (!json.items || json.items.length === 0) {
            return Response.json({ error: 'Producto no encontrado' }, { status: 404 });
        }

        const item = json.items[0];

        const descripcion = await obtenerDescripcion(item.title, item.description);

        return Response.json({
            title: item.title,
            brand: item.brand,
            description: descripcion,
            image: item.images?.[0] || null,
        });
    } catch (err) {
        console.error(err);
        return Response.json({ error: 'Error al consultar UPCItemDB' }, { status: 500 });
    }
}
