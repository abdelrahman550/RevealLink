"use client";

import * as React from "react";
import { Provider } from "react-redux";

import { makeStore, type AppStore } from "./index";

/** One store per server request, created lazily on the client's first render. */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = React.useState<AppStore>(makeStore);

  return <Provider store={store}>{children}</Provider>;
}
