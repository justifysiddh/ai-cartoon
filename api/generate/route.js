export async function POST(req) {
  const form = await req.formData();
  const image = form.get("image");

  const upstream = await fetch(
    "https://api-inference.huggingface.co/models/bes-dev/AnimeGANv2",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "image/png"
      },
      body: image
    }
  );

  if (!upstream.ok) {
    return new Response(JSON.stringify({ error: "Model busy or not running" }), {
      status: 500
    });
  }

  const buffer = await upstream.arrayBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store"
    }
  });
}
