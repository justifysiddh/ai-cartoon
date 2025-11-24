"use client";
import React, { useState } from "react";

export default function Page() {
  const [preview, setPreview] = useState(null);

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
          🎨 AI Cartoon Maker (Offline)
        </h1>

        <input
          type="file"
          accept="image/*"
          onChange={(e)=>setPreview(URL.createObjectURL(e.target.files[0]))}
          style={{margin:"10px 0"}}
        />

        {preview && (
          <>
            <img
              src={preview}
              style={{
                width:"100%",
                borderRadius:"15px",
                filter:"contrast(140%) saturate(130%) brightness(110%)",
              }}
            />

            <img
              src={preview}
              style={{
                width:"100%",
                borderRadius:"15px",
                marginTop:"15px",
                filter:"contrast(180%) saturate(200%) brightness(110%) sepia(30%) blur(1px)",
              }}
            />

            <p style={{marginTop:"10px",color:"yellow"}}>
              ✅ Cartoon Generated (No API Needed)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
