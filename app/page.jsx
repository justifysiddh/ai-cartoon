"use client";
import React, { useState, useRef } from "react";

/*
  Pro UI page.jsx
  - Calls: /api/disney, /api/fullbody, /api/anime, /api/pixar3d
  - Shows progress, before/after slider, download & share
*/

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

function BeforeAfter({ before, after }) {
  // simple slider without external libs
  const ref = useRef(null);
  const [pos, setPos] = useState(50);
  return (
    <div style={{position:"relative", width:"100%", height:320, borderRadius:12, overflow:"hidden", background:"#111"}}>
      <img src={before} style={{position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover"}} />
      <div style={{position:"absolute", inset:0, width:`${pos}%`, overflow:"hidden", transition:"width .15s"}}>
        <img src={after} style={{width:"100%", height:"100%", objectFit:"cover"}} />
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={pos}
        onChange={(e)=>setPos(e.target.value)}
        style={{position:"absolute", left:0, right:0, bottom:10, margin:"0 12px"}}
      />
    </div>
  );
}

export default function Page() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState({}); // { styleId: {url, status, error} }
  const [loading, setLoading] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const controllerRef = useRef(null);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResults({});
    setGlobalProgress(0);
  };

  // helper to call one API
  async function callApi(style) {
    const apiPath = STYLES.find(s=>s.id===style).api;
    const form = new FormData();
    form.append("image", file);
    try {
      const res = await fetch(apiPath, { method: "POST", body: form, signal: controllerRef.current?.signal });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "API error");
      }
      // some APIs return JSON with url, others send image binary. Try both:
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await res.json();
        // common fields used by deepai or others: output_url / output
        const url = json.output_url || json.output || json.url || json.output_image || json.image;
        if (!url) throw new Error("No output_url in response");
        return { url, status: "done" };
      } else {
        // binary image -> create blob url
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        return { url, status: "done" };
      }
    } catch (err) {
      return { error: String(err.message || err), status: "error" };
    }
  }

  // Generate all 4 styles in parallel with progress
  const generateAll = async () => {
    if (!file) return alert("Upload an image first");
    setLoading(true);
    setResults({});
    setGlobalProgress(0);
    controllerRef.current = new AbortController();

    const total = STYLES.length;
    let completed = 0;

    // execute sequentially or parallel — do parallel but control concurrency if needed
    const promises = STYLES.map(s => (async () => {
      // mark pending
      setResults(prev => ({...prev, [s.id]: { status: "pending" }}));
      const res = await callApi(s.id);
      completed++;
      setGlobalProgress(Math.round((completed/total)*100));
      setResults(prev => ({...prev, [s.id]: res}));
      return res;
    })());

    await Promise.all(promises);
    setLoading(false);
  };

  const cancelAll = () => {
    controllerRef.current?.abort();
    setLoading(false);
    setResults(prev => {
      const copy = {...prev};
      Object.keys(copy).forEach(k => { if(copy[k].status==="pending") copy[k].status="cancelled"; });
      return copy;
    });
  };

  const download = (url) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "cartoon.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const share = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileObj = new File([blob], "cartoon.png", { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [fileObj] })) {
        await navigator.share({ files: [fileObj], title: "My Cartoon" });
      } else {
        window.open(url, "_blank");
      }
    } catch {
      window.open(url, "_blank");
    }
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"Inter, system-ui, sans-serif"}}>
      <div style={{width:1100,maxWidth:"96%",display:"grid",gridTemplateColumns:"1fr 480px",gap:24}}>
        <div style={{padding:20,borderRadius:16,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.04)"}}>
          <h1 style={{margin:0,fontSize:28,fontWeight:800}}>AI Cartoon Studio — Pro</h1>
          <p style={{opacity:0.9}}>Upload 1 photo → get 4 stylized outputs. Download, share & compare.</p>

          <div style={{marginTop:12}}>
            <label style={{fontWeight:700,display:"block",marginBottom:8}}>Upload your photo</label>
            <input type="file" accept="image/*" onChange={onFile} />
          </div>

          <div style={{marginTop:14,display:"flex",gap:10}}>
            <button onClick={generateAll} disabled={loading || !file} style={{padding:"10px 16px",borderRadius:10,background:"#ffd166",color:"#111",fontWeight:800,cursor:"pointer"}}>
              {loading ? "Generating..." : "Generate all 4 styles"}
            </button>
            <button onClick={cancelAll} disabled={!loading} style={{padding:"10px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.06)",background:"transparent",color:"#fff"}}>
              Cancel
            </button>
          </div>

          <div style={{marginTop:12}}>
            <div style={{height:10,background:"rgba(255,255,255,0.06)",borderRadius:10,overflow:"hidden"}}>
              <div style={{width:`${globalProgress}%`,height:"100%",background:"linear-gradient(90deg,#ffd166,#ff7b7b)"}}/>
            </div>
            <div style={{marginTop:8,fontSize:13,opacity:0.85}}>Progress: {globalProgress}%</div>
          </div>

          {/* small preview */}
          {preview && (
            <div style={{marginTop:16,display:"flex",gap:12,alignItems:"center"}}>
              <img src={preview} style={{width:120,height:120,objectFit:"cover",borderRadius:12,border:"1px solid rgba(255,255,255,0.06)"}} />
              <div>
                <div style={{fontWeight:800}}>Uploaded</div>
                <div style={{opacity:0.85,fontSize:13,marginTop:6}}>Tip: use a clear portrait for best results</div>
              </div>
            </div>
          )}

          {/* per style status */}
          <div style={{marginTop:18,display:"grid",gap:8}}>
            {STYLES.map(s => {
              const r = results[s.id] || {};
              return (
                <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12, padding:10, borderRadius:10, background:"rgba(0,0,0,0.12)"}}>
                  <div style={{display:"flex",gap:12,alignItems:"center"}}>
                    <div style={{width:10,height:10,borderRadius:6,background: r.status==="done" ? "#4ade80" : r.status==="error" ? "#ff7b7b" : r.status==="pending" ? "#ffd166" : "rgba(255,255,255,0.06)"}} />
                    <div style={{fontWeight:700}}>{s.label}</div>
                    <div style={{opacity:0.75,fontSize:13,marginLeft:8}}>{r.status === "pending" ? "Rendering..." : r.status === "done" ? "Ready" : r.status === "error" ? "Failed" : ""}</div>
                  </div>

                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    {r.status==="pending" && <Spinner />}
                    {r.url && (
                      <>
                        <button onClick={()=>download(r.url)} style={{padding:"8px 10px",borderRadius:8, background:"#ffd166", color:"#111", fontWeight:700}}>Download</button>
                        <button onClick={()=>share(r.url)} style={{padding:"8px 10px",borderRadius:8, border:"1px solid rgba(255,255,255,0.06)", background:"transparent", color:"#fff"}}>Share</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{padding:18,borderRadius:12, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.04)"}}>
          <div style={{height:560, overflow:"auto"}}>
            {/* show gallery of results side-by-side */}
            {STYLES.map(s => {
              const r = results[s.id] || {};
              return (
                <div key={s.id} style={{marginBottom:18}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{fontWeight:800}}>{s.label}</div>
                    <div style={{fontSize:13,opacity:0.8}}>{r.status || "waiting"}</div>
                  </div>

                  {r.url ? (
                    <BeforeAfter before={preview} after={r.url} />
                  ) : (
                    <div style={{height:320,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.14)",borderRadius:10}}>
                      {r.status==="pending" ? <div style={{textAlign:"center"}}><Spinner /><div style={{marginTop:8}}>Rendering...</div></div> : <div style={{opacity:0.8}}>No result yet</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
