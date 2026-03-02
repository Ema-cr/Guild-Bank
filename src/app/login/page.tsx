"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const users = [
  { name: "Zanahorio", icon: "/zanahorio.jpg.png" },
  { name: "Skull", icon: "/skull.jpg.png" },
  { name: "Morcilla", icon: "/morcilla.jpg.png" },
];

export default function LoginPage() {
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);

  const handleLogin = async (userName: string) => {
    setLoadingUser(userName);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/bank");
      } else {
        setError(data.error || "Failed to log in");
        setLoadingUser(null);
      }
    } catch (err) {
      setError("An unexpected error occurred connecting to the server.");
      setLoadingUser(null);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 w-full h-full object-cover opacity-100"
        style={{ filter: "brightness(0.8) contrast(1.05)" }}
      >
        <source src="/video-fondo.mp4" type="video/mp4" />
      </video>


      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl p-8 mx-4">

        <div className="text-center mb-12 animate-fade-in-down">
          <h1
            className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-amber-600 drop-shadow-lg tracking-wider uppercase"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Banco de los Gordos
          </h1>
          <p className="mt-3 text-amber-200/80 text-lg font-medium tracking-wide">
            Quien meta cosas al banco de la guild pongalo acá también para tener el seguimiento de las cosas.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/50 border border-red-500/50 text-red-200 text-center backdrop-blur-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* User Selection - icon only */}
        <div className="flex justify-center gap-6">
          {users.map((user) => (
            <button
              key={user.name}
              onClick={() => handleLogin(user.name)}
              disabled={loadingUser !== null}
              className="relative p-0 bg-transparent border-none outline-none cursor-pointer"
              style={{ width: "64px", height: "64px", borderRadius: "4px", overflow: "visible" }}
              onMouseEnter={(e) =>
                setTooltip({ name: user.name, x: e.clientX, y: e.clientY })
              }
              onMouseMove={(e) =>
                setTooltip({ name: user.name, x: e.clientX, y: e.clientY })
              }
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Icon + blue hover overlay */}
              <div className="group relative w-16 h-16 overflow-hidden" style={{ borderRadius: "4px" }}>
                <Image src={user.icon} alt={user.name} fill className="object-cover" />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                  style={{
                    border: "2px solid #4fc3f7",
                    boxShadow: "0 0 10px 2px rgba(79,195,247,0.6), inset 0 0 8px rgba(79,195,247,0.25)",
                    borderRadius: "4px",
                  }}
                />
              </div>

              {/* Loading spinner */}
              {loadingUser === user.name && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60" style={{ borderRadius: "4px" }}>
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* WoW-style Tooltip — minimal, like "Fuego solar" */}
      {tooltip && (
        <div
          className="pointer-events-none"
          style={{
            position: "fixed",
            left: tooltip.x + 14,
            top: tooltip.y - 8,
            zIndex: 9999,
            transform:
              tooltip.x > window.innerWidth - 200 ? "translateX(-110%)" : "none",
          }}
        >
          <div
            style={{
              background: "#0a0a0f",
              border: "1px solid #1c2a3a",
              outline: "1px solid #000",
              borderRadius: "2px",
              padding: "5px 10px",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                color: "#ffffff",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              {tooltip.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
