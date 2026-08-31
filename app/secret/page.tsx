"use client";

import dynamic from "next/dynamic";

const SecretCampfireScene = dynamic(() => import("./SecretCampFireScene"), {
  ssr: false,
});

export default function SecretPage() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "black",
      }}
    >
      <SecretCampfireScene onClose={() => window.history.back()} />
    </div>
  );
}
