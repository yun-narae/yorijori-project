// src/lib/realtime.js
import pb from "./pocketbase";

let connected = false;
export function ensureRealtime() {
  if (connected) return;
  connected = true;
  pb.realtime.connect();
}
