import { random } from "./lib/Util.js";


const dires = [ 
    [ -1, 0 ], //上
    [ 1, 0 ], //下
    [ 0, -1 ], //左
    [ 0, 1 ], //右
];


export class Board {
    static create() {
        let board = [];

        const maxSize = 10;

        //空の二次元配列を作成
        for(let i = 0; i < maxSize; i++) {
            board.push(new Array(maxSize).fill(1));
        }

         

        return board;
    }
}

