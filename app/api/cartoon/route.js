export const runtime = "edge";

export async function POST(req) {
  const form = await req.formData();
  const file = form.get("image");
  const style = form.get("style") || "pixar";

  const REPLICATE_KEY = process.env.REPLICATE_API_KEY;

  const MODEL_MAP = {
    pixar: "fofr/pixar-style:5c25c6b31b7d8cfba1e50a4bbfe8a31f4432d0d3c1b56e0f5a414ddafa249bca",
    disney: "fofr/disney-3d:8f6cb21c9329484b9ed45e9a7fab3583c2e4f1b19b6cb9d67366c4d47b1207cb",
    realistic3d: "tencentarc/photoreal3d:3d530e3f19e1c9a32a27d58f671aa12e044489a04e2007ee3c7e5f0b43f4bd57"
  };

  const arrayBuffer = await file.arrayBuffer();
  const base64 = `data:${file.type};base64,${Buffer.from(arrayBuffer).toString("base64")}`;

  // 1️⃣ Start generation
  let res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${REPLICATE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      version: MODEL_MAP[style],
      input: { image: base64 }
    })
  });

  let json = await res.json();

  // 2️⃣ Wait for result
  let prediction = json;

  while (
    prediction.status === "starting" ||
    prediction.status === "processing"
  ) {
    await new Promise(r => setTimeout(r, 2000)); // wait 2 sec

    const poll = await fetch(
      `https://api.replicate.com/v1/predictions/${prediction.id}`,
      {
        headers: { "Authorization": `Bearer ${REPLICATE_KEY}` }
      }
    );

    prediction = await poll.json();
  }

  // 3️⃣ Return output URL
  return Response.json({
    output: prediction.output?.[0] || null,
    status: prediction.status
  });
}
