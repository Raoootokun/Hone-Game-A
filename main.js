import { datas } from "./datas.js";
import { colors } from "./colors.js";
import { random } from "./lib/Util.js"
import { ProblemManager } from "./ProblemManager.js";
import { checkPiece } from "./checkPiece.js";

const version = [ 0,56 ];
document.getElementById("version").textContent = `ver.${version.join('.')}`;

// 各シーン取得
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const boardElement  = document.getElementById("board");
const exPieceElement  = document.getElementById("ex-piece-board");

// ボタン取得
const startButton = document.getElementById("start-button");
const resetButton = document.getElementById("reset-button");
const nextButton = document.getElementById("next-button");
const returnButton = document.getElementById("return-button");
const undoButton = document.getElementById("undo-button");
const redoButton = document.getElementById("redo-button");



// STARTボタン
startButton.addEventListener("click", () => {
  	transScene("game");
});

// RESETボタン
resetButton.addEventListener("click", () => {
  	clear()
});

// NEXTボタン
nextButton.addEventListener("click", () => {
  	transScene("game")
});

// RETURNボタン
returnButton.addEventListener("click", () => {
  	transScene("start");
});

undoButton.addEventListener("click", () => {
  	undo();
});

document.addEventListener("pointerdown", (e) => {
	startTouch(e)
});

document.addEventListener("pointerup", e => {
	endTouch(e)
});

document.addEventListener(`pointermove`, e => {
	moveTouch(e)
});





let ingame = false; //ゲーム中かどうか
let board; //ベースのボードデータ
let piece; //ベースのピースデータ
let playerBoard = []; //プレイヤーが塗ったボードデータ
let playerPiece = []; //プレイヤーが塗ったピースデータ
let cellElements = []; //セルのエレメントデータ
let color = ""; //カラー
let history = []; //履歴のボードデータ
let historyIdx = 0;
let boardIndex = 0;
let touchCnt = 0; //画面タッチ開始からのカウント


// シーン切替
function transScene(sceneName) {
	// 一旦全部隠す
	startScreen.classList.add("hidden");
	gameScreen.classList.add("hidden");
	nextButton.classList.add("hidden");

	//ホーム表示
	if (sceneName === "start") {
		ingame = false;
		startScreen.classList.remove("hidden");
	}
	//ゲーム開始
	if (sceneName === "game")start();
}


//ゲーム開始に処理
function start() {
	gameScreen.classList.remove("hidden");
	resetButton.classList.remove("hidden");
	undoButton.classList.remove("hidden");
	redoButton.classList.remove("hidden");
	document.getElementById("text1").textContent = `FIGHT ^^`


	//各要素の初期化 & ピース、ボードの作成
	ingame = true;
	piece = ProblemManager.createPiece(5, 0);
	board = ProblemManager.createBoard(piece);
	playerBoard = [];
	playerPiece = [];
	cellElements = [];
	boardIndex = 0;
	history = [];
	historyIdx = 0;


	//ベースのボードをプレイヤー用ボードにコピー
	for(let i = 0; i < board.length; i++) {
		playerBoard.push(new Array(board.length).fill(0));
	}

	//せるボードと同サイズの二次元配列を作成
	for(let i = 0; i < board.length; i++) {
		cellElements.push(new Array(board.length).fill(0));
	}


	//見本ピースを表示
	renderSamplePiece();
	renderBoard();
}


//マスをリセット
function clear() {
	//プレイヤーボードを初期化
	playerBoard = [];
	for(let i = 0; i < board.length; i++) {
		playerBoard.push(new Array(board.length).fill(0));
	}

	//セルボードを初期化
	cellElements = [];
	for(let i = 0; i < board.length; i++) {
		cellElements.push(new Array(board.length).fill(0));
	}

	//履歴を初期化
	history = []

	renderBoard();
}


//見本ピースの表示
function renderSamplePiece() {
	exPieceElement.style.gridTemplateColumns = `repeat(${piece[0].length}, 25px)`;
    exPieceElement.innerHTML = "";

	for (let i = 0; i < piece.length; i++) { //縦
        for (let j = 0; j < piece[i].length; j++) { //横
            // div生成
            const cell = document.createElement("div");

            // 共通クラス
            cell.classList.add("ex-piece");

            // 値によって見た目変更
            if (piece[i][j] === 1) cell.classList.add("ex-piece-filled");
			else cell.classList.add("ex-piece-none");

            // pieceに追加
            exPieceElement.appendChild(cell);
        }
    }
}


//ボードを表示
function renderBoard() {
	//長さ調節  & リセット
    boardElement.style.gridTemplateColumns = `repeat(${board[0].length}, 30px)`;
    boardElement.innerHTML = "";

    for (let i = 0; i < board.length; i++) { //縦
        for (let j = 0; j < board[i].length; j++) { //横
            //cellを生成
            const cell = document.createElement("div");
            cell.classList.add("cell");
			cell.dataset.row = i;
			cell.dataset.col = j;

            //ボードの値によって見た目変更
			//1: 塗り可能, 0: 虚空
            if (board[i][j] === 1) cell.classList.add("empty");
            else cell.classList.add("none");

            // boardに追加
            boardElement.appendChild(cell);
			//配列に追加
			cellElements[i][j] = cell;
        }
    }
}


//マスを塗る
function moveTouch(e) {
	if(!ingame)return;
	
	//動かした座標のエレメントを取得
	const element = document.elementFromPoint(e.x, e.y);
	if(!element)return;
	if(!element.classList.contains(`cell`))return;

	//座標を取得
	const row = element.dataset.row;
	const col = element.dataset.col;

	//ベースのボードと比較、マスがあるかどうか
	if(!board[row][col])return;

	//マスがすでに塗られているか
	if(playerBoard[row][col])return;

	if(touchCnt == 0)save(e);
	touchCnt++;

	playerBoard[row][col] = color;
	element.style.background = color;

	//塗った座標を保存
	playerPiece.push([row, col]);
}


//画面タッチを開始
function startTouch(e) {
	if(!ingame)return;

	//セルの色を決定
	color = colors.filled[random(0, colors.filled.length-1, true)];
	//プレイヤーのピースデータを初期化
	playerPiece = [];
}


//画面タッチを終了
function endTouch() {
	if(!ingame)return;
	touchCnt = 0;

	//画面タッチ終了時にピースをチェック
	if(playerPiece.length == 0)return;
    const res = checkPiece(piece, playerPiece);


	if(res) { //正解
		//サウンド再生
		const sound = new Audio("./sounds/click.mp3");
		sound.play();

		console.log()
		//ボードがすべて埋まった場合
		const ok = JSON.stringify(playerBoard.map(a => a.map(a => { return (a != 1 && a != 0) ? 1:0; }))) === JSON.stringify(board);
		if(ok) {
			resetButton.classList.add("hidden");
			undoButton.classList.add("hidden");
			redoButton.classList.add("hidden");
			nextButton.classList.remove("hidden");

			document.getElementById("text1").textContent = `CLEAR!!`;
			ingame = false;
		}

	}else { //不正解
		//サウンド再生
		const sound = new Audio("./sounds/out.mp3");
		sound.playbackRate = 3.5;
		sound.play();


		//セルの色を変更
		for (let i = 0; i < playerPiece.length; i++) {
			const row = playerPiece[i][0];
			const col = playerPiece[i][1];

			const cell = cellElements[row][col];
			if(cell.dataset.row == row && cell.dataset.col == col) {
				cell.style.background = colors.out;
				playerBoard[row][col] = -1;
			}

		} 
	}
}


//プレイヤーボードを履歴に保存
function save(e) {
	//セルを押したかどうか
	const element = document.elementFromPoint(e.x, e.y);
	if(!element)return;
	if(!element.classList.contains(`cell`))return;

	//座標を取得
	const row = element.dataset.row;
	const col = element.dataset.col;

	//ベースのボードと比較、マスが存在するかどうか
	if(!board[row][col])return;
	//マスがすでに塗られているか
	if(playerBoard[row][col])return;

	//プレイヤーボードを保存を履歴に保存
	const A = JSON.parse(JSON.stringify(playerBoard));
	history.push(A);
	console.log(`Save`);
}


//一つ戻す
function undo() {
	if(history.length == 0)return;

	//ひとつ前のボードをプレイヤーボードに反映
	const undoBoard = history[history.length-1];
	playerBoard = undoBoard;
	

	history.splice(history.length-1, 1);

	console.log(history)
	renderBoard__2();
}


function renderBoard__2() {
	//セルボードを初期化
	cellElements = [];
	for(let i = 0; i < board.length; i++) {
		cellElements.push(new Array(board.length).fill(0));
	}


	//長さ調節  & リセット
    boardElement.style.gridTemplateColumns = `repeat(${board[0].length}, 30px)`;
    boardElement.innerHTML = "";

    for (let i = 0; i < board.length; i++) { //縦
        for (let j = 0; j < board[i].length; j++) { //横
            //cellを生成
            const cell = document.createElement("div");
            cell.classList.add("cell");
			cell.dataset.row = i;
			cell.dataset.col = j;

            //ボードの値によって見た目変更
			//1: 塗り可能, 0: 虚空
            if (board[i][j] === 1) {
				cell.classList.add("empty");

				//セルの状態を取得
				const res = playerBoard[i][j];
				//プレイヤーボードの情報をセルに反映
				if(typeof res == `string`) {
					cell.style.background = res;
				}else if(res == -1) {
					cell.style.background = colors.out;
				}

			}else cell.classList.add("none");
            

            // boardに追加
            boardElement.appendChild(cell);
			//配列に追加
			cellElements[i][j] = cell;
        }
    }
}



// 初期画面
transScene("game");
console.log(`Ready!\nver.${version.join('.')}`);