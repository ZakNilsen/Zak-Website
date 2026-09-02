"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SecretStarryNightScene = dynamic(() => import("./SecretStarryNightScene"), {
  ssr: false,
});

export default function SecretPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    window.setTimeout(() => {
      router.push("/");
    }, 100);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        minHeight: "100vh",
        overflow: "hidden",
        background: "black",
      }}
    >
      <SecretStarryNightScene onClose={handleClose} />
    </div>
  );
}
