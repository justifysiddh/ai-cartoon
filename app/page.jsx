import React, { useState } from "react"; import Image from "next/image";

export default function Page() { const [preview, setPreview] = useState(null);

return ( <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">

{/* Cinematic glowing circles */}
  <div className="absolute w-96 h-96 bg-pink-500/30 blur-3xl rounded-full -top-20 -left-20 animate-pulse"></div>
  <div className="absolute w-96 h-96 bg-purple-500/30 blur-3xl rounded-full -bottom-20 -right-20 animate-pulse"></div>

  <div className="backdrop-blur-2xl bg-white/10 p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-white/20 animate-[fadeIn_1s_ease]">
    <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg tracking-wide">
      🎨 AI Cartoon Maker
    </h1>
    <p className="text-lg mb-6 opacity-90">
      Upload your photo and watch magic happen ✨
    </p>

    <input
      type="file"
      accept="image/*"
      onChange={(e) => setPreview(URL.createObjectURL(e.target.files[0]))}
      className="w-full text-sm text-white file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:font-semibold file:bg-white/30 file:text-white hover:file:bg-white/50 cursor-pointer"
    />

    <button className="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-yellow-300 to-pink-400 text-black font-bold text-xl shadow-xl hover:scale-105 transition-all duration-300">
      Generate Cartoon 🪄
    </button>

    {preview && (
      <div className="mt-6">
        <Image
          src={preview}
          alt="Preview"
          width={300}
          height={300}
          className="rounded-2xl shadow-lg border border-white/20"
        />
      </div>
    )}

    <div className="mt-6 text-sm opacity-80">
      ✅ Fast | ✅ Free | ✅ No Signup
    </div>
  </div>
</div>

); }
