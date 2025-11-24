// app/api/cartoon/route.js
import { NextResponse } from "next/server";

export const runtime = "edge"; // fast, optional

const MODEL_MAP = {
  "pixar": "deepinsight/Toonify",           // example - 3D / toonify style
  "anime": "hakurei/waifu-diffusion",      // anime style (if available)
  "toonme": "deepinsight/Toonify",         // fallback to toonify for toonme style
  "disney": "nitrosocke/CartoonGAN"        // example cartoon-style model
};

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    const style = form.get("style") || "pixar";

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // convert file to Blob and then to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const body = new Uint8Array(arrayBuffer);

    // pick model endpoint
    const model = MODEL_MAP[style] || MODEL_MAP["pixar"];
    // Hugging Face Inference API endpoint
    const url = `https://api-inference.huggingface.co/models/${model}`;

    // HF API Key from env (set in Vercel dashboard)
    const HF_KEY = process.env.HF_API_KEY || "";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: HF_KEY ? `Bearer ${HF_KEY}` : "",
        // Accept: "image/png" // optional
      },
      body
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "Model error", detail: text }, { status: 502 });
    }

    // return image stream back to client
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
