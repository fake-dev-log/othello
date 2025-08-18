import {TIME_LIMIT} from "../constants";
import {calculateScore, evaluateBoard, getFlippablePieces, shouldPass} from "../logics";
import type {State, Player} from "../types"

function minimaxABRecursive(
    board: State[],
    player: Player,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: Player,
    start?: number
): number {
    const now = performance.now();
    const { black, white } = calculateScore(board);
    const opponent = player === 'b' ? 'w' : 'b';

    const playerPass = shouldPass(board, player);
    const opponentPass = shouldPass(board, opponent);

    if ((start && now - start > TIME_LIMIT) || depth === 0 || black + white === 64 || (playerPass && opponentPass)) {
        return evaluateBoard(board, maximizingPlayer);
    }

    if (playerPass) {
        return minimaxABRecursive(board, opponent, depth - 1, alpha, beta, maximizingPlayer, start);
    }

    const isMaximizingPlayer = player === maximizingPlayer;
    let bestValue = isMaximizingPlayer ? -Infinity : Infinity;

    for (let idx = 0; idx < 64; idx++) {
        const piecesToFlip = getFlippablePieces(board, idx, player);

        if (piecesToFlip.length > 0) {
            board[idx] = player;
            piecesToFlip.forEach(p => board[p] = player);

            const value = minimaxABRecursive(board, opponent, depth - 1, alpha, beta, maximizingPlayer, start);

            board[idx] = null;
            piecesToFlip.forEach(p => board[p] = opponent);

            if (isMaximizingPlayer) {
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
        if (isMaximizingPlayer && beta <= alpha) break
    }

    return bestValue;
}

export function findBestMove(board: State[], player: Player, start: number): number {
    const opponent = player === 'b' ? 'w' : 'b';

    const possibleMoves: { move: number, piecesToFlip: number[] }[] = [];
    for (let idx = 0; idx < 64; idx++) {
        const piecesToFlip = getFlippablePieces(board, idx, player);
        if (piecesToFlip.length > 0) {
            possibleMoves.push({
              move: idx,
              piecesToFlip: piecesToFlip
            });
        }
    }

    if (possibleMoves.length === 0) {
        return -1;
    }

    const moveValueMap: { [move: number]: number } = {};
    possibleMoves.forEach(({ move, piecesToFlip}) => {
        board[move] = player;
        piecesToFlip.forEach(p => board[p] = player);

        moveValueMap[move] = minimaxABRecursive(board, opponent, 3, -Infinity, Infinity, player);

        board[move] = null;
        piecesToFlip.forEach(p => board[p] = opponent);
    });
    possibleMoves.sort((a, b) => moveValueMap[b.move] - moveValueMap[a.move]);

    let finalBestMove = possibleMoves[0].move;

    for (let depth = 1; depth < 64; depth++) {
        let alpha = -Infinity;
        const beta = Infinity;
        let currentBestMoveForDepth = -1;

        for (const {move, piecesToFlip} of possibleMoves) {
            if (performance.now() - start >= TIME_LIMIT) {
                currentBestMoveForDepth = -1;
                break;
            }

            board[move] = player;
            piecesToFlip.forEach(p => board[p] = player);

            const value = minimaxABRecursive(board, opponent, depth, alpha, beta, player, start);

            board[move] = null;
            piecesToFlip.forEach(p => board[p] = opponent);

            if (value > alpha) {
                alpha = value;
                currentBestMoveForDepth = move;
            }
        }

        if (performance.now() - start < TIME_LIMIT) {
            finalBestMove = currentBestMoveForDepth;
        } else {
            break;
        }
    }

    return finalBestMove;
}
