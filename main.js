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

  // 必要な画面だけ表示
  if (sceneName === "start") {
    startScreen.classList.remove("hidden");
  }

  if (sceneName === "game") {
    gameScreen.classList.remove("hidden");

    renderBoard()
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
// clearButton.addEventListener("click", () => {
//   showScene("clear");
// });

// NEXTボタン
nextButton.addEventListener("click", () => {
  showScene("game");
});

// 初期画面
showScene("start");
 


const board = [
    [1,1,1,1],
    [1,1,1,1],
    [1,1,0,0],
    [1,1,0,0],
];

const piece = [
    [1,1],
    [1,0],
];

let filledPieces = [];



function renderBoard() {
    

    //ボードの横の長さを調整
    boardElement.style.gridTemplateColumns = `repeat(${board[0].length}, 60px)`;

    // 一旦中身を空にする
    boardElement.innerHTML = "";

    for (let i = 0; i < board.length; i++) { //縦
        for (let j = 0; j < board[i].length; j++) { //横

            // div生成
            const cell = document.createElement("div");

            // 共通クラス
            cell.classList.add("cell");

            // 値によって見た目変更
            if (board[i][j] === 1) cell.classList.add("empty");
            else cell.classList.add("none");

            // boardに追加
            boardElement.appendChild(cell);

            cell.addEventListener("mousemove", () => {
                console.log(isDragging);

                if(isDragging) {
                  //虚空ますの場合
                  if(cell.classList.contains("none"))return;

                  if(cell.classList.contains("empty")) {
                      cell.classList.add("filled");
                      cell.classList.remove("empty");

                      filledPieces.push([i, j]);
                  }

                }
            });
        }
    }
}




//ドラッグ判定
let isDragging = false;
document.addEventListener("mousedown", () => {
    filledPieces = [];
    isDragging = true;
});
document.addEventListener("mouseup", () => {
    isDragging = false;

    // console.log(filledPieces)
    checkPiece()
});



// ======================
// piece判定
// ======================

function checkPiece() {

  // player側
  const normalizedPlayer = normalizeCoords(filledPieces);

  // piece側
  const normalizedPiece = normalizeCoords(pieceToCoords(piece));


  console.log("player", normalizedPlayer);
  console.log("piece", normalizedPiece);


  // 比較
  const same = JSON.stringify(normalizedPlayer) === JSON.stringify(normalizedPiece);


  if (same) {
    console.log("一致！");
  }
  else {
    console.log("不一致");
  }
}


// ======================
// piece → 座標変換
// ======================

function pieceToCoords(pieceData) {
    const coords = [];

    for (let i = 0; i < pieceData.length; i++) {
        for (let j = 0; j < pieceData[i].length; j++) {
            if (pieceData[i][j] === 1) {
                coords.push([i, j]);
            }
        }
    }

    return coords;
}


// ======================
// 左上基準へ変換
// ======================

function normalizeCoords(coords) {
    let minRow = Infinity;
    let minCol = Infinity;

    // 最小座標取得
    for (const [row, col] of coords) {
        if (row < minRow) minRow = row;
        if (col < minCol) minCol = col;
    }

    // 左上基準へ変換
    const normalized = [];
    for (const [row, col] of coords) {
        normalized.push([
        row - minRow,
        col - minCol
        ]);
    }

    // ソート
    normalized.sort();

    return normalized;
}