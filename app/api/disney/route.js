export async function POST(req) {
  try {
    const form = await req.formData();
    const image = form.get("image");

    const upstream = await fetch("https://ai-api.magicstudio.com/api/v1/cartoonize", {
      method: "POST",
      headers: {
        "accept": "application/json"
      },
      body: form
    });

    const json = await upstream.json();

    return new Response(
      JSON.stringify({ output_url: json.output_url }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
