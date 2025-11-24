"use client";

import React, { useState } from "react";

export default function Page() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState("pixar");
  const [error, setError] = useState("");

  const styles = [
    { id: "pixar", label: "3D Pixar style" },
    { id: "anime", label: "Anime style" },
    { id: "toonme", label: "ToonMe style" },
    { id: "disney", label: "Disney / Realistic cartoon" }
  ];

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResultUrl(null);
    setError("");
  };

  const handleGenerate = async () => {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }
    setError("");
    setLoading(true);
    setResultUrl(null);

    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("style", style);

      const res = await fetch("/api/cartoon", {
        method: "POST",
        body: fd
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Conversion failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (e) {
      setError("Conversion failed. Try again later.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "cartoon.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleShare = async () => {
    if (!resultUrl) return;
    try {
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      const filesArray = [new File([blob], "cartoon.png", { type: blob.type })];
      if (navigator.canShare && navigator.canShare({ files: filesArray })) {
        await navigator.share({ files: filesArray, title: "My Cartoon" });
      } else {
        // fallback: open image in new tab
        window.open(resultUrl, "_blank");
      }
    } catch (err) {
      window.open(resultUrl, "_blank");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      color: "#fff",
      fontFamily: "Inter, system-ui, sans-serif"
    }}>
      <div style={{
        width: 980,
        maxWidth: "95%",
        display: "grid",
        gridTemplateColumns: "1fr 420px",
        gap: 28,
        alignItems: "start"
      }}>

        {/* Left: Hero + Controls */}
        <div style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
          padding: 28,
          borderRadius: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.06)"
        }}>
          <h1 style={{ fontSize: 36, margin: 0, fontWeight: 800, letterSpacing: -0.5 }}>
            🎨 AI Cartoon Maker
          </h1>
          <p style={{ marginTop: 10, opacity: 0.9 }}>
            Upload a photo, choose a style, and get a cinematic cartoon version. All styles included.
          </p>

          <div style={{ marginTop: 18 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>Choose style</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {styles.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: style === s.id ? "2px solid #FFD166" : "1px solid rgba(255,255,255,0.08)",
                    background: style === s.id ? "linear-gradient(90deg,#ffd166,#ff7b7b)" : "transparent",
                    color: style === s.id ? "#111" : "#fff",
                    cursor: "pointer",
                    fontWeight: 700
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>Upload photo</label>
            <input type="file" accept="image/*" onChange={onFileChange} />
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{
                padding: "12px 18px",
                borderRadius: 12,
                background: "linear-gradient(90deg,#ffd166,#ff7b7b)",
                border: "none",
                color: "#111",
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              {loading ? "Generating..." : "Generate Cartoon"}
            </button>

            <button
              onClick={() => { setFile(null); setPreview(null); setResultUrl(null); setError(""); }}
              style={{
                padding: "12px 18px",
                borderRadius: 12,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Reset
            </button>
          </div>

          {error && <div style={{ marginTop: 12, color: "#ffb4b4" }}>{error}</div>}

          <div style={{ marginTop: 18, fontSize: 13, opacity: 0.85 }}>
            Tip: For best results use a clear portrait photo with the face centered.
          </div>
        </div>

        {/* Right: Preview Card */}
        <div style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
          padding: 18,
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
        }}>
          <div style={{ height: 420, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, overflow: "hidden", background: "rgba(0,0,0,0.15)" }}>
            {/* Loading / preview / result */}
            {loading ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ marginBottom: 12 }}>Rendering your cartoon...</div>
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  border: "6px solid rgba(255,255,255,0.08)",
                  borderTopColor: "#ffd166",
                  animation: "spin 1s linear infinite",
                }} />
              </div>
            ) : resultUrl ? (
              <img src={resultUrl} alt="Result" style={{ maxHeight: "100%", maxWidth: "100%", display: "block" }} />
            ) : preview ? (
              <img src={preview} alt="Preview" style={{ maxHeight: "100%", maxWidth: "100%", display: "block", filter: "saturate(1.05)" }} />
            ) : (
              <div style={{ textAlign: "center", opacity: 0.9 }}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>Preview</div>
                <div style={{ marginTop: 8, fontSize: 13 }}>Upload a photo & choose style to start</div>
              </div>
            )}
          </div>

          {/* Controls under preview */}
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={handleDownload} disabled={!resultUrl} style={{
              flex: 1, padding: 10, borderRadius: 10, fontWeight: 700,
              background: resultUrl ? "linear-gradient(90deg,#ffd166,#ff7b7b)" : "rgba(255,255,255,0.04)",
              color: resultUrl ? "#111" : "#aaa",
              border: "none", cursor: resultUrl ? "pointer" : "not-allowed"
            }}>
              Download
            </button>

            <button onClick={handleShare} disabled={!resultUrl} style={{
              padding: 10, borderRadius: 10, fontWeight: 700,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#fff", cursor: resultUrl ? "pointer" : "not-allowed"
            }}>
              Share
            </button>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
            ✅ All styles included. Server converts image & returns cartoon. Use responsibly.
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
