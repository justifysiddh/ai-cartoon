"use client";
import React, { useState } from "react";

export default function Page() {
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const cartoonAPI = async (style) => {
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", preview);

    const res = await fetch(
      `https://cartoonify-api.vercel.app/${style}`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();
    setResult(data.output);
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      padding:"20px",
      color:"white",
      textAlign:"center"
    }}>
      <div style={{
        background:"rgba(255,255,255,0.1)",
        backdropFilter:"blur(25px)",
        padding:"25px",
        borderRadius:"20px",
        width:"350px",
        border:"1px solid rgba(255,255,255,0.2)"
      }}>
        <h1 style={{fontSize:"25px",fontWeight:"bold"}}>
          🎨 AI Cartoon Maker
        </h1>

        <input
          type="file"
          accept="image/*"
          onChange={(e)=>setPreview(e.target.files[0])}
          style={{margin:"10px 0"}}
        />

        {preview && (
          <img
            src={URL.createObjectURL(preview)}
            style={{width:"100%",borderRadius:"15px"}}
          />
        )}

        {preview && (
          <div style={{marginTop:"15px", display:"grid", gap:"8px"}}>
            <button onClick={()=>cartoonAPI("pixar")}>🎬 Pixar 3D</button>
            <button onClick={()=>cartoonAPI("anime")}>🌸 Anime</button>
            <button onClick={()=>cartoonAPI("toon")}>😎 ToonMe</button>
            <button onClick={()=>cartoonAPI("disney")}>🏰 Disney</button>
          </div>
        )}

        {loading && (
          <p style={{marginTop:"15px", fontSize:"18px"}}>
            ⏳ Making Cartoon...
          </p>
        )}

        {result && (
          <>
            <img
              src={result}
              style={{width:"100%",marginTop:"15px",borderRadius:"15px"}}
            />
            <a
              href={result}
              download
              style={{display:"block",marginTop:"10px",color:"yellow"}}
            >
              ⬇ Download
            </a>
          </>
        )}
      </div>
    </div>
  );
}
