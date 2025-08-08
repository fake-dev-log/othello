import type { Player, State } from "../tyeps/index";
import {POSITIONAL_WEIGHT} from "../constants/index";

export function evaluateBoard(board: State[], player: Player): number {
    const opponent = player === 'b' ? 'w' : 'b';

    let playerScore = 0;
    let opponentScore = 0;

    for (let i = 0; i < 64; i++) {
        if (board[i] === player) {
          playerScore += POSITIONAL_WEIGHT[i];
        } else if (board[i] === opponent) {
          opponentScore += POSITIONAL_WEIGHT[i];
        }
    }

    return playerScore - opponentScore;
}