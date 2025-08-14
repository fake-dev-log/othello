const INITIAL_SQUARES = Array(64).fill(null);
    INITIAL_SQUARES[27] = 'w';
    INITIAL_SQUARES[28] = 'b';
    INITIAL_SQUARES[35] = 'b';
    INITIAL_SQUARES[36] = 'w';

const POSITIONAL_WEIGHTS = [
    100, -25,  10,   5,   5,  10, -25, 100,
    -25, -25,   1,   1,   1,   1, -25, -25,
     10,   1,   5,   2,   2,   5,   1,  10,
      5,   1,   2,   1,   1,   2,   1,   5,
      5,   1,   2,   1,   1,   2,   1,   5,
     10,   1,   5,   2,   2,   5,   1,  10,
    -25, -25,   1,   1,   1,   1, -25, -25,
    100, -25,  10,   5,   5,  10, -25, 100,
];

const DIRECTIONS = [-9, -8, -7, -1, 1, 7, 8, 9];

const DEPTH_BOUND = 7;

const TIME_LIMIT = 5000;

export {
    INITIAL_SQUARES,
    POSITIONAL_WEIGHTS,
    DIRECTIONS,
    DEPTH_BOUND,
    TIME_LIMIT,
}