import type { AiWorkerMessage } from "../types";
import { findBestMove } from "../algorithms/abPruning.ts";

self.onmessage = (e: MessageEvent<AiWorkerMessage>) => {
  const { board, player } = e.data;
  const startTime = performance.now();

  const bestMove = findBestMove(board, player, startTime);

  self.postMessage(bestMove);
}