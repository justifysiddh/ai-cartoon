export async function POST(req) {
  const form = await req.formData();
  const image = form.get("image");

  const upstream = await fetch(
    "https://api-inference.huggingface.co/models/bes-dev/AnimeGANv2",
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer hf_dVJjvlfbnAqweLeFreePublic"
      },
      body: image
    }
  );

  const buffer = await upstream.arrayBuffer();
  return new Response(buffer, {
    headers: { "Content-Type": "image/png" }
  });
}
