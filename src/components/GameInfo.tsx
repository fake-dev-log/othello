import type { Player, ScoreBoard, Winner } from "../types";

export function GameInfo({ turn, scoreBoard, winner, message, restart, isAiThinking }: {
  turn: Player,
  scoreBoard: ScoreBoard,
  winner: Winner | null,
  message: string,
  isAiThinking: boolean,
  restart: () => void
}) {
    const isBlackTurn = turn === 'b';
    
    return (
        <div className="w-full max-w-md lg:max-w-lg p-4 mt-4 bg-gray-800 text-white rounded-lg shadow-xl">
            <div className="flex justify-between items-center text-lg sm:text-xl font-bold">
                <div className={`p-2 rounded-md transition-all duration-300 ${isBlackTurn ? 'bg-white text-gray-800 shadow-lg' : ''}`}>
                    Black: {scoreBoard.black}
                </div>

                <div className="p-2 rounded-md">
                    <button
                        className="bg-amber-600 hover:bg-amber-500 text-white text-md font-bold py-3 px-6 mt-4 rounded-lg transition-colors duration-200"
                        onClick={restart}
                    >
                        Restart
                    </button>
                </div>

                <div className={`p-2 rounded-md transition-all duration-300 ${!isBlackTurn ? 'bg-white text-gray-800 shadow-lg' : ''}`}>
                    White: {scoreBoard.white}
                </div>
            </div>
            <div className="mt-4 text-center text-xl h-8 justify-between">
                {winner ? (
                    <span className="font-bold text-amber-600">{winner === 'Draw' ? "Draw!" : `${winner} wins!`}</span>
                ) : isAiThinking? (
                    <span className="font-bold text-blue-400 animate-pulse">AI is thinking...</span>
                ) : (
                    <span>{message || `${isBlackTurn ? 'Black' : 'White'}'s turn`}</span>
                )}
            </div>
        </div>
    );
}