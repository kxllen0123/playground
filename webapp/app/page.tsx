"use client";

import { useState, FormEvent } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [echo, setEcho] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setEcho(input);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md space-y-8 p-8">
        <div>
          <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-50">
            Echo
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type something..."
              className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Submit
          </button>

          {echo && (
            <div className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <p className="text-zinc-900 dark:text-zinc-50">
                Hi: {echo}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
