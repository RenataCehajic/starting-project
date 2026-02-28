"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Hello Renata my world again!!!!!!!</h1>
        <p className="text-6xl font-mono mt-8">{count}</p>
      </div>
    </div>
  );
}
