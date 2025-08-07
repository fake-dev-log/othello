import { DIRECTIONS } from "../constants";
import type { Player, ScoreBoard, State, Winner } from "../tyeps";

export function validateAndFlip(board: State[], idx: number, player: Player): State[] | null {
    if (idx < 0 || idx >= 64 || board[idx]) {
        return null;
    }

    const opponent: Player = player === 'b' ? 'w' : 'b';
    const allPiecesToFlip: number[] = [];

    for (const direction of DIRECTIONS) {
        const piecesToFlipInDir: number[] = [];
        let currentPos = idx + direction;

        if (Math.abs((idx % 8) - (currentPos % 8)) > 1) {
            continue;
        }

        while (currentPos >= 0 && currentPos < 64) {
            if (Math.abs((currentPos % 8) - ((currentPos - direction) % 8)) > 1) {
                break;
            }

            const square = board[currentPos];

            if (square === opponent) {
                piecesToFlipInDir.push(currentPos);
            } else if (square === player) {
                allPiecesToFlip.push(...piecesToFlipInDir);
                break;
            } else {
                break;
            }
            currentPos += direction;
        }
    }

    if (allPiecesToFlip.length === 0) {
        return null;
    }

    const newBoard = [...board];
    newBoard[idx] = player;
    allPiecesToFlip.forEach(p => newBoard[p] = player);
    return newBoard;
}

export function shouldPass(board: State[], player: Player): boolean {
    for (let idx = 0; idx < 64; idx++) {
        if (board[idx] === null && validateAndFlip(board, idx, player) !== null) {
            return false;
        }
    }
    return true;
}

export function calculateScore(board: State[]): ScoreBoard {
    return board.reduce((score, cell) => {
        if (cell === 'b') score.black++;
        else if (cell === 'w') score.white++;
        return score;
    }, { black: 0, white: 0 });
}

export function determineWinner(score: ScoreBoard): Winner {
    if (score.black > score.white) return 'Black';
    if (score.white > score.black) return 'White';
    return 'Draw';
}
