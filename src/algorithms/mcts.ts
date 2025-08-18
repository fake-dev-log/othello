import {calculateScore, determineWinner, getFlippablePieces, shouldPass, validateAndFlip} from "../logics";
import type { Player, PossibleMove, State } from "../types";
import {POSITIONAL_WEIGHTS, TIME_LIMIT} from "../constants";

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

function selectMoveByWeight(possibleMoves: PossibleMove[]): PossibleMove {
    // 최소 가중치를 찾음
    const minWeight = Math.min(...possibleMoves.map(m => POSITIONAL_WEIGHTS[m.move]));
    // 최소 가중치가 0이하 일 때는 1로 변환. 양수일 경우에는 그대로 사용할 수 있도록 함.
    const offset = minWeight <= 0 ? -minWeight + 1 : 0;

    const weightedMoves = possibleMoves.map(m => ({
        ...m,
        weight: POSITIONAL_WEIGHTS[m.move] + offset,
    }));

    const totalWeight = weightedMoves.reduce((sum, m) => sum + m.weight, 0);

    // 0과 가중치 총 합 사이의 수를 하나 뽑음.
    let randomValue = Math.random() * totalWeight;

    // 착수 가능한 수들을 순회하면서,
    for (const move of weightedMoves) {
        // 0과 가중치 총 합 사이의 임의의 수에서 각 착수 가능점의 가중치를 빼줌.
        randomValue -= move.weight;
        // 최초로 0 이하가 되는 착수점 선택.
        if (randomValue <= 0) {
            return move;
        }
    }

    // 예외적인 상황 대비 마지막 수 반환
    return weightedMoves[weightedMoves.length - 1];
}

function rollout(node: Node) {
    const player = node.player;
    const board = node.board.slice();

    let currentTurn = node.player;

    while (!isGameOver(board)) {
        const possibleMoves: PossibleMove[] = [];
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

        // const { move, piecesToFlip } = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        const { move, piecesToFlip } = selectMoveByWeight(possibleMoves);
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
            if (node.children.length === 0) {
                node.children = findNextChildren(node);
            }
            if (node.children.length > 0) {
                node = node.children[0];
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