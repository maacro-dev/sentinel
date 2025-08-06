import { ProfilerOnRenderCallback } from "react";

export const profilerCallback: ProfilerOnRenderCallback = (id, phase, actualDuration) => {
  if (phase === "update") return;
  if (phase === "nested-update" && actualDuration < 5) return;
  console.log(`[${id}] ${phase} render took ${actualDuration.toFixed(2)}ms`);
};
