const version = [ 0,53 ];
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

import { datas } from "./datas.js";
import { colors } from "./colors.js";
import { random } from "./lib/Util.js"
import { ProblemManager } from "./ProblemManager.js";

// STARTボタン
startButton.addEventListener("click", () => {
  	showScene("game");
});


// RESETボタン
resetButton.addEventListener("click", () => {
  	renderBoard()
});


// NEXTボタン
nextButton.addEventListener("click", () => {
  	showScene("game")
	clearCount++;
});


// RETURNボタン
returnButton.addEventListener("click", () => {
  	showScene("start");
});


// シーン切替関数
function showScene(sceneName) {
	// 一旦全部隠す
	startScreen.classList.add("hidden");
	gameScreen.classList.add("hidden");
	nextButton.classList.add("hidden");

	// 必要な画面だけ表示
	if (sceneName === "start") {
		ingame = false;
		startScreen.classList.remove("hidden");
	}

	if (sceneName === "game") {
		ingame = true;
		piece = ProblemManager.createPiece(5, 0);
		board = ProblemManager.createBoard(piece);


		gameScreen.classList.remove("hidden");
		resetButton.classList.remove("hidden");

		renderBoard()

		document.getElementById("text1").textContent = `FIGHT ^^`
	}
}








 


let board = datas.board;
let piece = datas.piece

let filledPieces = [];
let filledElements = [];
let filledBoard = [];
let ingame = false;


function renderBoard() {
	filledBoard = JSON.parse(JSON.stringify(board));
	for (let i = 0; i < filledBoard.length; i++) {
		for (let j = 0; j < filledBoard[i].length; j++) {
			filledBoard[i][j] = 0;
		}
	}


	//参照ピースを表示
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


    //ボードの横の長さを調整
    boardElement.style.gridTemplateColumns = `repeat(${board[0].length}, 30px)`;
    // 一旦中身を空にする
    boardElement.innerHTML = "";
    for (let i = 0; i < board.length; i++) { //縦
        for (let j = 0; j < board[i].length; j++) { //横

            // div生成
            const cell = document.createElement("div");

            // 共通クラス
            cell.classList.add("cell");
			cell.dataset.row = i;
			cell.dataset.col = j;

            // 値によって見た目変更
            if (board[i][j] === 1) cell.classList.add("empty");
            else cell.classList.add("none");

            // boardに追加
            boardElement.appendChild(cell);

			//mousemove
			//pointerenter
            cell.addEventListener("pointermove", (e) => { //押したら
				const element = document.elementFromPoint(e.x, e.y);
				if(!element)return;

				//虚空マスの場合
				if(element.classList.contains("none"))return;

				if(element.classList.contains("empty")) {
					element.classList.add("filled");
					element.classList.remove("empty");
					element.style.background = color;

					filledPieces.push([element.dataset.row, element.dataset.col]);
					filledElements.push(element);
					console.log(`${element.dataset.row}/${element.dataset.col}`)

					const sound = new Audio("./sounds/filled.mp3");
					sound.currentTime = 0;
					// sound.play();
				}
            });
        }
    }
}


let clearCount = 0;
let color = "";
let isDragging = false;

document.addEventListener("pointerdown", () => {
	if(!ingame)return;

    filledPieces = [];
    filledElements = [];
    isDragging = true;
	color = colors.filled[random(0, colors.filled.length-1, true)];
});
document.addEventListener("pointerup", () => {
	if(!ingame)return;

    isDragging = false;

    checkPiece()
});



// ======================
// piece判定
// ======================
function checkPiece() {
	// player側
	const normalizedPlayer =normalizeCoords(filledPieces);
	// pieceの全パターン取得
	const piecePatterns =getAllPiecePatterns(piece);
	if(normalizedPlayer.length == 0)return;

	let same = false;
	// 全パターン比較
	for (const pattern of piecePatterns) {
		const normalizedPattern = normalizeCoords(pieceToCoords(pattern));

		// 一致判定
		if (
		JSON.stringify(normalizedPlayer)
		===
		JSON.stringify(normalizedPattern)
		) {

		same = true;
		break;

		}
	}

	if (same) {
		for (const data of filledPieces) {
			filledBoard[data[0]][data[1]] = 1;
		}

		// console.log("一致！");
		
		if(JSON.stringify(filledBoard) === JSON.stringify(board)) {
			resetButton.classList.add("hidden");
			nextButton.classList.remove("hidden");

			document.getElementById("text1").textContent = `CLEAR!!`;
			ingame = false;
		}
		
		const sound = new Audio("./sounds/click.mp3");
		sound.play();


		
	}
	else {
		//不一致の場合
		for(const element of filledElements) {
			element.style.background = colors.out;
		}
		
		const sound = new Audio("./sounds/out.mp3");
		sound.playbackRate = 3.5;
		sound.play();
	}
}


// ======================
// pieceの全パターン
// ======================

function getAllPiecePatterns(basePiece) {
	const patterns = [];

	let current = basePiece;


	// 4回転
	for (let i = 0; i < 4; i++) {

		// 通常
		patterns.push(current);

		// 左右反転
		patterns.push(flipPiece(current));

		// 次の回転
		current = rotatePiece(current);
	}


	return patterns;
}


// ======================
// 90°回転
// ======================

function rotatePiece(pieceData) {
	const rows = pieceData.length;
	const cols = pieceData[0].length;

	const rotated = [];


	for (let j = 0; j < cols; j++) {

		const newRow = [];

		for (let i = rows - 1; i >= 0; i--) {

		newRow.push(pieceData[i][j]);

		}

		rotated.push(newRow);
	}


	return rotated;
}


// ======================
// 左右反転
// ======================
function flipPiece(pieceData) {
	const flipped = [];

	for (const row of pieceData) {

		flipped.push(
		[...row].reverse()
		);

	}


	return flipped;
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

// 初期画面
showScene("start");
console.log(`Ready!\nver.${version.join('.')}`);

