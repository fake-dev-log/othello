import {INITIAL_SQUARES} from "../constants";
import {calculateScore, shouldPass, validateAndFlip} from "../logics";
import {minimax} from "./minimax";

console.log(`Minimax simulation started.`);

const minimaxWin = { b: 0, w: 0 };
const enhancedWin = { b: 0, w: 0 };
let draw = 0;

for (let i = 0; i < 30; i++) {
    console.log(`Game ${i+1} started.`)
    const player = Math.random() > 0.5 ? 'b' :'w';
    const opponent = player === 'b' ? 'w' : 'b';

    let board = INITIAL_SQUARES;
    let isGameOver = false;
    let move = 0;

    while (!isGameOver) {
        const playerShouldPass = shouldPass(board, player);
        const opponentShouldPass = shouldPass(board, opponent);

        const { black, white } = calculateScore(board);

        if ((playerShouldPass && opponentShouldPass) || black + white === 64) {
            console.log(`Game ${i+1} ended.`)
            const playerScore = player === 'b' ? black : white;
            const opponentScore = opponent === 'b' ? black : white;

            if (playerScore > opponentScore) {
                minimaxWin[player]++;
                console.log(`Minimax ${player} wins.`)
            } else if (opponentScore > playerScore) {
                enhancedWin[opponent]++;
                console.log(`Enhanced ${opponent} wins.`)
            } else {
                draw++;
                console.log(`Draw - Minimax ${player} ${playerScore} : Enhanced ${opponent} ${opponentScore}`)
            }
            isGameOver = true;
            break;
        }

        const isPlayerTurn = (player === 'b' && move % 2 === 0) || (player === 'w' && move % 2 !== 0);
        if (isPlayerTurn && !playerShouldPass) {
            const idx = minimax(board, player);
            const newBoard = validateAndFlip(board, idx, player);
            if (newBoard !== null) {
                board = newBoard;
            }
        } else if (!isPlayerTurn && !opponentShouldPass) {
            const idx = minimax(board, opponent, true);
            const newBoard = validateAndFlip(board, idx, opponent);
            if (newBoard !== null) {
                board = newBoard;
            }
        }
        move++;
    }
}

console.log(`Minimax simulation ended`);
console.log();
console.log(`Minimax wins: ${minimaxWin}`);
console.log(`Enhanced wins: ${enhancedWin}`);
console.log(`Draw: ${draw}`);