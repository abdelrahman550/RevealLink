import * as React from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `true` only after the client has hydrated.
 *
 * The idiomatic way to gate theme-dependent (or otherwise browser-only) UI
 * without calling `setState` inside an effect: the server snapshot is `false`,
 * the client snapshot is `true`, and React reconciles the two during hydration.
 */
export function useHydrated(): boolean {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
