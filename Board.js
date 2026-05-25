import { random } from "./lib/Util.js";

const dires = [
    [-1, 0], //上
    [1, 0], //下
    [0, -1], //左
    [0, 1], //右
];

const maxHeight = 11;
const maxWidth = 11;

export class Board {
    static create() {
        let board = [];

        const maxSize = 12;

        //空の二次元配列を作成
        for (let i = 0; i < maxHeight; i++) {
            board.push(new Array(maxWidth).fill(1));
        }

        return board;
    }
}
