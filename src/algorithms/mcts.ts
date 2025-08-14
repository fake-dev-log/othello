import {calculateScore, determineWinner, getFlippablePieces, shouldPass, validateAndFlip} from "../logics";
import type { Player, State } from "../types";
import {TIME_LIMIT} from "../constants";

interface Node {
    parent: Node | null;
    move: number | null;
    board: State[];
    player: Player;
    value: number;
    visit: number;
    children: Node[];
}

function isGameOver(board: State[]): boolean {
    const { black, white } = calculateScore(board);
    const isBPass = shouldPass(board, 'b');
    const isWPass = shouldPass(board, 'w');

    return black + white === 64 || (isBPass && isWPass);
}

function findNextChildren(node: Node): Node[] {
    const nextPlayer = node.player === 'b' ? 'w' : 'b';
    const children: Node[] = [];
    for (let idx = 0; idx < 64; idx++) {
        const newBoard = validateAndFlip(node.board, idx, node.player);
        if (newBoard !== null) {
            children.push({
                parent: node,
                move: idx,
                board: newBoard,
                player: nextPlayer,
                value: 0,
                visit: 0,
                children: [],
            })
        }
    }
    return children;
}

function select(node: Node, explorationConstant = Math.SQRT2): Node {
    let bestChild: Node | null = null;
    let maxUcb = -Infinity;

    for (const child of node.children) {
        if (child.visit === 0) {
            return child;
        }

        // 부모 입장에서 자식(상태 차례)의 가치를 평가하므로 음수
        const winRate = -child.value / child.visit;

        const ucb = winRate + explorationConstant * Math.sqrt(Math.log(node.visit) / child.visit)
        
        if (bestChild === null || ucb > maxUcb) {
            bestChild = child;
            maxUcb = ucb;
        }
    }

    return bestChild!;
}

function rollout(node: Node) {
    const player = node.player;
    const board = node.board.slice();

    let currentTurn = node.player;

    while (!isGameOver(board)) {
        const possibleMoves: { move: number, piecesToFlip: number[] }[] = [];
        for (let i = 0; i < 64; i++) {
            const piecesToFlip = getFlippablePieces(board, i, currentTurn);
            if (piecesToFlip.length > 0) {
                possibleMoves.push({ move: i, piecesToFlip });
            }
        }

        if (possibleMoves.length === 0) {
            currentTurn = currentTurn === 'b' ? 'w' : 'b';
            continue;
        }

        const { move, piecesToFlip } = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        const opponent = currentTurn === 'b' ? 'w' : 'b';

        board[move] = currentTurn;
        piecesToFlip.forEach(p => board[p] = currentTurn);

        currentTurn = opponent;
    }

    const winner = determineWinner(calculateScore(board));

    switch (winner) {
        case "Draw": return 0;
        case "Black": return player === 'b' ? 1 : -1;
        case "White": return player === 'w' ? 1 : -1;
    }
}

function backPropagate(node: Node, value: number) {
    let tempNode: Node | null = node;
    while (tempNode !== null) {
        tempNode.value += value;
        tempNode.visit++;
        tempNode = tempNode.parent;
    }
}

export function findBestMove(board: State[], player: Player, start: number): number | null {
    const root: Node = {
        parent: null,
        move: null,
        board: board,
        player: player,
        value: 0,
        visit: 0,
        children: [],
    }
    while (performance.now() - start < TIME_LIMIT) {
        let node: Node = root;

        while (node.children.length > 0 && !isGameOver(node.board)) {
            node = select(node);
        }

        if (!isGameOver(node.board)) {
            if (node.visit > 0) {
                if (node.children.length === 0) {
                    node.children = findNextChildren(node);
                }
                if (node.children.length > 0) {
                    node = node.children[0];
                }
            }
        }
        const value = rollout(node);

        backPropagate(node, value);
    }

    let bestMove: number | null = null;
        let maxVisit = -1;
        for (const child of root.children) {
            if (child.visit > maxVisit) {
                maxVisit = child.visit;
                bestMove = child.move;
            }
        }

    return bestMove;
}