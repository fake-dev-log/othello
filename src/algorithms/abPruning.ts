import { DEPTH_BOUND } from "../constants";
import { calculateScore, evaluateBoard, shouldPass, validateAndFlip } from "../logics";
import type {State, Player} from "../tyeps"

function minimaxABRecursive(
    board: State[],
    player: Player,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: Player
): number {
    const { black, white } = calculateScore(board);
    const blackPass = shouldPass(board, 'b');
    const whitePass = shouldPass(board, 'w');

    if (depth === 0 || black + white === 64 || (blackPass && whitePass)) {
        return evaluateBoard(board, maximizingPlayer);
    }

    const opponent = player === 'b' ? 'w' : 'b';
    if (shouldPass(board, player)) {
        return minimaxABRecursive(board, opponent, depth - 1, alpha, beta, maximizingPlayer);
    }

    const isMaximizigPlayer = player === maximizingPlayer;
    let bestValue = isMaximizigPlayer ? -Infinity : Infinity;

    for (let idx = 0; idx < 64; idx++) {
        const nextBoard = validateAndFlip(board, idx, player);
        if (nextBoard) {
            const value = minimaxABRecursive(nextBoard, opponent, depth - 1, alpha, beta, maximizingPlayer);

            if (isMaximizigPlayer) {
                bestValue = Math.max(bestValue, value);
                alpha = Math.max(alpha, bestValue);
                if (beta <= alpha) {
                    break;
                }
            } else {
                bestValue = Math.min(bestValue, value);
                beta = Math.min(beta, bestValue);
                if (beta <= alpha) {
                    break;
                }

            }
        }
    }

    return bestValue;
}

export function findBestMove(board: State[], player: Player): number {
    let alpha = -Infinity;
    const beta = Infinity;
    let bestMove = -1;

    const possibleMoves: { move: number, states: State[] }[] = [];
    for (let idx = 0; idx < 64; idx++) {
        const states = validateAndFlip(board, idx, player)
        if (states) {
            possibleMoves.push({
              move: idx,
              states: states
            });
        }
    }

    if (possibleMoves.length === 0) {
        return -1;
    }

    const opponent = player === 'b' ? 'w' : 'b';

    for (const { move, states } of possibleMoves) {
        const value = minimaxABRecursive(states, opponent, DEPTH_BOUND, alpha, beta, player);

        if (value > alpha) {
            alpha = value;
            bestMove = move;
        }
    }

    if (bestMove === -1) {
        return possibleMoves[0].move;
    }

    return bestMove;
}
