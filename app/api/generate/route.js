import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("image");

    if (!file) {
      return NextResponse.json({ error: "No image provided" });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // ✅ BEST Cartoon Model (HuggingFace Space)
    const spaceRes = await fetch(
      "https://hf.space/embed/akhaliq/Photo2Cartoon/api/predict/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [`data:image/png;base64,${base64}`],
        }),
      }
    );

    const json = await spaceRes.json();

    const output = json?.data?.[0];

    if (!output) {
      return NextResponse.json({
        error: "Model did not return image",
      });
    }

    // ✅ ALWAYS return base64 (NO URL)
    return NextResponse.json({
      images: [output],
      success: true,
    });

  } catch (err) {
    console.log("ERROR:", err);

    return NextResponse.json({
      error: "Server failed",
    });
  }
}
