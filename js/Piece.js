import { random } from "./lib/Util.js";

const dires = [
    [-1, 0], //上
    [1, 0], //下
    [0, -1], //左
    [0, 1], //右
];

export class Piece {
    static create(maxSize) {
        //サイズを決定
        const size = random(2, maxSize, true);
        let piece = [];

        //空の二次元配列を作成
        for (let i = 0; i < size; i++) {
            piece.push(new Array(size).fill(0));
        }

        //左端から
        piece[0][0] = 1;

        SETP_1(size, piece);
        // STEP_2(size, piece);
        piece = STEP_3(piece);

        return piece;
    }
}

/**
 * ランダムな方向に進んでいく
 */
function SETP_1(size, piece) {
    let pos = [0, 0]; //現在の位置
    let oldDires = []; //前回の方向

    const tryCnt = 10;
    for (let i = 0; i < tryCnt; i++) {
        //ランダムな方向を取得
        const dire = getRandomDire(oldDires, 4);
        const row = pos[0] + dire[0];
        const col = pos[1] + dire[1];

        //範囲外の場合
        if (!checkVolume(size, row, col)) continue;
        //すでにピースがある場合
        if (piece[row][col]) continue;

        pos = [row, col];
        piece[row][col] = 1;

        oldDires.push(dire);
    }
}

/**
 * 枝別れの用に突然違う方向に伸ばす
 */
function STEP_2(size, piece) {
    const tryCnt = getTryCnt(piece);
    const branchLen = 2;

    //設置済みのマスを取得
    const placedList = [];
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            //空白の場合
            if (!piece[i][j]) continue;
            placedList.push([i, j]);
        }
    }

    for (let i = 0; i < tryCnt; i++) {
        const rdm = placedList[random(0, placedList.length - 1, true)];

        //ランダムな方向を取得
        const dire = getRandomDire([], 0);
        for (let j = 0; j < branchLen; j++) {
            const row = rdm[0] + dire[0];
            const col = rdm[1] + dire[1];

            //範囲外の場合
            if (!checkVolume(size, row, col)) continue;
            //すでに設置済みの場合
            if (piece[row][col]) continue;

            piece[row][col] = 1;
        }
    }
}

/*
 * すべて0の行列を削除
 */
function STEP_3(piece) {
    const piece_ = piece.filter((row) => {
        return row.some((col) => col === 1);
    });

    const piece__ = piece_.map((row) =>
        row.filter((_, colIndex) => {
            return piece_.some((r) => r[colIndex] === 1);
        }),
    );

    return piece__;
}

/**
 * 範囲外の場合は false 範囲内の場合は true
 */
function checkVolume(size, row, col) {
    if (row < 0 || col < 0 || row >= size || col >= size) return false;
    else return true;
}

/**
 * 方向を取得
 * 前回の方向リストが選ばれやすくする
 */
function getRandomDire(oldDires, weight) {
    const _dires_ = JSON.parse(JSON.stringify(dires));
    const _oldDires_ = JSON.parse(JSON.stringify(oldDires));

    //重さの数だけ方向履歴からランダムに取得
    for (let i = 0; i < weight; i++) {
        if (_oldDires_.length == 0) break;
        const idx = random(0, _oldDires_.length - 1, true);
        const addDire = _oldDires_[idx];

        _dires_.push(addDire);
        _oldDires_.splice(idx, 1);
    }

    return _dires_[random(0, _dires_.length - 1, true)];
}

/**
 * ピースの割合を取得
 * 割合をもとに回数を取得
 */
function getTryCnt(piece) {
    let filled = 0;
    let all = 0;

    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            all++;
            if (piece[i][j]) filled++;
        }
    }

    const per = (filled / all) * 100;
    if (per < 25) return 10;
    if (per < 50) return 4;
    if (per < 75) return 2;
}
