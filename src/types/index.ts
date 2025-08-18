export type Player = 'b' | 'w';
export type State = null | Player;
export type Winner = 'Black' | 'White' | 'Draw';
export type ScoreBoard = { black: number, white: number };
export type MctsWorkerMessage = { board: State[], player: Player };
export type PossibleMove = { move: number, piecesToFlip: number[] };