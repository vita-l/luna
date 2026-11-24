"use client";

/*
  A piece of app state that every screen can read, and that is saved on the device.
  Used for the pet (Feed) and the food (Food). Later, accounts can replace the saving part.
*/
import { createContext, useContext, useEffect, useState } from "react";
import type { z } from "zod";
import { loadSaved, save } from "@/lib/storage";

export function createSavedStore<T extends object>(options: {
  /** Change the version in the key when the saved shape changes, so old saves are ignored */
  key: string;
  schema: z.ZodType<T>;
  initial: () => T;
  /** Fix saved data that no longer fits the app (for example, a renamed life stage) */
  repair?: (saved: T) => T;
}) {
  /** Change some fields. Pass a function to start from the very latest values. */
  type Update = (patch: Partial<T> | ((current: T) => Partial<T>)) => void;
  const Ctx = createContext<{ state: T; update: Update } | null>(null);

  function Provider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<T>(options.initial);
    const [loaded, setLoaded] = useState(false);

    // Read what was saved last time (only in the browser, after the page appears)
    useEffect(() => {
      const saved = loadSaved(options.key, options.schema);
      if (saved) setState(options.repair ? options.repair(saved) : saved);
      setLoaded(true);
    }, []);

    // Save every change. Not before loading has finished, or the empty start values
    // would be written over what was saved.
    useEffect(() => {
      if (loaded) save(options.key, state);
    }, [state, loaded]);

    const update: Update = (patch) =>
      setState((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }));
    return <Ctx.Provider value={{ state, update }}>{children}</Ctx.Provider>;
  }

  function useStore() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error(`The "${options.key}" store is used outside its Provider`);
    return ctx;
  }

  return { Provider, useStore };
}
