import { calculateScore, determineWinner, shouldPass, validateAndFlip } from "../logics";
import type { Player, State } from "../tyeps";

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

    if (black + white === 64 || (isBPass && isWPass)) {
        return true;
    }
    
    return false;
}

function findNextChildren(node: Node): Node[] {
    const nextPlayer = node.player === 'b' ? 'w' : 'b';
    const actions: Node[] = [];
    for (let idx = 0; idx < 64; idx++) {
        const newBoard = validateAndFlip(node.board, idx, node.player);
        if (newBoard !== null) {
            actions.push({
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
    return actions;
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
    let board = node.board.slice();

    let currentTurn = node.player;

    while (!isGameOver(board)) {
        const possibleMoves: number[] = [];
        for (let i = 0; i < 64; i++) {
            if (validateAndFlip(board, i, currentTurn)) {
                possibleMoves.push(i);
            }
        }

        if (possibleMoves.length === 0) {
            currentTurn = currentTurn === 'b' ? 'w' : 'b';
            continue;
        }

        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        board = validateAndFlip(board, randomMove, currentTurn)!;
        currentTurn = currentTurn === 'b' ? 'w' : 'b';
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

export function mcts(board: State[], player: Player, timeLimit: number = 5000) {
    const root: Node = {
        parent: null,
        move: null,
        board: board,
        player: player,
        value: 0,
        visit: 0,
        children: [],
    }

    const start = performance.now();
    while (performance.now() - start < timeLimit) {
        let node: Node = root;

        while (node.children.length > 0 && !isGameOver(node.board)) {
            node = select(node);
        }

        if (!isGameOver(node.board)) {
            if (node.visit > 0) {
                if (node.children.length === 0) {
                    node.children = findNextChildren(node);
                } else {
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