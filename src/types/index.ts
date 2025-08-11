export type Player = 'b' | 'w';
export type State = null | Player;
export type Winner = 'Black' | 'White' | 'Draw';
export type ScoreBoard = { black: number, white: number };