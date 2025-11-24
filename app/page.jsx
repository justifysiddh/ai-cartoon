import React, { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const generateImages = async () => {
    if (!file) return;

    setLoading(true);
    setGeneratedImages([]);

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/api/generate", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    console.log("API Response:", data);

    setGeneratedImages(data.images); // ARRAY
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>AI Cartoon Generator</h2>

      <input type="file" onChange={handleUpload} />
      <button onClick={generateImages}>Generate 4 Styles</button>

      {loading && <p>Processing...</p>}

      <div style={{ display: "flex", flexWrap: "wrap", marginTop: "20px" }}>
        {generatedImages.map((img, index) => (
          <img
            key={index}
            src={
              img.startsWith("http")
                ? img
                : `data:image/png;base64,${img}`
            }
            alt="Generated"
            style={{
              width: "200px",
              height: "200px",
              objectFit: "cover",
              margin: "10px",
              borderRadius: "10px",
            }}
          />
        ))}
      </div>
    </div>
  );
}
