"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function Page() {
  const [preview, setPreview] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      color: "white",
      textAlign: "center"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(20px)",
        padding: "30px",
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.2)",
        width: "350px"
      }}>
        <h1 style={{fontSize:"30px",fontWeight:"bold",marginBottom:"10px"}}>
          🎨 AI Cartoon Maker
        </h1>
        <p>Upload your photo and watch magic happen ✨</p>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPreview(URL.createObjectURL(e.target.files[0]))}
          style={{marginTop:"15px"}}
        />

        {preview && (
          <img
            src={preview}
            style={{
              width:"100%",
              marginTop:"15px",
              borderRadius:"15px",
              border:"1px solid rgba(255,255,255,0.2)"
            }}
          />
        )}
      </div>
    </div>
  );
}
