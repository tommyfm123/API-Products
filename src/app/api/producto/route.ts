import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) {
    return new Response(JSON.stringify({ error: "Código no provisto" }), { status: 400 });
  }

  const query = `${code} site:amazon.com OR site:mercadolibre.com.ar OR site:openfoodfacts.org`;
  try {
    const serpRes = await fetch(
      `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${process.env.SERP_API_KEY}`
    );
    const serpData = await serpRes.json();

    const productTitle = serpData?.organic_results?.[0]?.title || "Producto desconocido";
    const snippet = serpData?.organic_results?.[0]?.snippet || "";
    let image = serpData?.images_results?.[0]?.thumbnail;
    if (!image && serpData?.inline_images?.[0]?.thumbnail) {
      image = serpData.inline_images[0].thumbnail;
    }

    const prompt = `
Generá una descripción breve y clara del siguiente producto para una tienda online. Mantené un estilo neutral y profesional.
La descripción debe tener:
- Un párrafo de 3 a 4 líneas que describa el producto
- Debajo, bullet points con las características clave ("key features") del producto

Producto: "${productTitle}"
Descripción original: "${snippet}"

No repitas el nombre del producto en la descripción.
`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const openaiJson = await openaiRes.json();
    const descripcion = openaiJson.choices?.[0]?.message?.content?.trim() || "";

    return Response.json({
      nombre: productTitle,
      imagen: image || "",
      descripcion,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Error al buscar producto" }), { status: 500 });
  }
}
