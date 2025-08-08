import { DEPTH_BOUND } from "../constants";
import { calculateScore, shouldPass, validateAndFlip } from "../logics";
import type { Player, State } from "../tyeps";

function maximize(currentState: State[], player: Player, depth: number): number {
    const opponent = player === 'b' ? 'w' : 'b';
    
    const { black, white } = calculateScore(currentState);
    const playerScore = player === 'b' ? black : white;
    const opponentScore = opponent === 'b' ? black : white;

    const playerPass = shouldPass(currentState, player);
    const opponentPass = shouldPass(currentState, opponent);

    const isGameOver = (black + white === 64) || (playerPass && opponentPass);

    if (isGameOver) {
        if (playerScore > opponentScore) {
            return Infinity;
        } else if (opponentScore > playerScore) {
            return -Infinity;
        } else {
            return 0;
        }
    }

    if (depth >= DEPTH_BOUND) {
        return playerScore;
    }

    let maxValue = -Infinity;
    
    for (let idx=0; idx < 64; idx++) {
        const possibleState: State[] | null = validateAndFlip(currentState, idx, player);
        if (possibleState !== null) {
            const value = minimize(possibleState, player, depth + 1);
            maxValue = Math.max(value, maxValue);
        }
    }

    return maxValue;
}

function minimize(currentState: State[], player: Player, depth: number): number {
    const opponent = player === 'b' ? 'w' : 'b';
    
    const { black, white } = calculateScore(currentState);
    const playerScore = player === 'b' ? black : white;
    const opponentScore = opponent === 'b' ? black : white;

    const playerPass = shouldPass(currentState, player);
    const opponentPass = shouldPass(currentState, opponent);

    const isGameOver = (black + white === 64) || (playerPass && opponentPass);

    if (isGameOver) {
        if (playerScore > opponentScore) {
            return Infinity;
        } else if (opponentScore > playerScore) {
            return -Infinity;
        } else {
            return 32;
        }
    }

    if (depth >= DEPTH_BOUND) {
        return playerScore;
    }

    let minValue = Infinity;

    for (let idx=0; idx < 64; idx++) {
        const possibleState: State[] | null = validateAndFlip(currentState, idx, opponent);
        if (possibleState !== null) {
            const value = maximize(possibleState, player, depth + 1);
            minValue = Math.min(value, minValue);
        }
    }

    return minValue;
}

export function minimax(currentState: State[], player: Player): number {
    let maxValue = -Infinity;
    let bestMove = -1;

    for (let idx=0; idx < 64; idx++) {
        const possibleState: State[] | null = validateAndFlip(currentState, idx, player);
        if (possibleState !== null) {
            const value = minimize(possibleState, player, 1);
            if (bestMove === -1 || value > maxValue) {
                maxValue = value;
                bestMove = idx;
            }
        }
    }

    return bestMove;
}