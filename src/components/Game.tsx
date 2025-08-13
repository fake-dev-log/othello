import { useCallback, useEffect, useMemo, useState } from "react";
import { Board } from "./Board";
import type { ScoreBoard, Player, State, Winner } from "../types";
import { calculateScore, determineWinner, shouldPass, validateAndFlip } from "../logics";
import { INITIAL_SQUARES } from "../constants";
import { GameInfo } from "./GameInfo";
import { mcts } from "../algorithms/mcts";

export default function Game() {
    const [ history, setHistory ] = useState<State[][]>([INITIAL_SQUARES]);
    const [ currentMove, setCurrentMove ] = useState(0);
    const [ message, setMessage ] = useState('');
    const [ winner, setWinner ] = useState<Winner | null>(null);
    const [ aiPlayer, setAIPlayer ] = useState<Player>(Math.random() > 0.5 ? 'b' : 'w');

    const isGameOver = !!winner;
    const currentSquares = history[currentMove];
    const turn: Player = currentMove % 2 === 0 ? 'b' : 'w';

    const scoreBoard: ScoreBoard = useMemo(() => calculateScore(currentSquares), [currentSquares]);

    const handlePlay = useCallback((idx: number) => {
        if (isGameOver || currentSquares[idx]) {
            return;
        }

        const nextSquares = validateAndFlip(currentSquares, idx, turn)
        
        if (nextSquares === null) {
            setMessage('You cannot place a stone there.');
            setTimeout(() => setMessage(''), 2000);
            return;
        }

        setMessage('');
        let nextMove = currentMove + 1;
        const newHistory = [...history.slice(0, currentMove + 1), nextSquares];
        let finalBoard = nextSquares;

        const nextPlayer: Player = nextMove % 2 === 0 ? 'b' : 'w';

        if (shouldPass(nextSquares, nextPlayer)) {
            if (shouldPass(nextSquares, turn)) {
                 setTimeout(() => {
                    const finalScore = calculateScore(finalBoard);
                    setWinner(determineWinner(finalScore));
                    setMessage('Game Over. Both players must pass.');
                }, 800);
            } else {
                setMessage(`${nextPlayer === 'b' ? 'Black' : 'White'} must pass. Your turn again!`);
                nextMove++;
                newHistory.push(nextSquares);
                finalBoard = nextSquares;
            }
        }

        setHistory(newHistory);
        setCurrentMove(nextMove);

        const newScore = calculateScore(finalBoard);
        if (newScore.black + newScore.white === 64) {
            setTimeout(() => {
                setWinner(determineWinner(newScore));
                setMessage('Game Over. The board is full.');
            }, 800);
        }
    
    }, [currentMove, currentSquares, history, isGameOver, turn]);

    const playAI = useCallback((board: State[]) => {
        const bestMove = mcts(board, aiPlayer);
        
        if (bestMove !== null) {
            handlePlay(bestMove);
        }
    }, [aiPlayer, handlePlay])

    function restart() {
        setHistory([INITIAL_SQUARES]);
        setCurrentMove(0);
        setMessage('');
        setWinner(null);
        setAIPlayer(Math.random() > 0.5 ? 'b' : 'w');
    }

    useEffect(() => {
        if (!isGameOver && aiPlayer === turn) {
            const aiTimeout = setTimeout(() => {
                playAI(currentSquares);
            }, 1000);
            return () => clearTimeout(aiTimeout)
        }
    }, [aiPlayer, currentSquares, isGameOver, playAI, turn])

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center font-sans p-4">
            <h1 className="text-4xl font-bold mb-4">Othello Game</h1>
            <Board
                squares={currentSquares}
                onPlay={handlePlay}
                disabled={isGameOver}
            />
            <GameInfo
                turn={turn}
                scoreBoard={scoreBoard}
                winner={winner}
                message={message}
                restart={restart}
            />
        </div>
    )
}