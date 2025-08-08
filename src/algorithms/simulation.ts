import {INITIAL_SQUARES} from "../constants/index";
import {calculateScore, shouldPass, validateAndFlip} from "../logics/index";
import type { Player, State } from "../tyeps/index";
import {minimax} from "./minimax";

console.log(`Minimax simulation started.`);

let simpleAiWins = 0;
let enhancedAiWins = 0;
let draws = 0;
const TOTAL_GAMES = 30;

for (let i = 0; i < TOTAL_GAMES; i++) {
    console.log(`\n--- Game ${i + 1} / ${TOTAL_GAMES} ---`);

    const enhancedAiPlayer: Player = i % 2 === 0 ? 'b' : 'w';
    const simpleAiPlayer: Player = i % 2 === 0 ? 'w' : 'b';
    console.log(`Simple AI: ${simpleAiPlayer.toUpperCase()}, Enhanced AI: ${enhancedAiPlayer.toUpperCase()}`);

    let board: State[] = [...INITIAL_SQUARES];
    let currentTurn: Player = 'b';
    let moveCount = 0;

    while (true) {
        const { black, white } = calculateScore(board);
        if (black + white === 64 || (shouldPass(board, 'b') && shouldPass(board, 'w'))) {
            console.log(`Game ended at move ${moveCount}.`);
            if (black > white) {
                if (enhancedAiPlayer === 'b') enhancedAiWins++;
                else simpleAiWins++;
                console.log(`Winner: Black (${black} vs ${white})`);
            } else if (white > black) {
                if (enhancedAiPlayer === 'w') enhancedAiWins++;
                else simpleAiWins++;
                console.log(`Winner: White (${white} vs ${black})`);
            } else {
                draws++;
                console.log(`Draw (${black} vs ${white})`);
            }
            break;
        }

        if (shouldPass(board, currentTurn)) {
            currentTurn = currentTurn === 'b' ? 'w' : 'b';
            continue;
        }

        let bestMove: number;
        if (currentTurn === simpleAiPlayer) {
            bestMove = minimax(board, simpleAiPlayer, false);
        } else {
            bestMove = minimax(board, enhancedAiPlayer, true);
        }

        if (bestMove !== -1) {
            board = validateAndFlip(board, bestMove, currentTurn)!;
        } else {
            console.error("Error: minimax returned -1 despite not having to pass.");
            break; 
        }

        currentTurn = currentTurn === 'b' ? 'w' : 'b';
        moveCount++;
    }
}

console.log(`\n--- Minimax Simulation Ended ---`);
console.log(`Simple AI Wins: ${simpleAiWins}`);
console.log(`Enhanced AI Wins: ${enhancedAiWins}`);
console.log(`Draws: ${draws}`);