# 오셀로(Othello) AI

## 목차

1. [프로젝트 개요](#프로젝트-개요)

2. [기술스택](#기술스택)

3. [게임 화면 및 플레이 링크](#게임-화면)

4. [게임 규칙](#게임규칙)

5. [Version 1. 최대최소 탐색](#version-1-최대최소-탐색minimax-search)

6. [Version 2. 위치 가중치 맵 적용](#version-2-위치-가중치-맵positional-weight-map-적용)

## 프로젝트 개요

이 프로젝트는 React와 TypeScript를 사용하여 만든 오셀로(리버시) 게임으로, Minimax 알고리즘을 기반으로 한 인공지능(AI)의 다양한 전략과 최적화 기법을 탐구한다.

## 기술스택

<div style="display: flex; gap: 1rem;">
  <div style="display: flex-col; justify-items: center;"> 
    <img height=50 src="./images/react.svg" />
    <p>React</p>
  </div>
  <div style="display: flex-col; justify-items: center;"> 
    <img height=50 src="./images/typescript.svg" />
    <p>TypeScript</p>
  </div>
  <div style="display: flex-col; justify-items: center;"> 
    <img height=50 src="./images/vite.svg" />
    <p>Vite</p>
  </div>
  <div style="display: flex-col; justify-items: center;"> 
    <img height=50 src="./images/tailwind_css.svg" />
    <p>Tailwind CSS</p>
  </div>
</div>

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

| | A | B | C | D | E | F | G | H |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | 120 | -20 | 20 | 5 | 5 | 20 | -20 | 120 |
| **2** | -20 | -40 | -5 | -5 | -5 | -5 | -40 | -20 |
| **3** | 20 | -5 | 15 | 3 | 3 | 15 | -5 | 20 |
| **4** | 5 | -5 | 3 | 3 | 3 | 3 | -5 | 5 |
| **5** | 5 | -5 | 3 | 3 | 3 | 3 | -5 | 5 |
| **6** | 20 | -5 | 15 | 3 | 3 | 15 | -5 | 20 |
| **7** | -20 | -40 | -5 | -5 | -5 | -5 | -40 | -20 |
| **8** | 120 | -20 | 20 | 5 | 5 | 20 | -20 | 120 |


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

|탐색 깊이 (Depth)|총 게임 수|향상된 AI 승리|단순 AI 승리|무승부|최종 승자|주요 관찰|
|:---|:---|:---|:---|:---|:---|:---|
|4|30|15|15|0|백(White)|평가 함수와 무관하게 후공(백)이 반드시 승리.|
|5|15|7|8|0|백(White)|여전히 후공(백)이 반드시 승리. 가중치 AI가 질 때 더 큰 점수 차로 패배.|
|6|8|8|0|0|향상된 AI|평가 함수의 차이가 승패를 결정. 가중치 맵을 사용한 AI가 선공/후공과 무관하게 전승.|

**분석**: 얕은 탐색 깊이(4, 5)에서는 두 AI 모두 근시안적인 플레이를 하여, 평가 함수의 차이가 큰 의미를 갖지 못하고 후공(백)이 유리한 양상이 나타났다. 하지만 탐색 깊이가 6 이상으로 충분해지자, 기본적인 위치 가중치를 반영한 것만으로도 AI의 성능이 단순 AI를 압도함을 확인하여 가설1을 검증하였다.

### 3. 실험 2: 연구 기반 가중치 맵 AI 테스트

#### 가. 가설 및 평가 함수 설정

첫 번째 실험을 통해 가중치 맵의 효용성은 확인했지만, 더 정교하게 튜닝된 가중치 맵을 사용하면 더 얕은 탐색 깊이에서도 우위를 점할 수 있을 것이라는 가설 2를 검증하고자 했다. 이를 위해 여러 선행 연구[^1][^2][^3][^4]에서 공통적으로 인용되는 Yoshioka et al.의 Heuristic weights를 정수화하여 사용했다.

<details>
<summary> 연구 기반 가중치 맵 시각화 및 코드 보기 (Click to expand) </summary>

| | A | B | C | D | E | F | G | H |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | 100 | -25 | 10 | 5 | 5 | 10 | -25 | 100 |
| **2** | -25 | -25 | 1 | 1 | 1 | 1 | -25 | -25 |
| **3** | 10 | 1 | 5 | 2 | 2 | 5 | 1 | 10 |
| **4** | 5 | 1 | 2 | 1 | 1 | 2 | 1 | 5 |
| **5** | 5 | 1 | 2 | 1 | 1 | 2 | 1 | 5 |
| **6** | 10 | 1 | 5 | 2 | 2 | 5 | 1 | 10 |
| **7** | -25 | -25 | 1 | 1 | 1 | 1 | -25 | -25 |
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

|탐색 깊이 (Depth)|총 게임 수|향상된 AI 승리|단순 AI 승리|무승부|최종 승자|주요 관찰|
|:---|:---|:---|:---|:---|:---|:---|
|4|30|30|0|0|향상된 AI|향상된 AI가 큰 점수차로 승리(평균 40.5점 차).|
|5|16|16|0|0|향상된 AI|여전히 향상된 AI가 승리하지만 점수 차가 좁혀짐(평균 5점 차).|
|6|8|8|0|0|향상된 AI|여전히 향상된 AI가 승리하면서 다시 점수 차가 벌어짐(평균 33점 차).|

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