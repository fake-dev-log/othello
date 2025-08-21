import {
    calculateScore,
    determineWinner,
    getFlippablePieces,
    shouldPass,
    validateAndFlip
} from "../logics";
import type {Player, PossibleMove, State} from "../types";
import {POSITIONAL_WEIGHTS, RAVE_EQUIVALENCE, TIME_LIMIT} from "../constants";

interface Node {
    parent: Node | null;
    move: number | null;
    board: State[];
    player: Player;

    value: number;
    visit: number;

    raveValue: number;
    raveVisit: number;

    children: Node[];
}

interface RolloutResult {
    value: number,
    playedMoves: Set<number>;
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

                raveValue: 0,
                raveVisit: 0,

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

        const mctsWinRate = child.value / child.visit;

        let raveWinRate = 0.5;
        if (child.raveVisit > 0) {
            raveWinRate = child.raveValue / child.raveVisit;
        }

        const beta = Math.sqrt(RAVE_EQUIVALENCE / (3 * child.visit + RAVE_EQUIVALENCE));

        const combinedWinRate = (1 - beta) * mctsWinRate + beta * raveWinRate;

        const ucb = combinedWinRate + explorationConstant * Math.sqrt(Math.log(node.visit) / child.visit)
        
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

function rollout(node: Node): RolloutResult {
    const player = node.player;
    const board = node.board.slice();

    let currentTurn = node.player;

    const playedMoves = new Set<number>();

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
        playedMoves.add(move);

        const opponent = currentTurn === 'b' ? 'w' : 'b';

        board[move] = currentTurn;
        piecesToFlip.forEach(p => board[p] = currentTurn);

        currentTurn = opponent;
    }

    const winner = determineWinner(calculateScore(board));
    let value = 0;
    switch (winner) {
        case "Draw": value = 0; break;
        case "Black": value =  player === 'b' ? 1 : -1; break;
        case "White": value = player === 'w' ? 1 : -1; break;
    }

    return { value, playedMoves }
}

function backPropagate(node: Node, result: RolloutResult) {
    const { value, playedMoves } = result;
    let tempNode: Node | null = node;
    while (tempNode !== null) {
        // tempNode.player는 해당 노드에서 수를 둘 플레이어를 의미.
        // value는 자식 노드(node)의 관점에서 계산되었으므로,
        // 부모 노드(tempNode)의 value를 업데이트할 때는 부호를 뒤집어주어야 함
        tempNode.value -= value;
        tempNode.visit++;

        for (const child of tempNode.children) {
            // 만약 자식의 수가 이번 시뮬레이션에 등장했다면
            if (playedMoves.has(child.move!)) {
                // child.player는 child 노드에서 수를 둘 플레이어.
                // value는 자식 노드(node)의 관점에서 계산.
                // child.player와 node.player는 같으므로 부호를 그대로 사용.
                child.raveValue += value;
                child.raveVisit++;
            }
        }

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

        raveValue: 0,
        raveVisit: 0,

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

        const result = rollout(node);

        backPropagate(node, result);
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