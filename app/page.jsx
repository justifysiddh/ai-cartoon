"use client";
import React, { useState, useRef } from "react";

const STYLES = [
  { id: "disney", label: "Disney / Pixar Face", api: "/api/disney" },
  { id: "fullbody", label: "Full Body Cartoon", api: "/api/fullbody" },
  { id: "anime", label: "Anime Style", api: "/api/anime" },
  { id: "pixar3d", label: "3D Pixar Render", api: "/api/pixar3d" }
];

function Spinner() {
  return (
    <div style={{display:"inline-block",width:28,height:28,border:"4px solid rgba(255,255,255,0.12)",borderTopColor:"#ffd166",borderRadius:28,animation:"spin 1s linear infinite"}}/>
  );
}

export default function Page() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const controllerRef = useRef(null);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResults({});
    setProgress(0);
  };

  async function callApi(style) {
    const apiPath = STYLES.find(s=>s.id===style).api;

    const form = new FormData();
    form.append("image", file);

    try {
      const res = await fetch(apiPath, {
        method: "POST",
        body: form,
        signal: controllerRef.current?.signal
      });

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const json = await res.json();
        const url =
          json.output_url ||
          json.output ||
          json.url ||
          json.image ||
          json.output_image;

        if (!url) throw new Error("No output URL");

        return { status: "done", url };
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      return { status: "done", url };
    } catch (err) {
      return { status: "error", error: err.message };
    }
  }

  const generateAll = async () => {
    if (!file) return alert("Upload image first");

    setLoading(true);
    setResults({});
    setProgress(0);

    controllerRef.current = new AbortController();

    let completed = 0;
    const total = STYLES.length;

    const tasks = STYLES.map(s => (async () => {
      setResults(prev => ({...prev, [s.id]: { status: "pending" }}));

      const res = await callApi(s.id);

      completed++;
      setProgress(Math.round((completed/total)*100));

      setResults(prev => ({...prev, [s.id]: res}));
    })());

    await Promise.all(tasks);

    setLoading(false);
  };

  return (
    <div style={{padding:40,color:"#fff"}}>
      <h1>AI Cartoon Studio</h1>

      <input type="file" accept="image/*" onChange={onFile} />

      <button onClick={generateAll} disabled={loading || !file}>
        {loading ? "Generating..." : "Generate 4 Styles"}
      </button>

      <div style={{marginTop:10,height:10,background:"#333",borderRadius:8}}>
        <div style={{width:`${progress}%`,background:"yellow",height:"100%",borderRadius:8}}/>
      </div>

      {preview && <img src={preview} style={{width:180,borderRadius:10,marginTop:20}}/>}

      {STYLES.map(s=>{
        const r = results[s.id] || {};
        return (
          <div key={s.id} style={{marginTop:20}}>
            <b>{s.label}</b> – {r.status || "waiting"}

            {r.url && (
              <img src={r.url} style={{width:250,borderRadius:10,marginTop:10}}/>
            )}
          </div>
        );
      })}
    </div>
  );
}
