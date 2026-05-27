import { datas } from "./datas.js";
import { Color } from "./Color.js";
import { random } from "./lib/Util.js";
import { checkPiece } from "./checkPiece.js";
import { Piece } from "./Piece.js";
import { Board } from "./Board.js";

const version = [0, 59, 23];
document.getElementById("version").textContent = `ver.${version.join(".")}`;

// 各シーン取得
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const loading = document.getElementById("loading");
const boardElement = document.getElementById("board");
const exPieceElement = document.getElementById("sample-piece-board");

// ボタン取得
const startButton = document.getElementById("start-button");
const resetButton = document.getElementById("reset-button");
const nextButton = document.getElementById("next-button");
const returnButton = document.getElementById("return-button");
const undoButton = document.getElementById("undo-button");
const redoButton = document.getElementById("redo-button");
const changeButton = document.getElementById("change-button");

let ingame = false; //ゲーム中かどうか
let board; //ベースのボードデータ
let piece; //ベースのピースデータ
let pieces = [];
let playerBoard = []; //プレイヤーが塗ったボードデータ
let playerPiece = []; //プレイヤーが塗ったピースデータ
let cellElements = []; //セルのエレメントデータ
let color = ""; //カラー
let history = []; //履歴のボードデータ
let historyIdx = 0;
let touchCnt = 0; //画面タッチ開始からのカウント
let volume = false;
let mode = "pen"; //モード

// STARTボタン
startButton.addEventListener("click", () => {
    transScene("game");
});

// RESETボタン
resetButton.addEventListener("click", () => {
    clear();
});

// NEXTボタン
nextButton.addEventListener("click", () => {
    transScene("game");
});

// RETURNボタン
returnButton.addEventListener("click", () => {
    transScene("start");
});

undoButton.addEventListener("click", () => {
    undo();
});

redoButton.addEventListener("click", () => {
    redo();
});

changeButton.addEventListener("click", () => {
    //touch中は変更不可
    if(touchCnt > 0)return;

    //モード切替
    if(mode == `pen`) {
        mode = `era`
        changeButton.textContent = `MODE: ERASER`;
        changeButton.classList.add(`mode-era`);
        changeButton.classList.remove(`mode-pen`);
    }else if(mode == `era`) {
        mode = `pen`
        changeButton.textContent = `MODE: PEN`;
        changeButton.classList.add(`mode-pen`);
        changeButton.classList.remove(`mode-era`);
    }
});

document.addEventListener("pointerdown", (e) => {
    startTouch(e);
});

document.addEventListener("pointerup", (e) => {
    endTouch(e);
});

document.addEventListener(`pointermove`, (e) => {
    moveTouch(e);
});


// シーン切替
function transScene(sceneName) {
    // 一旦全部隠す
    startScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    nextButton.classList.add("hidden");

    //ホーム表示
    if (sceneName === "start") {
        loading.style.display = "none";

        ingame = false;
        startScreen.classList.remove("hidden");
    }
    //ゲーム開始
    if (sceneName === "game") {
        loading.style.display = "flex";
        volume = document.getElementById("volume-toggle").checked;

        setTimeout(start, 10);
    }
}

//ゲーム開始に処理
function start() {
    loading.style.display = "none";

    gameScreen.classList.remove("hidden");
    resetButton.classList.remove("hidden");
    undoButton.classList.remove("hidden");
    redoButton.classList.remove("hidden");

    //各要素の初期化
    ingame = true;
    playerBoard = [];
    playerPiece = [];
    cellElements = [];
    history = [];
    historyIdx = 0;

    //ピースを作成
    pieces = [];
    const cnt = random(2, 3, true);
    for (let i = 0; i < cnt; i++) {
        pieces.push(Piece.create(6));
    }

    //ボードを作成
    board = Board.create(pieces);

    //ベースのボードをプレイヤー用ボードにコピー
    for (let i = 0; i < board.length; i++) {
        playerBoard.push(new Array(board.length).fill(0));
    }

    //セルボードを初期化
    cellElements = [];
    for (let i = 0; i < board.length; i++) {
        cellElements.push(new Array(board.length).fill(0));
    }

    //見本ピースを表示
    renderSamplePiece();
    //ボードを表示
    renderBoard();
}

//マスをリセット
function clear() {
    //プレイヤーボードを初期化
    playerBoard = [];
    for (let i = 0; i < board.length; i++) {
        playerBoard.push(new Array(board.length).fill(0));
    }

    //履歴を初期化
    history = [];
    historyIdx = 0;

    renderBoard();
}

//見本ピースの表示
function renderSamplePiece() {
    //containerを初期化
    const pieceContainer = document.getElementById("piece-container");
    pieceContainer.innerHTML = "";

    //ピースの数だけボードを作成
    for (let i = 0; i < pieces.length; i++) {
        const piece = pieces[i];

        //ボードの作成
        const pieceBoard = document.createElement("div");
        pieceBoard.classList.add("piece-board");
        //初期化
        pieceBoard.style.gridTemplateColumns = `repeat(${piece[0].length}, 20px)`;
        pieceBoard.innerHTML = "";

        for (let i = 0; i < piece.length; i++) {
            for (let j = 0; j < piece[i].length; j++) {
                //cell生成
                const cell = document.createElement("div");

                // 共通クラス
                cell.classList.add("sample-piece");

                // 値によって見た目変更
                if (piece[i][j] === 1)
                    cell.classList.add("sample-piece-filled");
                else cell.classList.add("sample-piece-none");

                //ボードに追加
                pieceBoard.appendChild(cell);
            }
        }

        pieceContainer.appendChild(pieceBoard);
    }
}

//ボードを表示
function renderBoard() {
    //長さ調節  & リセット
    boardElement.style.gridTemplateColumns = `repeat(${board[0].length}, 30px)`;
    boardElement.innerHTML = "";

    for (let i = 0; i < board.length; i++) {
        //縦
        for (let j = 0; j < board[i].length; j++) {
            //横
            //cellを生成
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = i;
            cell.dataset.col = j;

            //ボードの値によって見た目変更
            //1: 塗り可能, 0: 虚空
            if (board[i][j] === 1) {
                cell.classList.add("any");

                //undo,redo時にセルを読み込む用
                const res = playerBoard[i][j];
                //プレイヤーボードの情報をセルに反映
                if (typeof res == `string`) {
                    cell.style.background = res;

                    const test = document.createElement("div");
                    test.classList.add("test");
                    test.style.background = res;
                    cell.appendChild(test);

                    renderBorder([i, j], test);
                } else if (res == -1) {
                    cell.style.background = Color.out;
                }
            } else cell.classList.add("none");

            // boardに追加
            boardElement.appendChild(cell);
            //配列に追加
            cellElements[i][j] = cell;
        }
    }
}

//マスを塗る
function moveTouch(e) {
    if (!ingame) return;

    //動かした座標のエレメントを取得
    const element = document.elementFromPoint(e.x, e.y);
    if (!element) return;
    if (!element.classList.contains(`cell`)) return;

    //座標を取得
    const row = element.dataset.row;
    const col = element.dataset.col;

    //ベースのボードと比較、マスがあるかどうか
    if (!board[row][col]) return;

    //マスがすでに塗られているか
    if (playerBoard[row][col]) return;

    if (touchCnt == 0) save(e);
    touchCnt++;

    playerBoard[row][col] = color;
    element.style.background = color;

    //塗った座標を保存
    playerPiece.push([row, col]);
}

//画面タッチを開始
function startTouch(e) {
    if (!ingame) return;

    //セルの色を決定
    // color = Color.filleds[random(0, Color.filleds.length - 1, true)];
    color = Color.getRandom();

    //プレイヤーのピースデータを初期化
    playerPiece = [];
}

//画面タッチを終了
function endTouch() {
    if (!ingame) return;
    touchCnt = 0;

    //画面タッチ終了時にピースをチェック
    if (playerPiece.length == 0) return;

    const res = checkPiece(pieces, playerPiece);

    if (res) {
        //正解
        //サウンド再生
        if (volume) {
            const sound = new Audio("./sounds/click.mp3");
            sound.play();
        }

        //正解したピースにボーダーを表示
        for (const piece of playerPiece) {
            const element = cellElements[piece[0]][piece[1]];

            const test = document.createElement("div");
            test.classList.add("test");
            test.style.background = color;
            element.appendChild(test);

            renderBorder(piece, test);
        }

        //ボードがすべて埋まった場合
        const ok =
            JSON.stringify(
                playerBoard.map((a) =>
                    a.map((a) => {
                        return a != 1 && a != 0 ? 1 : 0;
                    }),
                ),
            ) === JSON.stringify(board);
        if (ok) {
            resetButton.classList.add("hidden");
            undoButton.classList.add("hidden");
            redoButton.classList.add("hidden");
            nextButton.classList.remove("hidden");
            ingame = false;
        }
    } else {
        //不正解
        //サウンド再生
        if (volume) {
            const sound = new Audio("./sounds/out.mp3");
            sound.playbackRate = 3.5;
            sound.play();
        }

        //セルの色を変更
        for (let i = 0; i < playerPiece.length; i++) {
            const row = playerPiece[i][0];
            const col = playerPiece[i][1];

            const cell = cellElements[row][col];
            if (cell.dataset.row == row && cell.dataset.col == col) {
                cell.style.background = Color.out;
                playerBoard[row][col] = -1;
            }
        }
    }
}

//プレイヤーボードを履歴に保存
function save(e) {
    history.splice(historyIdx, history.length);
    historyIdx++;

    //セルを押したかどうか
    const element = document.elementFromPoint(e.x, e.y);
    if (!element) return;
    if (!element.classList.contains(`cell`)) return;

    //座標を取得
    const row = element.dataset.row;
    const col = element.dataset.col;

    //ベースのボードと比較、マスが存在するかどうか
    if (!board[row][col]) return;
    //マスがすでに塗られているか
    if (playerBoard[row][col]) return;

    //プレイヤーボードを保存を履歴に保存
    history.push(JSON.parse(JSON.stringify(playerBoard)));
}

//一つ戻す
function undo() {
    if (history.length == 0) return;
    if (historyIdx == 0) return;

    //idxが最新の場合
    //undo前に最新のプレイヤーボードを保存
    if (historyIdx == history.length) {
        history.push(JSON.parse(JSON.stringify(playerBoard)));
    }

    historyIdx--;

    //ひとつ前のボードをプレイヤーボードに反映
    const undoBoard = history[historyIdx];
    playerBoard = undoBoard;

    renderBoard();
}

//一つ進む
function redo() {
    if (history.length == 0) return;
    if (historyIdx + 1 >= history.length) return;

    historyIdx++;

    //ひとつ前のボードをプレイヤーボードに反映
    const undoBoard = history[historyIdx];
    playerBoard = undoBoard;

    renderBoard();
}

//識別IDを作成
function createId() {
    let id = ``;
    for(let i=0; i<5; i++) {
        id += `${random(0, 9, true)}`;
    }
    return id;
}

// 初期画面
transScene("game");
console.log(`Ready!\nver.${version.join(".")}`);

function renderBorder([row, col], element) {
    const color = playerBoard[row][col];

    const dires = [
        [-1, 0, "Top"],
        [1, 0, "Bottom"],
        [0, -1, "Left"],
        [0, 1, "Right"],
    ];

    //各ピース上下左右をチェック
    for (const [direRow, direCol, dire] of dires) {
        //各向きを追加した座標
        const neRow = 1 * row + direRow;
        const neCol = 1 * col + direCol;

        //範囲外の場合
        if (
            playerBoard[neRow] === undefined ||
            playerBoard[neRow][neCol] === undefined
        ) {
            element.style[`border${dire}`] = "3px solid #e0e0e0";

            continue;
        }

        //隣接しているか
        const isConnected = playerBoard[neRow][neCol] === color;

        //どこにも隣接していない場合
        if (!isConnected) {
            element.style[`border${dire}`] = "3px solid #e0e0e0";
        }
    }
}
