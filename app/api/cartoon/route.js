// app/api/cartoon/route.js
import { NextResponse } from "next/server";

export const runtime = "edge"; // fast

// map style name -> HuggingFace model (change if you prefer other models)
const MODEL_MAP = {
  pixar: "deepinsight/Toonify",      // example
  anime: "hakurei/waifu-diffusion", // example (may need JSON format)
  toon: "deepinsight/Toonify",      // fallback
  disney: "nitrosocke/CartoonGAN"   // example
};

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    const style = (form.get("style") || "pixar").toString();

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // convert file to arrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const body = new Uint8Array(arrayBuffer);

    // pick model endpoint
    const model = MODEL_MAP[style] || MODEL_MAP["pixar"];
    const url = `https://api-inference.huggingface.co/models/${model}`;

    const HF_KEY = process.env.HF_API_KEY || "";

    // Some HF models expect image binary directly (multipart). If JSON required, you'll need to adapt.
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: HF_KEY ? `Bearer ${HF_KEY}` : "",
        // NOTE: do not set Content-Type here for binary body
      },
      body
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "Model error", detail: text }, { status: 502 });
    }

    const buffer = await res.arrayBuffer();
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("content-type") || "image/png",
        "Cache-Control": "public, max-age=0, must-revalidate"
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
