"use client";
import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState(null);
  const [output, setOutput] = useState([]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("image", image);

    const res = await fetch("/api/generate", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    console.log(json);

    if (json.images) {
      setOutput(json.images);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <button onClick={handleUpload}>
        Generate Cartoon
      </button>

      {output.map((img, i) => (
        <img
          key={i}
          src={img.startsWith("data:")
            ? img
            : `data:image/png;base64,${img}`}
          style={{ width: 300, border: "2px solid yellow" }}
        />
      ))}
    </div>
  );
}
