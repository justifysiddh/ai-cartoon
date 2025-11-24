import { NextResponse } from "next/server";

export async function POST(req) {
  const form = await req.formData();
  const file = form.get("image");

  if (!file) {
    return NextResponse.json({ error: "No image" });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const HF_KEY = process.env.HUGGINGFACE_API_KEY;
  const REPLICATE_KEY = process.env.REPLICATE_API_KEY;

  let results = [];

  // ✅ 1️⃣ HuggingFace
  try {
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/lllyasviel/sd-cartoon",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: base64,
          parameters: {
            prompt: "pixar disney cartoon portrait high quality",
          },
        }),
      }
    );

    const img = await hfRes.arrayBuffer();
    results.push(Buffer.from(img).toString("base64"));
  } catch (e) {
    console.log("HF Failed");
  }

  // ✅ 2️⃣ Replicate
  try {
    const rep = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REPLICATE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version:
            "9e59fda3bb... cartoon model",
          input: {
            image: `data:image/png;base64,${base64}`,
            prompt: "Pixar cartoon portrait",
          },
        }),
      }
    );

    const out = await rep.json();
    if (out.output) {
      results.push(out.output[0]);
    }
  } catch (e) {
    console.log("Replicate Failed");
  }

  // ✅ 3️⃣ HF Space fallback
  try {
    const space = await fetch(
      "https://hf.space/embed/hysts/AnimeGenerator/api/predict",
      {
        method: "POST",
        body: JSON.stringify({
          data: [`data:image/png;base64,${base64}`],
        }),
      }
    );

    const r = await space.json();
    results.push(r.data[0]);
  } catch (e) {
    console.log("Space failed");
  }

  return NextResponse.json({
    images: results,
  });
}
