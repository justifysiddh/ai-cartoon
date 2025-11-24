export async function POST(req) {
  const formData = await req.formData();

  const res = await fetch("https://api.deepai.org/api/cute-creature-generator", {
    method: "POST",
    headers: {
      "api-key": "quickstart-QUdJIGlzIGNvbWluZy4uLg=="
    },
    body: formData
  });

  return new Response(JSON.stringify(await res.json()));
}
