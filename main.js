// 各シーン取得
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const boardElement  = document.getElementById("board");

// ボタン取得
const startButton = document.getElementById("start-button");
const resetButton = document.getElementById("reset-button");
const nextButton = document.getElementById("next-button");


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


// シーン切替関数
function showScene(sceneName) {
	// 一旦全部隠す
	startScreen.classList.add("hidden");
	gameScreen.classList.add("hidden");
	nextButton.classList.add("hidden");

	// 必要な画面だけ表示
	if (sceneName === "start") {
		startScreen.classList.remove("hidden");
	}

	if (sceneName === "game") {
		gameScreen.classList.remove("hidden");
		resetButton.classList.remove("hidden");

		isClear = false;
		renderBoard()

		document.getElementById("text1").textContent = `FIGHT ^^`
	}
}







// 初期画面
showScene("start");
 


const board = [
    [1,1,],
    [1,1,],
    [1,1,],
    [1,1,],
];

const piece = [
    [1,0],
    [1,0],
];

let filledPieces = [];
let filledElements = [];
let filledBoard = [];



function renderBoard() {
	filledBoard = JSON.parse(JSON.stringify(board));
	for (let i = 0; i < filledBoard.length; i++) {
		for (let j = 0; j < filledBoard[i].length; j++) {
			filledBoard[i][j] = 0;
		}
	}


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
            cell.classList.add(`n_${i}_${j}`);
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
				//虚空マスの場合
				if(element.classList.contains("none"))return;

				if(element.classList.contains("empty")) {
					element.classList.add("filled");
					element.classList.remove("empty");
					element.style.background = color;

					filledPieces.push([element.dataset.row, element.dataset.col]);
					filledElements.push(element);
					console.log(`${element.dataset.row}/${element.dataset.col}`)
				}

				// console.log(`pointermove: ${i}${j}`);
				// console.log(document.elementFromPoint(e.x, e.y).classList)

                // if(isDragging) {
                //   //虚空ますの場合
                //   if(cell.classList.contains("none"))return;

                //   if(cell.classList.contains("empty")) {
                //       cell.classList.add("filled");
                //       cell.classList.remove("empty");
				// 	  cell.style.background = color;

                //       filledPieces.push([i, j]);
                //       filledElements.push(cell);
                //   }

                // }
            });
        }
    }
}


let clearCount = 0;
let isClear = false;
//ドラッグ判定
let color = "";
let isDragging = false;
// document.addEventListener("mousedown", () => {
//     filledPieces = [];
//     filledElements = [];
//     isDragging = true;
// 	color = "#" + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
// });
// document.addEventListener("mouseup", () => {
//     isDragging = false;

//     // console.log(filledPieces)
//     checkPiece()
// });

document.addEventListener("pointerdown", () => {
	console.log('Down');

    filledPieces = [];
    filledElements = [];
    isDragging = true;
	color = "#" + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
});
document.addEventListener("pointerup", () => {
	console.log('Up');

    isDragging = false;

    // console.log(filledPieces)
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


	let same = false;
	// 全パターン比較
	for (const pattern of piecePatterns) {

		const normalizedPattern =
		normalizeCoords(
			pieceToCoords(pattern)
		);


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

			document.getElementById("text1").textContent = `CLEAR!!`
		}
		
		


		
	}
	else {
		//不一致の場合
		for(const element of filledElements) {
			element.style.background =  "#aa0000";
		}
		// console.log("不一致");
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