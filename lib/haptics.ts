// Haptic feedback where supported (mobile). All calls are guarded + silent.
function vibrate(pattern: number | number[]) {
  if (typeof window === "undefined") return;
  try {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
  } catch {
    // unsupported — ignore
  }
}

export const haptics = {
  light: () => vibrate(10),
  medium: () => vibrate(20),
  success: () => vibrate([15, 40, 15]),
  heavy: () => vibrate([30, 30, 60]),
  legendary: () => vibrate([20, 40, 20, 40, 100]),
  byRarity: (rarity: "common" | "rare" | "epic" | "legendary") => {
    if (rarity === "legendary") vibrate([20, 40, 20, 40, 100]);
    else if (rarity === "epic") vibrate([20, 30, 60]);
    else if (rarity === "rare") vibrate([15, 40, 15]);
    else vibrate(15);
  },
};
