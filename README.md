# 오셀로(Othello) AI

## 목차

1. [프로젝트 개요](#프로젝트-개요)

2. [기술스택](#기술스택)

3. [게임 화면 및 플레이 링크](#게임-화면)

4. [게임 규칙](#게임규칙)

5. [Version 1. 최대최소 탐색](#version-1-최대최소-탐색minimax-search)

6. [Version 2. 위치 가중치 맵 적용](#version-2-위치-가중치-맵positional-weight-map-적용)

7. [Version 3. 알파-베타 가지치기($\alpha$-$\beta$ pruning) 적용](#version-3-알파-베타-가지치기alpha---beta-pruning-적용)

8. [Version 4. 무브 오더링(Move Ordering)을 통한 탐색 가속](#version-4-무브-오더링move-ordering을-통한-탐색-가속)

9. [Version 5. 비동기 AI와 새로운 패러다임: MCTS vs. IDDFS-αβ](#version-5-비동기-ai와-새로운-패러다임-mcts-vs-iddfs-αβ)

10. [Version 6. MCTS 강화: 가중치 기반 시뮬레이션 (Lightweight Rollout)](#version-6-mcts-강화-가중치-기반-시뮬레이션-lightweight-rollout)

11. [Version 7. MCTS Rollout 심화 실험 및 한계 분석](#version-7-mcts-rollout-심화-실험-및-한계-분석)

## 프로젝트 개요

이 프로젝트는 React와 TypeScript를 사용하여 만든 오셀로(리버시) 게임으로, Minimax 알고리즘을 기반으로 한 인공지능(AI)의 다양한 전략과 최적화 기법을 탐구한다.

## 기술스택

<table style="text-align: center">
  <tr>
    <td>
      <img height=50 src="./images/react.svg" />
    </td>
    <td>
      <img height=50 src="./images/typescript.svg" />
    </td>
    <td>
      <img height=50 src="./images/vite.svg" />
    </td>
    <td>
      <img height=50 src="./images/tailwind_css.svg" />
    </td>
  </tr>
  <tr>
    <td>
      React
    </td>
    <td>
      TypeScript
    </td>
    <td>
      Vite
    </td>
    <td>
      Tailwind CSS
    </td>
  </tr>
</table>

## 게임 화면

![Othello Game](./images/othello.png)

## [Click to play](https://fake-dev-log.github.io/othello/)

## 게임규칙

1. 빈 칸에 어떤 돌이 놓였을 때, 가로, 세로, 대각선 방향에 같은 색의 돌이 이미 놓여있고, 그 사이에 다른 색의 돌이 있다면 다른 색의 돌을 같은 색의 돌로 바꾼다. 이를 간단히 '돌을 뒤집는다'고 한다.
2. 돌을 뒤집을 때는 새로 놓인 돌의 가로, 세로, 대각선 방향 각각에서 가장 가까운 같은 색의 돌 사이를 범위로 한다. 즉 [-,w,w,b,w,w,b,-] 과 같은 상황에서 첫번째 빈칸(-)에 돌을 놓는 경우, [b,b,b,b,w,w,b,-] 이다. 가로, 세로, 대각선 모두에서 뒤집을 수 있는 돌이 있다면 모두 뒤집는다.
3. 각 경기자는 흑과 백 중 하나의 색을 부여받고, 흑의 선수로 서로 번갈아 가며 상대의 돌을 뒤집을 수 있는 위치에 자신의 돌을 놓는다.
4. 돌을 놓을 공간이 없다면 차례를 상대에게 넘긴다.
5. 두 경기자 모두가 착수할 곳이 없다면 자신의 색의 돌이 많은 경기자가 이긴다.

## Version 1. 최대최소 탐색(Minimax Search)

### 1. 알고리즘 개요

1. 인공지능은 승리시 최대 보상, 패배시 최소 보상을 얻으며, 비길 경우 0의 보상을 얻는다.
2. 기본적인 최대최소 탐색을 통해 게임이 종료되거나 깊이 제한(=4)에 도달할 때까지 가능한 상태를 탐색한다.
3. 상태 평가 함수는 현재 상태에서 내 돌과 상대돌의 개수 차이를 평가 기준으로 사용하였다. (그러나 오셀로 게임의 경우 중요한 자리가 있고, 거기에 대한 가중치를 반영해야 한다. 추후 개선한다.)
4. AI는 착수 가능한 상태 중, 자신의 보상을 최대화하는(maximize) 상태를 탐색하여 다음수를 선택한다.
5. 그러나 상대 역시 자신의 보상을 최대화 하는 탐색을 수행하여 다음 수를 계산한다. 이 때 상대의 보상 최대화는 AI의 입장에서는 보상의 최소화(minimize) 탐색이다.
6. 즉, AI의 보상 최대화는 상대의 대응에 따른 보상 최소화를 반영하여 선택된다. 마찬가지로 상대의 대응에 따른 보상 최소화는 다시 AI의 반응에 따른 보상 최대화를 반영한다.
7. 위와 같이 내가 두는 수에 대한 상대의 대응, 그리고 그에 대한 나의 반응을 게임 트리 형태로 깊이 우선 탐색(DFS)을 수행하여 최선의 수를 반환한다.

### 2. 구현

#### 1. 평가 함수

게임이 종료되지 않은 경우 게임의 현 상태를 평가하여야 한다.

가장 단순하게 게임판 위에 놓인 돌의 개수를 통해 점수를 판단했다.

그러나 전술하였듯 오셀로 게임에는 상대적으로 더 중요한 자리와 그렇지 않은 자리가 존재한다.

추후 게임판의 각 자리에 대한 가중치를 반영할 수 있도록 개선한다.

<details>
<summary> 평가 함수 코드 보기 (Click to expand) </summary>

```typescript
function calculateScore(board: State[]): ScoreBoard {
  return board.reduce((score, cell) => {
    if (cell === 'b') score.black++;
    else if (cell === 'w') score.white++;
    return score;
  }, { black: 0, white: 0 });
}
```

</details>

### 2. 최대탐색 함수

상태를 판단하여 게임이 종료되었다면 승자 판단을 통해 점수를 반환한다.

최대 깊이 제한에 도달했을 경우 상태 평가 함수에 따른 점수를 반환한다.

그외의 경우에는 AI의 입장에서 착수 가능한 지점을 탐색하여 가장 큰 보상을 반환한다.

이 때, 착수 가능 지점에 대한 보상 탐색은 상대의 대응(상대의 보상 최대화 = AI의 보상 최소화)을 통해 구해진다.

<details>
<summary> 최대탐색 함수 코드 보기 (Click to expand) </summary>

```typescript
// player는 AI를 의미한다.
function maximize(currentState: State[], player: Player, depth: number): number {
  const opponent = player === 'b' ? 'w' : 'b';

  // 현재 상태를 평가하여 점수를 구한다.
  const { black, white } = calculateScore(currentState);
  const playerScore = player === 'b' ? black : white;
  const opponentScore = opponent === 'b' ? black : white;

  const playerPass = shouldPass(currentState, player);
  const opponentPass = shouldPass(currentState, opponent);

  const isGameOver = (black + white === 64) || (playerPass && opponentPass);

  // 결과에 대한 보상 반환
  if (isGameOver) {
    if (playerScore > opponentScore) {
      return Infinity;
    } else if (opponentScore > playerScore) {
      return -Infinity;
    } else {
      return 0;
    }
  }

  if (depth >= DEPTH_BOUND) {
    return playerScore;
  }

  // 최대보상 초기화
  let maxValue = -Infinity;

  // 게임판 전체를 순회하며 착수 가능한 지점을 찾는다.
  for (let idx=0; idx < 64; idx++) {
    const possibleState: State[] | null = validateAndFlip(currentState, idx, player);
    // 착수 가능한 지점이 있을 경우,
    if (possibleState !== null) {
      // 상대가 자신의 보상을 최대화(나의 보상 최소화) 하는 대응을 고려하여 착수 지점의 보상을 계산한다.
      const value = minimize(possibleState, player, depth + 1);
      // 새로운 착수 지점의 보상이 더 큰 경우에는 최대보상을 갱신한다.
      maxValue = Math.max(value, maxValue);
    }
  }
  
  // 최대보상을 반환한다.
  return maxValue;
}
```

</details>

### 3. 최소탐색 함수

<details>
<summary> 최소탐색 함수 코드 보기 (Click to expand) </summary>

```typescript
// player는 AI를 의미한다. 결과 보상의 기준이 언제나 AI로 고정되어 있음에 유의해야 한다.
function minimize(currentState: State[], player: Player, depth: number): number {
  const opponent = player === 'b' ? 'w' : 'b';

  const { black, white } = calculateScore(currentState);
  const playerScore = player === 'b' ? black : white;
  const opponentScore = opponent === 'b' ? black : white;

  const playerPass = shouldPass(currentState, player);
  const opponentPass = shouldPass(currentState, opponent);

  const isGameOver = (black + white === 64) || (playerPass && opponentPass);

  if (isGameOver) {
    if (playerScore > opponentScore) {
      return Infinity;
    } else if (opponentScore > playerScore) {
      return -Infinity;
    } else {
      return 0;
    }
  }
  
  if (depth >= DEPTH_BOUND) {
    return playerScore;
  }

  // 최소보상 초기화
  let minValue = Infinity;

  for (let idx=0; idx < 64; idx++) {
    // 상대가 착수할 수 있는 지점을 찾는다.
    const possibleState: State[] | null = validateAndFlip(currentState, idx, opponent);
    // 상대가 착수할 수 있는 지점이 있는 경우,
    if (possibleState !== null) {
      // 해당 착수에 대한 AI의 반응에 따른 보상 극대화를 고려하여 착수 지점의 보상을 계산한다.
      const value = maximize(possibleState, player, depth + 1);
      // 최소보상 갱신
      minValue = Math.min(value, minValue);
    }
  }

  // 최소보상 반환
  return minValue;
}
```

</details>

### 4. 최대최소 탐색 함수

AI의 입장에서 상대(사람)의 최소화 탐색을 고려한 최대 탐색을 수행하여 최선의 착수 지점을 반환한다.

<details>
<summary> 최대최소 탐색 함수 코드 보기 (Click to expand) </summary>

```typescript
function minimax(currentState: State[], player: Player): number {
  // 최대보상 및 최선의 착수 지점 초기화
  let maxValue = -Infinity;
  let bestMove = -1;

  // 게임판 전체를 순회하며 착수 가능한 지점을 찾는다.
  for (let idx=0; idx < 64; idx++) {
    const possibleState: State[] | null = validateAndFlip(currentState, idx, player);
    
    // 착수 가능한 지점이 있을 경우,
    if (possibleState !== null) {
      // 상대의 대응을 고려하여 보상을 계산한다.
      const value = minimize(possibleState, player, 1);
      
      // 착수 가능한 지점이 초기화 상태이거나 해당 착수 지점의 보상이 현재의 최대보상보다 크다면 최대보상과 최선의 착수지점을 갱신한다.
      if (bestMove === -1 || value > maxValue) {
        maxValue = value;
        bestMove = idx;
      }
    }
  }

  // 최선의 착수지점 반환
  return bestMove;
}
```

</details>

## 3. 개선방안

### 1. 평가 함수 개선

앞서 기술하였듯이 오셀로에서는 전략적으로 더 중요한 자리와 덜 중요한 자리가 있다.

각 자리마다 가중치를 부여하고, 이를 통해 AI가 전략적으로 더 중요한 자리를 먼저 선택할 수 있도록 개선한다.

### 2. 네가맥스(Negamax) 변형

현재의 최대화 탐색과 최소화 탐색의 구조는 거의 똑같은 코드가 중복되고 있다.

현재 턴의 플레이어에게는 점수 최대화, 상대 턴에는 점수를 음수로 바꿔서 다시 극대화 문제를 적용하는 네가맥스(Negamax) 변형을 적용할 수 있다.

이를 통해 두 탐색 코드를 하나의 재귀함수로 합쳐서 간결하게 관리할 수 있다.

추후 네가맥스를 반영한다.

### 3. 알파-베타 가지치기

이전의 [삼목게임(tic-tac-toe)](https://github.com/fake-dev-log/minimax_machine)의 예에서 볼 수 있듯, 알파-베타 가지치기를 통해 탐색량을 크게 줄일 수 있다.

탐색량이 줄어든다면 동일한 시간동안 더 깊은 탐색이 가능하므로 더 좋은 선택을 할 수 있게 된다.

이후 알파-베타 가지치기 방법을 적용하여 알고리즘을 개선한다.

## Version 2. 위치 가중치 맵(Positional Weight Map) 적용

### 1. Version 1의 한계와 동기

Version 1의 단순 평가 함수를 사용하는 AI를 시뮬레이션한 결과,후공(백)이 일방적으로 승리하는 문제가 관찰되었다. 이는 단순 평가 함수(돌 개수 계산)가 AI의 전략적 깊이를 제한하는 한계를 가지고 있었기 때문이다. 이를 검증하기 위해 두 가지 가설을 세우고 순차적으로 실험을 진행했다.

- 가설 1: 기본적인 위치 전략(코너, 변 등)을 반영한 '임의의 가중치 맵'만으로도 단순 AI보다 나은 성능을 보일 것이다.

- 가설 2: 전문가의 선행 연구를 통해 검증된 가중치 맵은, 임의의 가중치 맵보다 더 뛰어난 성능을 보일 것이다.

### 2. 실험 1: 임의 가중치 맵 기반 AI 테스트

오셀로 게임을 살펴보면, 게임판의 네 귀퉁이에 놓인 돌은 어떠한 상황에서도 뒤집을 수 없으며, 연결된 변과 중앙을 공격할 수 있다. 반대로 네 귀퉁이와 인접한 칸들은 나는 귀퉁이에 돌을 놓을 수 없게 하면서도, 상대방이 귀퉁이에 돌을 놓을 수 있도록 해주는 위험한 자리이다.

이러한 자리들은 이미 오셀로 게임에서 [코너, X-Square, C-Square](https://namu.wiki/w/%EC%98%A4%EB%8D%B8%EB%A1%9C(%EB%B3%B4%EB%93%9C%EA%B2%8C%EC%9E%84)#s-5)로 불리며 젼략적으로 분석되어 있다.

#### 가. 가설 및 평가 함수 설정

첫 번째 실험을 위해, 오셀로의 기본적인 위치 전략(코너의 가치, X/C-Square의 위험성 등)을 바탕으로 '임의의 위치 가중치 맵'을 구성했다. 실제 가중치 맵 구성에는 Google의 Gemini 2.5 Pro의 도움을 받았다.

- 평가 방식: (자신의 돌이 놓인 칸의 가중치 합) - (상대 돌이 놓인 칸의 가중치 합)

<details>
<summary> 평가 함수 코드 보기 (Click to expand) </summary>

```typescript
function evaluateBoard(board: State[], player: Player): number {
    const opponent = player === 'b' ? 'w' : 'b';

    let playerScore = 0;
    let opponentScore = 0;

    // 모든 칸을 순회하며,
    for (let i = 0; i < 64; i++) {
        
        // 각 플레이어가 차지한 칸의 가중치를 통해 가치를 매긴다.
        if (board[i] === player) {
          playerScore += POSITIONAL_WEIGHTS[i];
        } else if (board[i] === opponent) {
          opponentScore += POSITIONAL_WEIGHTS[i];
        }
    }

    // 현재 플레이어를 기준으로 한 상대 가치 반환
    return playerScore - opponentScore;
}
```

</details>

<details>
<summary> 임의 가중치 맵 시각화 및 코드 보기 (Click to expand) </summary>

|       |  A  |  B  | C  | D  | E  | F  |  G  |  H  |
|:-----:|:---:|:---:|:--:|:--:|:--:|:--:|:---:|:---:|
| **1** | 120 | -20 | 20 | 5  | 5  | 20 | -20 | 120 |
| **2** | -20 | -40 | -5 | -5 | -5 | -5 | -40 | -20 |
| **3** | 20  | -5  | 15 | 3  | 3  | 15 | -5  | 20  |
| **4** |  5  | -5  | 3  | 3  | 3  | 3  | -5  |  5  |
| **5** |  5  | -5  | 3  | 3  | 3  | 3  | -5  |  5  |
| **6** | 20  | -5  | 15 | 3  | 3  | 15 | -5  | 20  |
| **7** | -20 | -40 | -5 | -5 | -5 | -5 | -40 | -20 |
| **8** | 120 | -20 | 20 | 5  | 5  | 20 | -20 | 120 |


```typescript
const ARBITRARY_POSITIONAL_WEIGHTS = [
    120, -20,  20,   5,   5,  20, -20, 120,
    -20, -40,  -5,  -5,  -5,  -5, -40, -20,
     20,  -5,  15,   3,   3,  15,  -5,  20,
      5,  -5,   3,   3,   3,   3,  -5,   5,
      5,  -5,   3,   3,   3,   3,  -5,   5,
     20,  -5,  15,   3,   3,  15,  -5,  20,
    -20, -40,  -5,  -5,  -5,  -5, -40, -20,
    120, -20,  20,   5,   5,  20, -20, 120,
];
```

</details>

#### 나. 시뮬레이션 결과 및 분석

| 탐색 깊이 (Depth) | 총 게임 수 | 향상된 AI 승리 | 단순 AI 승리 | 무승부 | 최종 승자    | 주요 관찰                                             |
|:--------------|:-------|:----------|:---------|:----|:---------|:--------------------------------------------------|
| 4             | 30     | 15        | 15       | 0   | 백(White) | 평가 함수와 무관하게 후공(백)이 반드시 승리.                        |
| 5             | 15     | 7         | 8        | 0   | 백(White) | 여전히 후공(백)이 반드시 승리. 가중치 AI가 질 때 더 큰 점수 차로 패배.      |
| 6             | 8      | 8         | 0        | 0   | 향상된 AI   | 평가 함수의 차이가 승패를 결정. 가중치 맵을 사용한 AI가 선공/후공과 무관하게 전승. |

**분석**: 얕은 탐색 깊이(4, 5)에서는 두 AI 모두 근시안적인 플레이를 하여, 평가 함수의 차이가 큰 의미를 갖지 못하고 후공(백)이 유리한 양상이 나타났다. 하지만 탐색 깊이가 6 이상으로 충분해지자, 기본적인 위치 가중치를 반영한 것만으로도 AI의 성능이 단순 AI를 압도함을 확인하여 가설1을 검증하였다.

### 3. 실험 2: 연구 기반 가중치 맵 AI 테스트

#### 가. 가설 및 평가 함수 설정

첫 번째 실험을 통해 가중치 맵의 효용성은 확인했지만, 더 정교하게 튜닝된 가중치 맵을 사용하면 더 얕은 탐색 깊이에서도 우위를 점할 수 있을 것이라는 가설 2를 검증하고자 했다. 이를 위해 여러 선행 연구[^1][^2][^3][^4]에서 공통적으로 인용되는 Yoshioka et al.의 Heuristic weights를 정수화하여 사용했다.

<details>
<summary> 연구 기반 가중치 맵 시각화 및 코드 보기 (Click to expand) </summary>

|       |  A  |  B  | C  | D | E | F  |  G  |  H  |
|:-----:|:---:|:---:|:--:|:-:|:-:|:--:|:---:|:---:|
| **1** | 100 | -25 | 10 | 5 | 5 | 10 | -25 | 100 |
| **2** | -25 | -25 | 1  | 1 | 1 | 1  | -25 | -25 |
| **3** | 10  |  1  | 5  | 2 | 2 | 5  |  1  | 10  |
| **4** |  5  |  1  | 2  | 1 | 1 | 2  |  1  |  5  |
| **5** |  5  |  1  | 2  | 1 | 1 | 2  |  1  |  5  |
| **6** | 10  |  1  | 5  | 2 | 2 | 5  |  1  | 10  |
| **7** | -25 | -25 | 1  | 1 | 1 | 1  | -25 | -25 |
| **8** | 100 | -25 | 10 | 5 | 5 | 10 | -25 | 100 |


```typescript
const RESEARCH_BASED_POSITIONAL_WEIGHTS = [
    100, -25,  10,   5,   5,  10, -25, 100,
    -25, -25,   1,   1,   1,   1, -25, -25,
     10,   1,   5,   2,   2,   5,   1,  10,
      5,   1,   2,   1,   1,   2,   1,   5,
      5,   1,   2,   1,   1,   2,   1,   5,
     10,   1,   5,   2,   2,   5,   1,  10,
    -25, -25,   1,   1,   1,   1, -25, -25,
    100, -25,  10,   5,   5,  10, -25, 100,
];
```

</details>

#### 나. 시뮬레이션 결과 및 분석

| 탐색 깊이 (Depth) | 총 게임 수 | 향상된 AI 승리 | 단순 AI 승리 | 무승부 | 최종 승자  | 주요 관찰                                     |
|:--------------|:-------|:----------|:---------|:----|:-------|:------------------------------------------|
| 4             | 30     | 30        | 0        | 0   | 향상된 AI | 향상된 AI가 큰 점수차로 승리(평균 40.5점 차).            |
| 5             | 16     | 16        | 0        | 0   | 향상된 AI | 여전히 향상된 AI가 승리하지만 점수 차가 좁혀짐(평균 5점 차).     |
| 6             | 8      | 8         | 0        | 0   | 향상된 AI | 여전히 향상된 AI가 승리하면서 다시 점수 차가 벌어짐(평균 33점 차). |

**분석**: 선행 연구 기반의 가중치 맵은 임의의 가중치 맵과 달리, 탐색 깊이 4라는 매우 얕은 수준에서부터 단순 AI를 압도했다. 이는 더 정교한 휴리스틱이 AI의 '직관'을 크게 향상시켜 적은 수읽기만으로도 훨씬 뛰어난 성능을 발휘하게 함을 의미한다. 가설2를 검증하였다.

### 4. 종합 결론 및 한계

두 번의 실험을 통해, 복잡한 전략 게임 AI의 성능은 평가 함수의 정교함과 탐색의 깊이라는 두 축이 함께 발전해야 함을 명확히 확인했다. 특히 잘 설계된 휴리스틱 평가 함수는 AI가 더 얕은 탐색 깊이에서도 강력한 성능을 발휘하게 하는 핵심 요인이었다.

또한 탐색 깊이 5에서 일시적으로 점수 차가 좁혀지는 현상은, 향상된 AI가 더 깊은 수(6수)를 내다볼 때 비로소 단기적인 교착 상태를 압도하는 장기적인 전략적 우위를 점할 수 있음을 보여준다. 이는 우수한 게임 AI는 단기 전술뿐만 아니라 게임 전체를 조망하는 전략적 시야를 갖추어야 함을 시사한다.

현재의 가장 큰 한계는 순수 Minimax 탐색의 엄청난 계산량이다. 이로 인해 실시간 게임에 적용하기에는 탐색 속도가 너무 느리다. 다음 단계에서는 알파-베타 가지치기($\alpha$-$\beta$ pruning)를 적용하여 불필요한 탐색을 줄이고, 새로 적용된 강력한 평가 함수를 실시간으로 활용할 수 있도록 최적화를 진행할 것이다.

### 참고문헌

[^1]: [Jaśkowski, Wojciech. "Systematic n-tuple networks for position evaluation: Exceeding 90% in the Othello league." arXiv preprint arXiv:1406.1509 (2014).](https://arxiv.org/pdf/1406.1509)

[^2]: [Lucas, Simon M. "Learning to play Othello with n-tuple systems." Australian Journal of Intelligent Information Processing 4 (2008): 1-20.](https://repository.essex.ac.uk/3820/1/NTupleOthello.pdf)

[^3]: [Van Der Ree, Michiel, and Marco Wiering. "Reinforcement learning in the game of Othello: Learning against a fixed opponent and learning from self-play." 2013 IEEE symposium on adaptive dynamic programming and reinforcement learning (ADPRL). IEEE, 2013.](https://www.ai.rug.nl/~mwiering/GROUP/ARTICLES/paper-othello.pdf)

[^4]: Yoshioka, Taku, Shin Ishii, and Minoru Ito. "Strategy acquisition for the game." IEICE TRANSACTIONS on Information and Systems 82.12 (1999): 1618-1626.

## Version 3. 알파-베타 가지치기($\alpha$ - $\beta$ pruning) 적용

### 1. Version 2의 한계와 최적화의 필요성

Version 2에서는 위치 가중치 맵을 통해 AI의 평가 함수를 크게 [개선했다](#4-종합-결론-및-한계). 이를 통해 AI는 더 전략적인 판단을 내릴 수 있게 되었으나, 순수 Minimax 탐색 방식의 근본적인 한계에 부딪혓다. 탐색 깊이가 깊어질수록 탐색해야 할 노드의 수가 기하급수적으로 증가하여 실시간 게임에 적용하기 어려울 만큼 계산량이 많고 시간이 오래 걸렸다.

따라서 이번 버전의 목표는 개선한 평가 함수를 실시간으로 활용할 수 있도록 알파-베타 가지치기($\alpha$-$\beta$ pruning) 기법을 적용하여 탐색 알고리즘을 최적화 하는 것이다.

### 2. 알파-베타 가지치기의 원리

[삼목 게임 프로젝트](https://github.com/fake-dev-log/minimax_machine?tab=readme-ov-file#2-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%9C%EC%9A%94)에서 기술하였듯, 알파-베타 가지치기의 핵심은 결과에 영향을 주지 않을 것이 명백한 가지(branch)를 평가하지 않고 잘라내는 것이다. 즉, 특정 분기를 탐색하던 중 이전에 발견한 수보다 나쁜 결과로 이어질 것이 확실해지면 해당 분기의 나머지 탐색을 즉시 중단한다. 이를 통해 불필요한 계산을 크게 줄여 동일한 시간 동안 더 깊은 수를 탐색할 수 있게 한다.

<details>
<summary> 알파-베타 가지치기 코드 보기(Click to expand) </summary>

```typescript
// 이전의 maximize 및 minimize 함수는 반복되는 코드를 공유하고 있었다.
// negamax를 참고하여 재귀적으로 호출하는 단일 함수로 리팩토링 하였다.
function minimaxABRecursive(
    board: State[],
    player: Player,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: Player
): number {
    const { black, white } = calculateScore(board);
    const blackPass = shouldPass(board, 'b');
    const whitePass = shouldPass(board, 'w');

    // 탐색 종료 조건: 깊이 도달 또는 게임 종료
    if (depth === 0 || black + white === 64 || (blackPass && whitePass)) {
        return evaluateBoard(board, maximizingPlayer);
    }

    const opponent = player === 'b' ? 'w' : 'b';

    //현재 플레이어가 둘 곳이 없다면 턴을 넘겨서 계속 탐색한다.
    if (shouldPass(board, player)) {
        return minimaxABRecursive(board, opponent, depth - 1, alpha, beta, maximizingPlayer);
    }

    // 현재 탐색이 최대화 노드인지 판단한다.
    const isMaximizigPlayer = player === maximizingPlayer;
    let bestValue = isMaximizigPlayer ? -Infinity : Infinity;

    for (let idx = 0; idx < 64; idx++) {
        const nextBoard = validateAndFlip(board, idx, player);
        if (nextBoard) {
            const value = minimaxABRecursive(nextBoard, opponent, depth - 1, alpha, beta, maximizingPlayer);

            if (isMaximizigPlayer) {
                // 최대화 노드: 더 좋은 수를 찾으면 알파를 갱신한다.
                bestValue = Math.max(bestValue, value);
                alpha = Math.max(alpha, bestValue);
                // 가지치기 조건: 이 분기에서는 현재까지 찾은 최선의 수보다
                // 더 좋은 결과를 얻을 수 없음이 확정된다.
                if (beta <= alpha) {
                    break;
                }
            } else {
                // 최소화 노드: 상대방의 더 좋은 수를 찾으면 베타 값을 갱신한다. 
                bestValue = Math.min(bestValue, value);
                beta = Math.min(beta, bestValue);
                // 가지치기
                if (beta <= alpha) {
                    break;
                }
            }
        }
    }

    return bestValue;
}
```

```typescript
// 최적의 수를 찾아내는 함수
function findBestMove(board: State[], player: Player): number {
    // 알파, 베타 및 착수점 초기화
    let alpha = -Infinity;
    const beta = Infinity;
    let bestMove = -1;

    // 추후 이 부분에서 Move Ordering을 적용하여 최적화 할 수 있다.
    const possibleMoves: { move: number, states: State[] }[] = [];
    for (let idx = 0; idx < 64; idx++) {
        const states = validateAndFlip(board, idx, player)
        if (states) {
            possibleMoves.push({
              move: idx,
              states: states
            });
        }
    }

    if (possibleMoves.length === 0) {
        return -1;
    }

    const opponent = player === 'b' ? 'w' : 'b';

    // 가능한 모든 수에 대해 탐색을 시작한다.
    for (const { move, states } of possibleMoves) {
        const value = minimaxABRecursive(states, opponent, DEPTH_BOUND, alpha, beta, player);

        // 최상위(root) 탐색은 항상 최대화 탐색이므로, 더 좋은 수를 찾으면 알파와 최적 착수점을 갱신한다.
        if (value > alpha) {
            alpha = value;
            bestMove = move;
        }
    }

    // 만약 유효한 수를 찾지 못했다면, 가능한 첫번째 수를 둔다.
    if (bestMove === -1) {
        return possibleMoves[0].move;
    }

    // 최적의 착수점 반환
    return bestMove;
}
```

</details>

### 3. 시뮬레이션 결과 및 분석

알파-베타 가지치기가 적용된 AI를 사용하여, AI가 스스로를 상대하는 시뮬레이션을 탐색 깊이 3부터 9까지 진행하였다.

#### 가. 주요 지표 요약

| 탐색 깊이 | 승자 | 최종 점수    | 흑 평균 탐색 노드 | 백 평균 탐색 노드 | 흑 평균 탐색 시간(초) | 백 평균 탐색 시간(초) |
|:------|:---|:---------|:-----------|:-----------|:--------------|:--------------|
| 3     | 흑  | 45 vs 19 | 1,289      | 1,262      | 0.004         | 0.004         |
| 4     | 흑  | 39 vs 25 | 4,631      | 4,628      | 0.013         | 0.013         |
| 5     | 흑  | 42 vs 22 | 20,127     | 19,892     | 0.053         | 0.055         |
| 6     | 백  | 30 vs 34 | 119,032    | 139,211    | 0.327         | 0.382         |
| 7     | 백  | 15 vs 49 | 258,919    | 285,770    | 0.685         | 0.771         |
| 8     | 백  | 29 vs 35 | 656,178    | 1,192,426  | 1.871         | 3.303         |
| 9     | 흑  | 36 vs 28 | 4,475,585  | 4,564,706  | 11.834        | 12.483        |

#### 나. 분석: 깊이에 따른 전략적 변곡점의 발견

이번 시뮬레이션에서 가장 흥미로운 점은 탐색 깊이에 따라 승자가 역전과 재역전을 반복했다는 사실이다.

- 얕은 탐색 (Depth 3-5): 흑(선공)의 우세

- 중간 깊이 탐색 (Depth 6-8): 백(후공)의 반격

- 깊은 탐색 (Depth 9): 흑(선공)의 재역전

탐색 깊이에 따라 근시안적 탐색과 그에 대한 응징, 그리고 다시 반격의 양상이 반복되는 것을 보면서 수읽기 깊이에 따른 선 후공의 유리함이 바뀌는 변곡점이 있다는 것을 알게 되었다.

#### 다. 활용

현재 게임에서는 시간 제한을 두고 있지 않지만, 실시간 게임에서 사용자의 착수에 대응해 5초 이내로 반응하는 것이 사용자 경험 측면에서 바람직하다고 판단했다. 만약 이보다 오랜 시간이 걸리는 상황에서 계산 중이라는 표시가 없다면 사용자가 시스템의 오류로 오인할 수 있기 때문이다.

시뮬레이션 결과, 탐색 깊이 7에서 가장 긴 탐색 시간(Longest Search Time)이 2초 내외로 기록되었다. 이는 백의 대응 전략을 활용할 수 있는 충분한 깊이이면서도 쾌적한 사용자 경험을 제공할 수 있는 절충안이다. 따라서 실제 게임에는 탐색 깊이 7을 적용하기로 결정했다.

### 4. 종합 결론 및 다음 과제

Version 3를 통해 알파-베타 가지치기를 성공적으로 적용하여 탐색 효율을 높일 수 있었다. 이에 따라 이전에는 불가능했던 깊이 9까지의 분석을 수행할 수 있었다. 그 결과, 탐색 깊이에 따라 AI의 게임 운영 전략이 질적으로 변화하며 승패가 뒤바뀌는 양상을 확인할 수 있었다.

하지만 여전히 탐색 성능을 개선할 여지가 남아있다. 알파-베타 가지치기의 효율은 어떤 수를 먼저 탐색하는지에 따라 크게 달라진다. 다음 Version 4에서는 유망한 수를 먼저 탐색하여 가지치기 효율을 더욱 극대화하는 무브 오더링(Move Ordering) 기법을 적용하여 AI의 탐색 효율을 한 단계 더 높일 것이다.

## Version 4. 무브 오더링(Move Ordering)을 통한 탐색 가속

### 1. Version 3의 한계와 동기

[Version 3](#version-3-알파-베타-가지치기alpha-beta-pruning-적용)에서 알파-베타 가지치기를 적용하여 탐색 효율을 크게 개선했지만, 여전히 '맹목적인' 탐색이라는 한계가 있었다. 알파-베타 가지치기 알고리즘은 어떤 순서로 수를 탐색하는지에 따라 성능이 크게 달라지는데, 최적의 수를 먼저 탐색할수록 더 많은 가지를 쳐낼 수 있기 때문이다. 그러나 이전 버전에서는 단순히 게임판 전체를 순서대로(인덱스 0~63) 탐색하여 이러한 장점을 제대로 활용하지 못했다.

따라서 이번 Version 4의 목표는 유망한 수를 먼저 탐색하도록 순서를 정렬(Move Ordering)하여 알파-베타 가지치기의 효율을 극대화하는 것이다.

### 2. 무브 오더링 전략 설계 및 실험

가지치기 효율을 비교하기 위해 세 가지 전략을 설계하고 성능을 비교하였다.

1. None(순차 탐색): 이전 버전과 동일하게 게임판을 순서대로 탐색하는 대조군으로 설정하였다.
2. Position(위치 가중치 기반 정렬): 일반적으로 오셀로를 플레이할 때 좋은 자리에 둘 수 있는지 먼저 생각해본다는 점에 착안하였다. Version 2에서 사용했던 [위치 가중치](#3-실험-2-연구-기반-가중치-맵-ai-테스트)가 높은 칸을 먼저 탐색도록 한 정적(Static) 정렬 방식을 적용했다.

<details>
<summary> Position 전략 코드 보기 (Click to expand) </summary>

```typescript
const possibleMoves: { move: number, states: State[] }[] = [];

// 보드를 순회하며 착수 가능한 지점을 찾는다.
for (let idx = 0; idx < 64; idx++) {
  const states = validateAndFlip(board, idx, player)
  if (states) {
    possibleMoves.push({
      move: idx,
      states: states
    });
  }
}

// 착수 가능한 지점의 위치 가중치(POSITIONAL_WEIGHTS)가 큰 순서대로 정렬한다.
possibleMoves.sort((a, b) => POSITIONAL_WEIGHTS[b.move] - POSITIONAL_WEIGHTS[a.move])
```

</details>

3. Intuition(얕은 탐색 기반 정렬): 게임을 많이 플레이하다 보면 깊이 수읽기를 하지 않아도 직관적으로 '좋은 자리'가 보인다는 점에서 착안했다. 모든 가능한 수에 대해 깊이 3의 얕은 탐색을 미리 수행하고, 그 평가값이 높은 순서대로 정렬하는 동적(Dynamic) 정렬 방식을 적용했다.

<details>
<summary> Intuition 전략 코드 보기 (Click to expand) </summary>

```typescript
const moveValueMap: { [move: number]: number } = {};
// 착수 가능한 점에 대해 얕은 깊이(3)로 가치를 판단하여 저장한다.
possibleMoves.forEach(({ move, states}) => moveValueMap[move] = minimaxABRecursive(states, opponent, 3, alpha, beta, player, { count: 0 }));
// 저장된 가치가 큰 순서대로 정렬한다.
possibleMoves.sort((a, b) => moveValueMap[b.move] - moveValueMap[a.move]);
```

</details>


### 3. 시뮬레이션 결과 및 분석

#### 가. 결과 요약

- **효율성(평균 탐색 노드 수)**

| 탐색 깊이 | None (순차) | Position (위치 가중치) | Intuition (얕은 탐색) | 효율성 순위                      |
|:------|:----------|:------------------|:------------------|:----------------------------|
| 3     | 1,075     | 825               | **817**           | Intuition > Position > None |
| 4     | 5,726     | 5,141             | **4,752**         | Intuition > Position > None |
| 5     | 21,912    | 17,357            | **15,724**        | Intuition > Position > None |
| 6     | 103,834   | **89,850**        | 91,879            | Position > Intuition > None |
| 7     | 369,598   | **320,732**       | 363,748           | Position > None > Intuition |
| 8     | 1,987,434 | 1,974,373         | **1,751,863**     | Intuition > Position > None |

- **상대전적(승리 횟수 - 패배 횟수)**

| 탐색 깊이 | None vs Position | None vs Intuition | Position vs Intuition | 특징              |
|:------|:-----------------|:------------------|:----------------------|:----------------|
| 3     | None이 2승         | 동률 (1승 1패)        | Intuition이 2승         | 동률의 경우 흑이 승리함.  |
| 4     | 동률 (1승 1패)       | 동률 (1승 1패)        | 동률 (1승 1패)            | 흑이 전부 승리.       |
| 5     | 동률 (1승 1패)       | None이 2승          | 동률 (1승 1패)            | 동률의 경우 흑이 승리함.  |
| 6     | None이 2승         | 동률 (1승 1패)        | 동률 (1승 1패)            |
| 7     | None이 2승         | 동률 (1승 1패)        | 동률 (1승 1패)            | 동률의 경우 흑이 승리함.  |
| 8     | 동률 (1승 1패)       | 동률 (1승 1패)        | Position이 2승          | 동률의 경우 흑이 승리함.  |

#### 나. 분석: 무브 오더링의 효율성 입증과 승패의 문제

실험 결과 무브 오더링의 효율성이 입증되었다. 탐색 깊이 7에서 Intuition이 None에 비해 약 1.6% 가량 평균 탐색량이 많았던 예외적인 경우를 제외하면, 무브 오더링을 적용한 전략이 대조군에 비해 효율적이었다. 특히 Intuition 전략은 탐색 깊이 6과 7을 제외한 나머지 4개 구간에서 가장 적은 노드를 탐색했으며, 탐색 깊이 5에서는 대조군에 비해 탐색 노드 수를 약 28% 가량 낮추었다. 얕은 탐색을 위한 추가적인 계산 비용을 감안하더라도 가지치기의 이득이 훨씬 크다고 볼 수 있다. 다만 탐색 깊이 6, 7에서 볼 수 있듯이, 특정 수준 또는 특정 게임의 국면에서는 보다 단순한 정적 휴리스틱(Position)이 더 효율적일 수 있다. 

또한 계산의 효율성이 반드시 승리로 이어지지는 않는다는 사실을 확인했다. 이는 Minimax 계열 알고리즘의 결정론적(Deterministic) 특성에서 기인한다. 세 전략은 모두 동일한 평가 함수를 공유하고 있으므로 효율성의 차이만 있을 뿐, 같은 탐색 깊이에 대해 '같은 결론'을 내린다. 다만 평가값이 동일한 최선의 수가 여러 개일 경우, 어떤 수를 먼저 검토하는지에 따라 최종 선택이 달라질 수 있다. 따라서 특정 전략이 상대적 우위를 보이는 것은 그 전략이 더 우월해서가 아니라, 그 전략의 동점자 처리 경향이 우연히 유리한 게임 경로를 선택했기 때문이다.

#### 다. 활용

Version 4에서는 전체적으로 균형잡힌 Intuition 전략을 적용한다. 현재 게임에 적용되어 있는 최대 탐색 깊이가 7이므로 해당 구간에서 Intuition 전략이 약간의 비효율성을 보이지만, 다른 대부분의 구간에서 가장 효율적이었고 상대 전적 또한 어느 한쪽에 치우치지 않는 안정적인 모습을 보여주었기 때문이다.

### 4. 종합 결론 및 다음 과제

무브 오더링은 알파-베타 탐색의 성능을 한 단계 끌어올리는 최적화 기법임을 확인했다. 특히 현재 국면을 반영하여 유망한 수를 동적으로 찾아내는 Intuition 전략이 효율성과 안정성 측면에서 균형잡힌 모습을 보여주었다. 그러나 특정 수준 또는 국면에서는 위치 가중치에 따른 정적 정렬 방식처럼 보다 단순한 전략이 더 효율적일 수 있다는 점도 발견했다.

이제 Minimax 계열 알고리즘의 최적화를 넘어, 보다 복잡한 몬테-카를로 트리 탐색(Monte-Carlo Tree Search, MCTS)을 게임에 적용하여 새로운 AI 알고리즘과 전략, 최적화에 대해 탐구해보고자 한다. 

## Version 5. 비동기 AI와 새로운 패러다임: MCTS vs. IDDFS-αβ

### 1. Version 4의 한계와 새로운 도전

[Version 4](#version-4-무브-오더링move-ordering을-통한-탐색-가속)에서는 무브 오더링을 통해 알파-베타 탐색의 효율성을 끌어올렸다. 하지만 두 가지 근본적인 한계가 있었다.

1. 평가 함수 의존성: Minimax 계열 알고리즘은 근본적으로 상태 평가 함수(Evaluation Function)의 성능에 크게 의존한다. 아무리 탐색을 잘하더라도 평가 함수가 국면의 유불리를 잘못 판단한다면 최선의 수를 놓칠 수밖에 없다.
2. UI 브로킹: 탐색 깊이가 깊어질수록 계산량이 기하급수적으로 늘어나 브라우저의 메인 스레드를 차단(Blocking)하여 UI가 멈추는 현상이 발생했다. 이는 사용자 경험에 치명적인 문제였다.

따라서 이번 Version 5에서는 세 가지 새로운 도전을 통해 이러한 한계를 극복하고자 한다.

- 새로운 탐색 패러다임 도입: 평가 함수에 의존하지 않고 무작위 시뮬레이션을 통해 수의 가치를 판단하는 몬테-카를로 트리 탐색(Monte-Carlo Tree Search, MCTS) 알고리즘을 도입한다.
- 공정한 비료를 위한 IDDFS-αβ 도입: MCTS는 '시간'을 기반으로 탐색하는 반면, 기존 알파-베타는 '고정된 깊이'로 탐색하여 직접 비교가 어려웠다. 공정한 대결을 위해, 알파-베타 알고리즘 역시 주어진 시간을 모두 활용해 동적으로 탐색 깊이를 늘리는 반복적 깊이 심화(Iterative Deepening Depth-First Search, IDDFS) 기법을 적용하여 알고리즘을 개선했다. 
- 비동기 처리와사용자 경험 개선: 무거운 AI 연산을 별도의 스레드에서 처리하는 웹 워커(Web Worker)를 적용하여 AI가 계산하는 동안에도 UI가 멈추지 않도록 개선한다.

### 2. 주요 개선 사항

#### 가. 몬테-카를로 트리 탐색(MCTS)의 도입

MCTS는 Minimax 계열 알고리즘과 전혀 다른 방식으로 최적의 수를 찾는다. 특정 국면의 좋고 나쁨을 고정된 가중치 맵으로 평가하는 대신, 해당 국면에서부터 게임이 끝날 때까지 수많은 무작위 시뮬레이션(이를 'Rollout' 또는 'Play-out'이라 함)을 실행한다. 그리고 그 승률 통계를 기반으로 어떤 수가 가장 유망한지 학습해 나간다.

MCTS는 크게 네 가지 단계를 반복하며 최선의 수를 찾아낸다.

1. 선택(Selection): 현재까지의 통계(승률)를 바탕으로 가장 유망해보이는 자식 노드를 선택하여 트리 아래로 이동한다.
2. 확장(Expansion): 선택된 노드에서 아직 탐색하지 않은 새로운 수를 찾아 트리를 확장한다.
3. 시뮬레이션(Simulation): 새로 확장된 노드에서부터 게임이 끝날 때까지 무작위로 수를 두어 승패를 결정한다.
4. 역전파(Backpropagation): 시뮬레이션의 승패 결과를 방금 탐색했던 경로를 따라 루트 노드까지 거슬러 올라가며 각 노드의 승리/시도 횟수 통계를 갱신한다.

<details>
<summary> MCTS 코드 보기 (Click to expand) </summary>

**선택 함수:** 선택 알고리즘은 UCT(Upper Confidence bound applied to Trees)를 사용하였다. 노드 $n_p$에서 자식노드들 중 하나를 선택할 때, 자식노드 $n_i$에서 신뢰도의 상한을 나타내는 UCB(Upper Confidence Bound)의 식은 다음과 같다.

$$ UCB(n_i) = \bar{v_i} + C \times \sqrt{\frac{\log{N_p}}{N_i}} $$

여기서 $\bar{v_i}$는 노드 ${n_i}$의 평균 승률(또는 가치)이고, $N_i$는 $n_i$의 방문횟수, $N_p$는 $n_i$의 부모노드의 방문횟수이다. $C$는 실험으로 조정해야 하는 상수이다.

```typescript
// 여기서 탐색 상수는 일반적으로 많이 사용하는 루트2를 사용했다.
function select(node: Node, explorationConstant = Math.SQRT2): Node {
    let bestChild: Node | null = null;
    let maxUcb = -Infinity;

    for (const child of node.children) {
        if (child.visit === 0) {
            return child;
        }

        // 부모 입장에서 자식(상태 차례)의 가치를 평가하므로 음수로 계산한다.
        // 가치는 승리 시 1, 무승부 시 0, 패배 시 -1 이다.
        const winRate = -child.value / child.visit;

        const ucb = winRate + explorationConstant * Math.sqrt(Math.log(node.visit) / child.visit)
        
        // ucb 값에 따라 최선의 자식 노드를 갱신한다.
        if (bestChild === null || ucb > maxUcb) {
            bestChild = child;
            maxUcb = ucb;
        }
    }
    
    // 최선의 자식 노드를 반환한다.
    return bestChild!;
}
```

**확장 함수**

```typescript
function findBestMove(board: State[], player: Player, start: number): number | null {
  // ...
  
  // 2. 확장 (Expansion)
  // 게임이 끝나지 않은 리프 노드에 도달했다면, 자식 노드를 생성(확장)함
  if (!isGameOver(node.board)) {
    if (node.visit > 0) { // 한 번이라도 방문한 노드만 확장
      if (node.children.length === 0) {
        node.children = findNextChildren(node);
      }
      if (node.children.length > 0) {
        node = node.children[0]; // 첫 번째 자식으로 이동
      }
    }
  }
  
  //...
}

```

```typescript
function findNextChildren(node: Node): Node[] {
  const nextPlayer = node.player === 'b' ? 'w' : 'b';
  const children: Node[] = [];
  // 게임판을 순회하며 확장 가능한 상태 확인
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
```

**시뮬레이션 함수**

```typescript
function rollout(node: Node) {
  const player = node.player;
  const board = node.board.slice();

  let currentTurn = node.player;

  // 게임의 끝까지
  while (!isGameOver(board)) {
    const possibleMoves: { move: number, piecesToFlip: number[] }[] = [];
    // 착수 가능한 점을 찾음
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

    // 임의의 점 선택
    const { move, piecesToFlip } = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    const opponent = currentTurn === 'b' ? 'w' : 'b';

    // 게임판 갱신
    board[move] = currentTurn;
    piecesToFlip.forEach(p => board[p] = currentTurn);

    currentTurn = opponent;
  }

  // 게임 종료시 승자 판단
  const winner = determineWinner(calculateScore(board));

  switch (winner) {
    case "Draw": return 0;
    case "Black": return player === 'b' ? 1 : -1;
    case "White": return player === 'w' ? 1 : -1;
  }
}
```

**역전파 함수**

```typescript
function backPropagate(node: Node, value: number) {
    let tempNode: Node | null = node;
    // 자기 자신의 정보를 갱신하고 루트 노드까지 부모 노드로 이동
    while (tempNode !== null) {
        tempNode.value += value;
        tempNode.visit++;
        tempNode = tempNode.parent;
    }
}
```

**최종 MCTS 함수**
```typescript
function findBestMove(board: State[], player: Player, start: number): number | null {
  // 루트 노드 갱신
  const root: Node = {
    parent: null,
    move: null,
    board: board,
    player: player,
    value: 0,
    visit: 0,
    children: [],
  }
  
  // 시간 제한 동안
  while (performance.now() - start < TIME_LIMIT) {
    // 1. 선택 (Selection)
    let node: Node = root;
    // 자식이 있고, 게임이 끝나지 않은 노드들 중에서 UCT 값이 가장 높은 자식을 따라 내려간다.
    while (node.children.length > 0 && !isGameOver(node.board)) {
      node = select(node);
    }

    // 2. 확장 (Expansion)
    // 게임이 끝나지 않은 리프 노드에 도달했다면, 자식 노드를 생성(확장)한다.
    if (!isGameOver(node.board)) {
      if (node.visit > 0) { // 한 번이라도 방문한 노드만 확장한다.
        if (node.children.length === 0) {
          node.children = findNextChildren(node);
        }
        node = node.children[0]; // 첫 번째 자식으로 이동한다.
      }
    }
    // 3. 시뮬레이션 (Rollout)
    const value = rollout(node);

    // 4. 역전파 (Backpropagation)
    backPropagate(node, value);
  }

  // 시뮬레이션 종료 후, 루트의 자식 중 가장 많이 방문된(가장 유망한 또는 강인한) 수를 선택한다.
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
```

</details>

이 과정을 주어진 시간동안 수없이 반복하면 승률이 높은 유망한 수에 대해 자연스럽게 탐색이 집중되고, 이를 통해 최적의 수를 찾아낼 수 있다.

#### 나. IDDFS-αβ
도입

IDDFS는 다음과 같은 아이디어에 기반한다.

- Depth 1까지 탐색해서 최선의 수를 찾는다.
- 시간이 남으면, Depth 2까지 다시 처음부터 탐색해서 최선의 수를 갱신한다.
- 시간이 또 남으면, Depth 3까지 다시 탐색한다.
- ...
- 이렇게 주어진 시간이 다 될 때까지 탐색 깊이를 1씩 늘려가며 반복한다. 시간이 다 되면, 마지막으로 성공적으로 탐색을 마친 깊이에서 찾은 최선의 수를 최종 결과로 사용한다.

따라서 구현 방법은 기존의 최적 착수점을 찾는 알고리즘에서 제한 시간내에 탐색 깊이를 하나씩 늘려가는 반복을 수행하면 된다. 

#### 다. 웹 워커(Web Worker)를 통한 UI 반응성 확보

기존 AI는 계산이 시작되면 완료될 때까지 메인 스레드를 점유하여 화면 업데이트나 사용자 입력 처리르 막았다. 이 문제를 해결하기 위해 웹 워커를 도입하여 AI 계산을 백그라운드 스레드로 분리했다.

**동작 흐름:**

1. 메인 스레드(/component/Game.tsx): AI의 차례가 되면, 현재 게임판의 상태(board)와 플레이어 정보(player)를 웹 워커에게 메시지(postMessage)로 전달하고, "AI is thinking..."이라는 UI를 표시한다.
2. 워커 스레드(/workers/mcts.ts): 메시지를 받아 MCTS 연산을 수행한다. 이 과정은 메인 스레드에 영향을 주지 않는다.
3. 워커 스레드(/workers/mcts.ts): 최적의 수를 찾으면, 그 결과를 다시 메인 스레드에 메시지(postMessage)로 보낸다.
4. 메인 스레드(/component/Game.tsx): 워커로부터 받은 최적의 수를 게임에 적용하고 "AI is thinking..." UI를 숨긴다.

이를 통해 AI가 아무리 복잡한 계산을 하더라도 사용자는 지연 없이 화면을 보거나 다른 메뉴를 조작할 수 있게 되어 사용자 경험이 크게 향상되었다.

<details>
<summary> 웹 워커 적용 코드 보기 (Click to expand) </summary>

Game.tsx(메인 스레드)

```typescript
// Game.tsx
// 워커를 생성하고, 메시지를 주고받는 로직

// ...
const workerRef = useRef<Worker | null>(null); // Web Worker 인스턴스를 저장하기 위해 useRef 사용

// 컴포넌트가 처음 마운트될 때 Web Worker를 생성한다.
useEffect(() => {
    // 워커 인스턴스 생성
    workerRef.current = new Worker(
      // src/workers 디렉토리에 파일이 있음에 유의한다.
      new URL("../workers/mcts.ts", import.meta.url), {type: 'module'}
    );

    // 워커로부터 메시지를 받았을 때의 처리
    workerRef.current.onmessage = (e: MessageEvent<number | null>) => {
        const bestMove = e.data;
        if (bestMove !== null) {
            handlePlay(bestMove);
        }
        setIsAiThinking(false); // 계산 종료 상태 반영
    }

    // 컴포넌트가 언마운트될 때 워커를 정리한다.
    return () => {
        workerRef.current?.terminate();
    }
}, [handlePlay]); // handlePlay가 변경될 때마다 이 효과를 다시 실행하지 않도록 의존성 배열을 신중하게 관리해야 한다. 
// handlePlay는 useCallback을 적용하여 불필요한 렌더링이 일어나지 않도록 했다.

useEffect(() => {
    // AI의 턴이 되면 워커에게 작업을 요청
    if (!isGameOver && aiPlayer === turn && workerRef.current) {
        setIsAiThinking(true); // 계산 중 상태로 변경
        // 워커에게 계산에 필요한 데이터를 메시지로 보낸다.
        workerRef.current.postMessage({
            board: currentSquares,
            player: aiPlayer,
        });
    }
}, [aiPlayer, currentSquares, handlePlay, isGameOver, turn])
// ...
```

mcts.ts(워커 스레드)
```typescript
// mcts.ts
// 워커에게 전달할 메세지의 타입을 미리 지정했다.
import type {MctsWorkerMessage} from "../types";
import {findBestMove} from "../algorithms/mcts.ts";

// 메인 스레드로부터 메시지를 받으면 AI 계산 시작
self.onmessage = (e: MessageEvent<MctsWorkerMessage>) => {
  const { board, player } = e.data;
  const startTime = performance.now();

  const bestMove = findBestMove(board, player, startTime);

  // 계산이 끝나면 결과를 메인 스레드로 전송
  self.postMessage(bestMove);
}
```

vite.config.ts(vite 설정)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/othello/',
  plugins: [react(), tailwindcss()],
  worker: { format: "es" }, // <- 이 줄 추가
})
```

</details>

### 3. MCTS vs IDDFS-αβ 시뮬레이션 결과 및 분석

두 최종 AI를 동일한 시간제한 조건에서 대결시킨 결과는 다음과 같다.

| 시간제한  | 총 게임 수 | MCTS 승리 | A-B (IDDFS) 승리 | 무승부/기타 | MCTS 승률   | A-B (IDDFS) 승률 |
|:------|:-------|:--------|:---------------|:-------|:----------|:---------------|
| 0.01초 | 10     | 2       | 8              | 0      | 20.0%     | 80.0%          |
| 0.03초 | 10     | 2       | 8              | 0      | 20.0%     | 80.0%          |
| 0.05초 | 10     | 0       | 9              | 1      | 0.0%      | 90.0%          |
| 0.08초 | 10     | 0       | 9              | 1      | 0.0%      | 90.0%          |
| 0.1초  | 10     | 3       | 7              | 0      | 30.0%     | 70.0%          |
| 1초    | 10     | 2       | 8              | 0      | 20.0%     | 80.0%          |
| 2초    | 10     | 1       | 9              | 0      | 10.0%     | 90.0%          |
| 3초    | 10     | 5       | 5              | 0      | **50.0%** | **50.0%**      |
| 4초    | 10     | 2       | 8              | 0      | 20.0%     | 80.0%          |
| 5초    | 10     | 4       | 6              | 0      | 40.0%     | 60.0%          |

#### 가. 분석 및 인사이트

1. IDDFS-$\alpha\beta$의 강력함: IDDFS를 적용한 알파-베타는 주어진 시간을 온전히 활용해 더 깊이 탐색하게 되면서, 대부분의 시간대에서 70~90%의 압도적인 승률을 기록했다. 이는 잘 설계된 평가 함수와 효율적인 탐색의 조합이 얼마나 강력한지를 명확히 보여준다.
2. 3초의 특이점: 이번 실험의 가장 흥미로운 지점은 3초이다. 2초까지 10%에 불과했던 MCTS의 승률이 3초에서 갑자기 50%까지 치솟아 강한 상대와 대등한 성적을 기록했다. 이는 MCTS가 유리한 국면에 서는 전략적 특이점일 수도 있지만, 시뮬레이션 횟수가 적기 때문에 발생한 이상치일 가능성이 높다.
3. MCTS의 가능성과 개선 방안: 비록 전반적인 승률은 낮지만, 시간이 늘어남에 따라 성능이 향상되는 기본적인 특성을 여전히 보여주었다(2초: 10 -> ... -> 4초: 20 -> 5초: 40). 이는 MCTS의 잠재력을 시사하며, 다음 개선 방향을 생각해볼 수 있다.

### 4. 종합 결론 및 다음 과제

Version 5에서는 Minimax 알고리즘의 한계를 넘어 MCTS라는 새로운 탐색 패러다임을 도입하고, 웹 워커를 통해 사용자 경험을 개선했으며, IDDFS로 개선된 알파-베타와의 대결을 통해 잠재력과 개선점을 발견할 수 있었다.

이번 실험을 통해 MCTS를 개선하기 위한 다음 과제를 떠올려볼 수 있었다. 바로 시뮬레이션(Rollout) 단계의 개선이다. 현재의 완전 무작위 방식에서 벗어나 약간의 휴리스틱(ex. 위치 가중치)을 추가하여 시뮬레이션의 질을 높인다면 IDDFS-$\alpha\beta$에 대응할 수 있을 것이다.

## Version 6. MCTS 강화: 가중치 기반 시뮬레이션 (Lightweight Rollout)

### 1. Version 5의 한계와 동기

[Version 5](#version-5-비동기-ai와-새로운-패러다임-mcts-vs-iddfs-αβ)에서는 MCTS라는 새로운 탐색 패러다임을 도입하고, IDDFS-αβ라는 강력한 벤치마크와 비교했다. 그 결과, MCTS는 가능성을 보여주었지만 IDDFS-αβ에게 전반적으로 열세였다.

가장 큰 원인은 MCTS의 시뮬레이션(Rollout) 단계가 '순수 무작위'였다는 점이다. 게임이 끝날 때까지 아무런 전략 없이 무작위로 돌을 놓는 방식은, 게임의 승패를 예측하는 시뮬레이션의 정확도를 크게 떨어뜨렸다. 귀퉁이 옆 위험한 자리에 돌을 놓는 악수와 귀퉁이를 차지하는 최선의 수가 같은 확률로 선택되는 비효율적인 구조였다.

따라서 Version 6의 목표는 MCTS의 시뮬레이션 단계에 최소한의 게임 지식(휴리스틱)을 주입하여 좀 더 '그럴듯한' 방향으로 게임을 시뮬레이션하고, 이를 통해 AI의 예측 정확도와 전반적인 성능을 향상시키는 것이다.

### 2. 주요 개선 사항: Lightweight Rollout 구현

'가벼운(Lightweight)' 방식으로 Rollout의 질을 높이기 위해, [Version 2](#version-2-위치-가중치-맵positional-weight-map-적용)에서 사용했던 위치 가중치 맵(POSITIONAL_WEIGHTS)을 재활용했다.

기존에는 가능한 모든 수를 동일한 확률로 선택했지만, 이제는 위치 가중치가 높은 곳에 있는 수를 더 높은 확률로 선택하도록 변경하였다. 이는 오셀로의 기본적인 위치 전략을 시뮬레이션에 반영하여 완전히 무작위적인 진행보다 훨씬 더 현실적인 게임 결과를 예측하도록 돕는다.

구현에는 모든 가중치를 양수로 변환한 뒤, 전체 가중치 합 내에서 무작위 값을 뽑아 해당 구간에 속하는 수를 선택하는 '가중치 기반 랜덤 선택(Weighted Random Selection)' 또는 '룰렛 휠 선택' 방식을 사용했다.

<details>
<summary> Lightweight Rollout 코드 보기 (Click to expand) </summary>

```typescript
function selectMoveByWeight(possibleMoves: PossibleMove[]): PossibleMove {
    // 최소 가중치를 찾음
    const minWeight = Math.min(...possibleMoves.map(m => POSITIONAL_WEIGHTS[m.move]));
    // 음수 가중치가 없도록 최소 가중치만큼 값을 보정(offset)
    const offset = minWeight <= 0 ? -minWeight + 1 : 0;

    const weightedMoves = possibleMoves.map(m => ({
        ...m,
        weight: POSITIONAL_WEIGHTS[m.move] + offset,
    }));

    const totalWeight = weightedMoves.reduce((sum, m) => sum + m.weight, 0);

    // 0과 가중치 총 합 사이의 수를 하나 뽑음.
    let randomValue = Math.random() * totalWeight;

    // 룰렛 휠 선택
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
```

```typescript
function rollout(node: Node) {
    // ... (기존 rollout 로직과 동일) ...
    while (!isGameOver(board)) {
        // ... (착수 가능한 수 탐색) ...

        // 기존의 완전 무작위 선택 대신 가중치 기반 선택 함수를 호출
        const { move, piecesToFlip } = selectMoveByWeight(possibleMoves);
        
        // ... (이후 로직은 동일) ...
    }
    // ...
}
```

</details>

### 3. 시뮬레이션 결과 및 분석

개선된 MCTS와 기존의 IDDFS-αβ를 여러 차례 대결시킨 결과는 아래와 같다. (총 250게임, 시간대별 20~30게임)

| 시간제한  | 총 게임 수 | MCTS 승리 | IDDFS 승리 | MCTS 승률 | IDDFS 승률 |
|:------|:-------|:--------|:---------|:--------|:---------|
| 0.01초 | 30     | 7       | 23       | 23.3%   | 76.7%    |
| 0.03초 | 30     | 11      | 19       | 36.7%   | 63.3%    |
| 0.05초 | 30     | 9       | 21       | 30.0%   | 70.0%    |
| 0.08초 | 30     | 13      | 17       | 43.3%   | 56.7%    |
| 0.1초  | 30     | 11      | 19       | 36.7%   | 63.3%    |
| 1초    | 20     | 4       | 16       | 20.0%   | 80.0%    |
| 2초    | 20     | 4       | 16       | 20.0%   | 80.0%    |
| 3초    | 20     | 7       | 13       | 35.0%   | 65.0%    |
| 4초    | 20     | 3       | 17       | 15.0%   | 85.0%    |
| 5초    | 20     | 5       | 15       | 25.0%   | 75.0%    |

#### 가. MCTS의 괄목할 만한 승률 개선

'Lightweight Rollout' 개선은 성공적이었다. [순수 무작위 Rollout을 사용했을 때 10%대에 머물던 승률이](#3-mcts-vs-iddfs-αβ-시뮬레이션-결과-및-분석), 이제는 IDDFS-αβ를 상대로 평균 20~30%, 특정 구간에서는 40% 이상의 승률을 기록하며 의미 있는 승률의 개선을 이뤄냈다. 여전히 약세이긴 하나, MCTS의 지속적인 개선을 통해 언젠가는 IDDFS-αβ를 뛰어넘을 수 있다는 가능성을 보였다.

#### 나. 드러난 한계와 다음 과제

하지만 시뮬레이션 결과에서 명확히 드러나듯, 개선된 MCTS는 여전히 IDDFS-αβ의 전반적인 안정성과 성능에는 미치지 못했다. 특히 시간이 길어질수록 IDDFS-αβ는 더 깊이 탐색하며 MCTS와의 격차를 벌리는 경향을 보였다.

이는 'Lightweight Rollout'이 가진 명백한 한계 때문이다. 위치 가중치는 게임 전체에 걸쳐 고정된 값으로, 현재 국면의 동적인 변화(Dynamic Changes)를 전혀 반영하지 못한다. 예를 들어, 특정 귀퉁이가 이미 상대방 돌로 둘러싸여 있어 전략적 가치가 없는 상황에서도 MCTS는 여전히 그 주변을 '좋은 자리'로 착각하고 시뮬레이션을 진행할 수 있다.

### 4. 종합 결론 및 다음 과제

Version 6를 통해 MCTS의 시뮬레이션 단계에 간단한 휴리스틱을 추가하는 것만으로도 AI의 성능을 크게 향상시킬 수 있음을 확인했다.

이제 MCTS가 IDDFS-αβ를 뛰어넘기 위해서는 정적인 위치 가중치에서 벗어나 시뮬레이션의 매 순간마다 실제 국면을 읽고 동적으로 판단하는 능력을 부여해야 한다. 이를 위해 다음 Version 7에서는 시뮬레이션의 각 단계에서 얕은 탐색을 수행하는 'Heavy Rollout' 기법을 구현하여 MCTS의 '직관'을 한 단계 더 발전시킬 것이다.


## Version 7. MCTS Rollout 심화 실험 및 한계 분석

### 1. Version 6의 한계와 동기

[Version 6](#version-6-mcts-강화-가중치-기반-시뮬레이션-lightweight-rollout)에서는 위치 가중치를 활용한 'Lightweight Rollout'을 통해 MCTS의 성능을 크게 향상시킬 수 있었다. 하지만 이 방식은 게임의 현재 국면을 전혀 고려하지 않는 정적(Static) 휴리스틱이라는 한계가 있었다.

따라서 Version 7의 목표는 시뮬레이션 중에 실제 국면을 동적으로 읽는 얕은 탐색(Shallow Search)을 Rollout에 결합하여 MCTS의 예측 정확도를 한 단계 더 끌어올리는 것이었다.

### 2. 실험 설계: 다양한 Rollout 정책 테스트

Rollout의 '지능'과 '비용(속도)' 사이의 최적점을 찾기 위해, 점진적으로 복잡해지는 세 가지 정책을 설계하고 IDDFS-αβ를 상대로 성능을 테스트했다.

1. Heavy Rollout: 시뮬레이션의 모든 수를 깊이 2의 shallowSearch로 결정하는 정책.

2. Adaptive Rollout: 시뮬레이션 초반 10수는 깊이 1의 shallowSearch로, 그 이후는 빠른 selectMoveByWeight로 전환하는 하이브리드 정책.

3. Heuristic-Combined Rollout: Adaptive Rollout의 초반부 탐색에 위치 가중치 휴리스틱을 결합하여 단기적 이득과 장기적 가치를 함께 보도록 설계한 정책.

### 3. 시뮬레이션 결과 및 분석

| Rollout 정책         | MCTS 승률 (vs IDDFS-αβ) | 분석                                                                                            |
|:-------------------|:----------------------|:----------------------------------------------------------------------------------------------|
| Heavy Rollout      | 10% 미만                | 실패. 시뮬레이션 한 번이 너무 느려져 MCTS의 핵심인 '많은 시뮬레이션 횟수'를 확보하지 못하고 성능이 급락.                               |
| Adaptive Rollout   | 20 ~ 40%              | 미묘한 실패. depth=1 탐색이 너무 근시안적이어서, 장기적으로 나쁜 수를 선택하는 경향을 보임. 이전의 'Lightweight Rollout'보다 오히려 약화됨. |
| Heuristic-Combined | 15 ~ 30%              | 실패. 두 휴리스틱의 점수 규모(Scale)가 맞지 않아, 위치 가중치가 무시되고 여전히 근시안적인 탐색이 지배적.                              |

실험 결과는 명확했다. Rollout 단계를 더 똑똑하게 만들려는 모든 시도가 오히려 MCTS를 더 약하게 만들었다. 얕은 탐색을 추가하는 비용이 시뮬레이션 횟수를 크게 감소시키는 부작용을 낳았고, 단순한 휴리스틱만으로는 IDDFS-αβ의 정교한 평가 함수를 따라갈 수 없었다.

### 4. 종합 결론 및 새로운 방향: RAVE(Rapid Action Value Estimation)

Rollout 정책을 개선하려는 일련의 시도들은 MCTS의 성능을 끌어올리는 데 실패했다. 이를 통해 중요한 교훈을 얻었다. Rollout을 무겁게 만들어 예측의 '질'을 조금 높이는 것보다, MCTS의 핵심 학습 메커니즘을 개선하여 '학습 효율' 자체를 높이는 것이 더 중요하다.

이 결론에 따라 Rollout 정책 최적화를 잠시 멈추고, MCTS 알고리즘 자체를 근본적으로 강화하는 RAVE (Rapid Action Value Estimation) 를 다음 Version의 목표로 삼기로 결정했다.

또한 게임에 적용된 알고리즘을 강력한 IDDFS-αβ로 다시 변경하였다.

### 부록: RAVE (Rapid Action Value Estimation)[^1]란?

RAVE는 MCTS의 성능을 극적으로 향상시키는 가장 유명하고 효과적인 기법 중 하나이다.

RAVE의 핵심 아이디어는 "시뮬레이션에서 나온 모든 좋은 수는, 그게 어디서 나왔든 간에 일단 좋다고 기록해두자"는 것이다.

- 기존 MCTS: 한 번의 시뮬레이션이 끝나면, 그 결과(승/패)는 역전파에 의해 오직 탐색 트리를 따라 내려온 경로상의 노드들에만 업데이트된다.

- RAVE MCTS: 시뮬레이션 결과는 경로상의 노드들뿐만 아니라, 해당 시뮬레이션 과정(Rollout)에서 등장했던 모든 수(Action)에 대해서도 별도로 통계를 업데이트한다.

기존의 역전파에 의해 경로상의 노드의 UTC만을 업데이트하는 것보다 Rollout에 포함된 다른 노드들에 대해 RAVE 점수를 업데이트 해야 하므로 약간 더 시간이 걸리게 된다.

그러나 결과적으로 RAVE는 시뮬레이션 깊은 곳에서 우연히 발견된 좋은 수를 트리 전체의 다른 노드들이 더 빨리 알게 해줌으로써 MCTS의 학습 속도와 효율을 향상 시킨다.

### 참고문헌

[^1]: [Sylvain Gelly, David Silver, Monte-Carlo tree search and rapid action value estimation in computer Go, Artificial Intelligence, Volume 175, Issue 11, 2011, Pages 1856-1875](https://www.cs.utexas.edu/~pstone/Courses/394Rspring11/resources/mcrave.pdf)