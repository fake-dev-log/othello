import type {MctsWorkerMessage} from "../types";
import {findBestMove} from "../algorithms/mcts.ts";

self.onmessage = (e: MessageEvent<MctsWorkerMessage>) => {
  const { board, player } = e.data;
  const startTime = performance.now();

  const bestMove = findBestMove(board, player, startTime);

  self.postMessage(bestMove);
}