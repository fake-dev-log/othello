const INITIAL_SQUARES = Array(64).fill(null);
    INITIAL_SQUARES[27] = 'w';
    INITIAL_SQUARES[28] = 'b';
    INITIAL_SQUARES[35] = 'b';
    INITIAL_SQUARES[36] = 'w';

const DIRECTIONS = [-9, -8, -7, -1, 1, 7, 8, 9];

const DEPTH_BOUND = 4;

export {
    INITIAL_SQUARES,
    DIRECTIONS,
    DEPTH_BOUND
}