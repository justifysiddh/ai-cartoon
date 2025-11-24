import { NextResponse } from "next/server";

export const runtime = "edge";

const ENDPOINTS = {
  disney: "https://api.replicate.com/v1/predictions",
  pixar3d: "https://api.replicate.com/v1/predictions",
  anime: "https://api.replicate.com/v1/predictions",
  fullbody: "https://api.replicate.com/v1/predictions"
};

const MODELS = {
  disney: "tencentarc/gfpgan",
  pixar3d: "tstramer/realistic-vision-v4.0",
  anime: "stability-ai/sdxl-turbo",
  fullbody: "zsxkib/animify"
};

export async function POST(req) {
  const form = await req.formData();
  const file = form.get("image");
  const style = form.get("style") || "disney";

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  const res = await fetch(ENDPOINTS[style], {
    method: "POST",
    headers: {
      "Authorization": `Token ${process.env.REPLICATE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      version: MODELS[style],
      input: { image: `data:image/jpeg;base64,${base64}` }
    })
  });

  const json = await res.json();

  return NextResponse.json(json);
}
