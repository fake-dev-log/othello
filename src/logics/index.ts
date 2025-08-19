import { DIRECTIONS, POSITIONAL_WEIGHTS } from "../constants";
import type {Player, PossibleMove, ScoreBoard, State, Winner} from "../types";


export function getFlippablePieces(board: State[], idx: number, player: Player): number[] {
    if (idx < 0 || idx >= 64 || board[idx]) {
        return [];
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

    return allPiecesToFlip;
}

export function validateAndFlip(board: State[], idx: number, player: Player): State[] | null {
    const allPiecesToFlip = getFlippablePieces(board, idx, player);

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
        if (board[idx] === null && getFlippablePieces(board, idx, player).length > 0) {
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

export function evaluateBoard(board: State[], player: Player): number {
    const opponent = player === 'b' ? 'w' : 'b';

    let playerScore = 0;
    let opponentScore = 0;

    for (let i = 0; i < 64; i++) {
        if (board[i] === player) {
          playerScore += POSITIONAL_WEIGHTS[i];
        } else if (board[i] === opponent) {
          opponentScore += POSITIONAL_WEIGHTS[i];
        }
    }

    return playerScore - opponentScore;
}

export function findPossibleMoves(board: State[], currentTurn: Player): PossibleMove[] {
    const possibleMoves: PossibleMove[] = [];
    for (let i = 0; i < 64; i++) {
        const piecesToFlip = getFlippablePieces(board, i, currentTurn);
        if (piecesToFlip.length > 0) {
            possibleMoves.push({ move: i, piecesToFlip });
        }
    }
    return possibleMoves;
}