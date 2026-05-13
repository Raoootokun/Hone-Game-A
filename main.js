// 各シーン取得
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const clearScreen = document.getElementById("clear-screen");
const boardElement  = document.getElementById("board");

// ボタン取得
const startButton = document.getElementById("start-button");
const clearButton = document.getElementById("clear-button");
const nextButton = document.getElementById("next-button");

// シーン切替関数
function showScene(sceneName) {

  // 一旦全部隠す
  startScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  clearScreen.classList.add("hidden");

  return;
  // 必要な画面だけ表示
  if (sceneName === "start") {
    startScreen.classList.remove("hidden");
  }

  if (sceneName === "game") {
    gameScreen.classList.remove("hidden");
  }

  if (sceneName === "clear") {
    clearScreen.classList.remove("hidden");
  }
}

// STARTボタン
startButton.addEventListener("click", () => {
  showScene("game");

  renderBoard()
});

// CLEARボタン
clearButton.addEventListener("click", () => {
  showScene("clear");
});

// NEXTボタン
nextButton.addEventListener("click", () => {
  showScene("game");
});

// 初期画面
showScene("start");
 


const board = [
    [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,0,0,0],
        [1,1,0,0,0]
];

function renderBoard() {
    //ボードの横の長さを調整
    boardElement.style.gridTemplateColumns = `repeat(${board[0].length}, 60px)`;

  // 一旦中身を空にする
//   boardElement.innerHTML = "";

  for (let i = 0; i < board.length; i++) { //縦
    for (let j = 0; j < board[i].length; j++) { //横

      // div生成
      const cell = document.createElement("div");

      // 共通クラス
      cell.classList.add("cell");

      // 値によって見た目変更
      if (board[i][j] === 1) cell.classList.add("filled");
      else cell.classList.add("empty");

      // boardに追加
      boardElement.appendChild(cell);
    }
  }
}

renderBoard()