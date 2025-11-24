export async function POST(req) {
  const formData = await req.formData();

  const res = await fetch("https://api.deepai.org/api/3d-rendering", {
    method: "POST",
    headers: {
      "api-key": "quickstart-QUdJIGlzIGNvbWluZy4uLg=="
    },
    body: formData
  });

  return new Response(JSON.stringify(await res.json()));
}
