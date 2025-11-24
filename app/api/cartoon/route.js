export async function POST(req) {
  const form = await req.formData();
  const image = form.get("image");
  const style = form.get("style"); // hf / replicate

  if (style === "replicate") {
    const res = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "cjwbw1g9...any model version ID",
        input: { image: image }
      })
    });

    const json = await res.json();
    return Response.json(json);
  }

  // Default HuggingFace
  const upstream = await fetch(
    "https://api-inference.huggingface.co/models/akhaliq/AnimeGANv3",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`
      },
      body: image
    }
  );

  const buffer = await upstream.arrayBuffer();
  return new Response(buffer, {
    headers: { "Content-Type": "image/png" }
  });
}
