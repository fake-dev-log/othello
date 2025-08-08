const INITIAL_SQUARES = Array(64).fill(null);
    INITIAL_SQUARES[27] = 'w';
    INITIAL_SQUARES[28] = 'b';
    INITIAL_SQUARES[35] = 'b';
    INITIAL_SQUARES[36] = 'w';

const DIRECTIONS = [-9, -8, -7, -1, 1, 7, 8, 9];

const DEPTH_BOUND = 4;

const POSITIONAL_WEIGHT: number[] = [
    120, -20, 20,  5,  5, 20, -20, 120,
    -20, -40, -5, -5, -5, -5, -40, -20,
    20,  -5, 15,  3,  3, 15,  -5,  20,
    5,  -5,  3,  3,  3,  3,  -5,  5,
    5,  -5,  3,  3,  3,  3,  -5,  5,
    20,  -5, 15,  3,  3, 15,  -5,  20,
    -20, -40, -5, -5, -5, -5, -40, -20,
    120, -20, 20,  5,  5, 20, -20, 120,
];

export {
    INITIAL_SQUARES,
    DIRECTIONS,
    DEPTH_BOUND,
    POSITIONAL_WEIGHT
}