import { random } from "./lib/Util.js";


export class ProblemManager {

    /**
     * ピースを作成
     */
    static createPiece(size, difficulty) {
        //sizeをもとにベースを作成
        const piece = [];
        for(let i=0; i<size; i++) {
            piece.push( new Array(size).fill(0) );
        }

        //スタートを作成
        piece[0][0] = 1;

        // 現在置かれてる座標
        const cells = [[0, 0]];

        //前回の方向
        const oldDirections = [];

        //count個になるまで追加
        //マスの個数を生成
        const count = random(2, size*size, true);
        while(cells.length < count) {
            //既存セルからランダムに取得
            const edgeCells = this.getEdgeCells(cells, piece, size);
            const randomCell = edgeCells[ random(0, edgeCells.length - 1, true) ];
            const row = randomCell[0];
            const col = randomCell[1];


            //4方向
            const directions = [
                [-1, 0], // 上
                [1, 0],  // 下
                [0, -1], // 左
                [0, 1]   // 右
            ];
            //ランダム方向を取得
            const dir = directions[random(0, directions.length - 1, true)];
            oldDirections.push(dir);

            //縦横の座標に方向ベクトルを追加し、移動させる
            const newRow = row + dir[0];
            const newCol = col + dir[1];

            //0より小さくなる場合は範囲外判定
            //sizeより大きくなる場合は範囲外判定
            if(newRow < 0 || newCol < 0 || newRow >= size || newCol >= size)continue;

            //既にある場合
            if(piece[newRow][newCol] === 1)continue;


            //追加
            piece[newRow][newCol] = 1;
            //既存セルを保存
            cells.push([newRow, newCol]);
        }




        console.log(piece)
        return piece;
    }

    /**
     * 端の空きセルを取得
     */
    static getEdgeCells(cells, piece, size) {
        const edges = [];

        // 4方向
        const directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
        ];

        for(const [row, col] of cells) {
            // 空きがあるか
            let hasEmpty = false;

            for(const [dr, dc] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;

                // 範囲外
                if(newRow < 0 || newCol < 0 || newRow >= size || newCol >= size)continue;

                // 空き発見
                if(piece[newRow][newCol] === 0) {
                    hasEmpty = true;
                    break;
                }
            }


            // 端セル
            if(hasEmpty) {
                edges.push([row, col]);
            }
        }

        return edges;
    }
}


class Direction {
    static get keys() {
        return Object.keys(Direction.list)
    }

    static list() {
        return {
            up: [-1, 0],
            down: [1, 0],
            left: [0, -1],
            right: [0, 1],
        }
    }
}

// ProblemManager.createPiece(3, 1);


