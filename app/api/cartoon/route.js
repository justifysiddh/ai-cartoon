export async function POST(req) {
  try {
    const form = await req.formData();

    const upstream = await fetch(
      "https://ai-api.magicstudio.com/api/v1/cartoonize",
      {
        method: "POST",
        body: form
      }
    );

    const json = await upstream.json();

    return Response.json({
      output: json.output_url
    });

  } catch (err) {
    return Response.json({ error: err.message });
  }
}
