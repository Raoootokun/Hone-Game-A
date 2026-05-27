import { random, aryShuffle } from "./lib/Util.js";

const dires = [
    [-1, 0], //上
    [1, 0], //下
    [0, -1], //左
    [0, 1], //右
];

const maxSize = 11;
let pieceCnt = 0;

export class Board {
    static create(pieces) {
        pieceCnt = 0;

        let board = [];

        //空の二次元配列を作成
        for (let i = 0; i < maxSize; i++) {
            board.push(new Array(maxSize).fill(0));
        }

        let placeHistory = [];

        //中心に配置
        board = place1(board, pieces, placeHistory);
        board = place2(board, pieces, placeHistory);

        return board;
    }
}

/**
 * 中心に設置
 */
function place1(board, pieces, placeHistory) {
    while (true) {
        let success = true;

        //ボードを初期化
        board = [];
        for (let i = 0; i < maxSize; i++) {
            board.push(new Array(maxSize).fill(0));
        }

        //ピースを生成
        const piece = getRandomPiece(pieces);

        //中心を取得
        let bRow = Math.floor(board.length / 2 - piece.length / 2);
        let bCol = Math.floor(board.length / 2 - piece[0].length / 2);

        for (let i = 0; i < piece.length; i++) {
            for (let j = 0; j < piece[i].length; j++) {
                //空白マスの場合
                if (!piece[i][j]) continue;

                const y = bRow + i;
                const x = bCol + j;

                //半谷の場合
                if (!checkVolume(maxSize, y, x)) {
                    success = false;
                    continue;
                }

                board[y][x] = 1;
            }
        }

        if (!success) continue;

        //設置した座標を記録
        piece.forEach((row, i) =>
            row.forEach((v, j) => v && placeHistory.push([i, j])),
        );

        return board;
    }
}

/**
 * 設置履歴の隣に設置
 * 設置後に設置履歴から削除
 */
function place2(board, pieces, placeHistory) {
    //一定回数以上を超えるとストップ
    for (let tryCnt = 0; tryCnt < 100; tryCnt++) {
        if (placeHistory.length == 0) return board;

        const rotates = aryShuffle([1, 2, 3, 4]);
        const filps = aryShuffle([1, 2]);

        //履歴からランダムに取得
        const rdmIdx = random(0, placeHistory.length - 1, true);
        const rdmRow = placeHistory[rdmIdx][0];
        const rdmCol = placeHistory[rdmIdx][1];

        let placed = false;

        //各方向に設置を試みる
        for (let __i = 0; __i < 4; __i++) {
            const dire = dires[__i];
            const startRow = rdmRow + dire[0];
            const startCol = rdmCol + dire[1];

            //範囲外の場合
            if (!checkVolume(maxSize, startRow, startCol)) continue;
            //設置済みの場合
            if (board[startRow][startCol]) continue;

            let piece = JSON.parse(
                JSON.stringify(pieces[random(0, pieces.length - 1, true)]),
            );

            //回転
            for (const rotateCnt of rotates) {
                //回転させる

                for (let r = 0; r < rotateCnt; r++) {
                    piece = rotatePiece(piece);
                }

                //反転させる
                for (const flip of filps) {
                    if(pieceCnt > 10)return board;

                    if (flip) piece = flipPiece(piece);

                    //設置成功
                    const res = tryPlace(board, startRow, startCol, piece);
                    if (res != false) {
                        board = res; //ボードを上書き
                        placed = true;
                        pieceCnt++;

                        //設置した座標を記録
                        piece.forEach((row, i) =>
                            row.forEach(
                                (v, j) =>
                                    v &&
                                    placeHistory.push([
                                        startRow + i,
                                        startCol + j,
                                    ]),
                            ),
                        );
                    }
                }
            }
        }

        if (placed) placeHistory.splice(rdmIdx, 1);
    }

    return board;
}

/**
 * ピースを設置
 * 成功した場合: beard
 * 失敗した場合: false
 */
function tryPlace(board, row, col, piece) {
    let testBoard = JSON.parse(JSON.stringify(board));
    let connected = false;

    //先に各要素をチェック
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (!piece[i][j]) continue;

            const plRow = row + i;
            const plCol = col + j;

            //範囲外の場合
            if (!checkVolume(maxSize, plRow, plCol)) return false;
            //すでに設置済みの場合
            if (testBoard[plRow][plCol]) return false;

            //隣接しているか
            if (isAdjacent(testBoard, plRow, plCol)) connected = true;
        }
    }

    // どこにも接してないならNG
    if (!connected && hasAnyBlock(board)) {
        return false;
    }

    // ここで初めて書き込む
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (!piece[i][j]) continue;

            testBoard[row + i][col + j] = 1;
        }
    }

    return testBoard;
}

function hasAnyBlock(board) {
    return board.some((row) => row.some((cell) => cell === 1));
}

/**
 * 隣接しているかどうか
 */
function isAdjacent(board, row, col) {
    //各方向をチェック
    for (const [direRow, direCol] of dires) {
        const y = row + direRow;
        const x = col + direCol;

        //隣接しているマスがあるかどうか
        if (board[y] && board[y][x]) return true;
    }

    return false;
}

/**
 * 範囲外の場合は false 範囲内の場合は true
 */
function checkVolume(size, row, col) {
    if (row < 0 || col < 0 || row >= size || col >= size) return false;
    else return true;
}

/**
 * ランダムに回転、反転させたピースをランダムに取得
 */
function getRandomPiece(pieces) {
    let piece = JSON.parse(
        JSON.stringify(pieces[random(0, pieces.length - 1, true)]),
    );

    // ランダム回転
    const rotateCnt = random(0, 3, true);
    for (let i = 0; i < rotateCnt; i++) {
        piece = rotatePiece(piece);
    }

    // 50%で反転
    if (random(0, 1, true)) {
        piece = flipPiece(piece);
    }

    return piece;
}

/**
 * ピースを反転
 */
function flipPiece(piece) {
    return piece.map((row) => [...row].reverse());
}

/**
 * ピースを回転
 */
function rotatePiece(piece) {
    const rows = piece.length;
    const cols = piece[0].length;
    const rotated = [];

    // 列を見る
    for (let c = 0; c < cols; c++) {
        rotated[c] = [];

        // 下から読む
        for (let r = rows - 1; r >= 0; r--) {
            rotated[c].push(piece[r][c]);
        }
    }

    return rotated;
}
