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
    { id: "pixar", label: "3D Pixar" },
    { id: "anime", label: "Anime" },
    { id: "toon", label: "ToonMe" },
    { id: "disney", label: "Disney" }
  ];

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResultUrl(null);
    setError("");
  };

  const generate = async () => {
    if (!file) { setError("Please upload an image."); return; }
    setError(""); setLoading(true); setResultUrl(null);

    const fd = new FormData();
    fd.append("image", file);
    fd.append("style", style);

    try {
      const res = await fetch("/api/cartoon", { method: "POST", body: fd });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Conversion failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (e) {
      console.error(e);
      setError("Conversion failed. Try again later.");
    } finally { setLoading(false); }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "cartoon.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, color:"#fff" }}>
      <div style={{ width:980, maxWidth:"95%", display:"grid", gridTemplateColumns:"1fr 420px", gap:24 }}>
        <div style={{ padding:24, borderRadius:16, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
          <h1 style={{ margin:0, fontSize:32, fontWeight:800 }}>🎨 AI Cartoon Maker (Real AI)</h1>
          <p style={{ opacity:0.9 }}>Upload → choose style → Generate. First few conversions may be a bit slow on free HF quota.</p>

          <div style={{ marginTop:12 }}>
            <label style={{ display:"block", fontWeight:700 }}>Choose style</label>
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              {styles.map(s => (
                <button key={s.id} onClick={() => setStyle(s.id)} style={{ padding:10, borderRadius:10, border: style===s.id ? "2px solid #ffd166" : "1px solid rgba(255,255,255,0.06)", background: style===s.id ? "#ffd166" : "transparent", color: style===s.id ? "#111" : "#fff", cursor:"pointer" }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop:16 }}>
            <input type="file" accept="image/*" onChange={onFile} />
          </div>

          <div style={{ marginTop:16, display:"flex", gap:12 }}>
            <button onClick={generate} disabled={loading} style={{ padding:12, borderRadius:10, background:"#ffd166", color:"#111", fontWeight:800, cursor: "pointer" }}>
              {loading ? "Generating..." : "Generate Cartoon"}
            </button>
            <button onClick={() => { setFile(null); setPreview(null); setResultUrl(null); setError(""); }} style={{ padding:12, borderRadius:10, border:"1px solid rgba(255,255,255,0.06)", background:"transparent", color:"#fff" }}>
              Reset
            </button>
          </div>

          {error && <div style={{ marginTop:12, color:"#ffb4b4" }}>{error}</div>}
        </div>

        <div style={{ padding:18, borderRadius:12, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ height:420, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:10, overflow:"hidden", background:"rgba(0,0,0,0.15)" }}>
            {loading ? (
              <div style={{ textAlign:"center" }}>
                <div style={{ marginBottom:8 }}>Rendering...</div>
                <div style={{ width:72, height:72, borderRadius:36, border:"6px solid rgba(255,255,255,0.08)", borderTopColor:"#ffd166", animation:"spin 1s linear infinite" }} />
              </div>
            ) : resultUrl ? (
              <img src={resultUrl} style={{ maxWidth:"100%", maxHeight:"100%" }} />
            ) : preview ? (
              <img src={preview} style={{ maxWidth:"100%", maxHeight:"100%" }} />
            ) : (
              <div style={{ textAlign:"center", opacity:0.9 }}>
                <div style={{ fontWeight:800, fontSize:16 }}>Preview</div>
                <div style={{ marginTop:8, fontSize:13 }}>Upload a photo & choose style to start</div>
              </div>
            )}
          </div>

          <div style={{ display:"flex", gap:10, marginTop:12 }}>
            <button onClick={download} disabled={!resultUrl} style={{ flex:1, padding:10, borderRadius:10, background: resultUrl ? "#ffd166" : "rgba(255,255,255,0.04)", color: resultUrl ? "#111" : "#aaa", border:"none" }}>
              Download
            </button>
            <button onClick={() => resultUrl && window.open(resultUrl, "_blank")} disabled={!resultUrl} style={{ padding:10, borderRadius:10, border:"1px solid rgba(255,255,255,0.06)", background:"transparent", color: resultUrl ? "#fff" : "#aaa" }}>
              Open
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
