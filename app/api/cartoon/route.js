export async function POST(req) {
  const form = await req.formData();
  const image = form.get("image");

  const res = await fetch(
    "https://api-inference.huggingface.co/models/akhaliq/AnimeGANv3",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "image/jpeg"
      },
      body: image
    }
  );

  const buffer = await res.arrayBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png"
    }
  });
}
