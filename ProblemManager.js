import { random } from "./lib/Util.js";


export class ProblemManager {

    /**
     * ピースを作成
     */
 


    static createBoard(piece) {
        const maxSize = 10;
        //ベースを生成
        let board = [];
        for(let i = 0; i < maxSize; i++) {
            board.push(new Array(maxSize).fill(0));
        }

    
        let oldCells = [];
        //ランダムに配置
        for(let i=0; i<30; i++) {
            const res = this.tryPlacePiece(board, piece, maxSize, oldCells);
            if(res)board = res;
        }
 
 
        // console.log(oldCells)
        return board;
    }

    static tryPlacePiece(board, piece, maxSize, oldCells) {

        //oldCellsから既存の設置座標を取得
        if(oldCells.length == 0) {
            while(true) {
                let success = true;

                const rdmPiece = this.randomTransformPiece(piece);
                const rdmRow = 4 //random(0, maxSize-1, true);
                const rdmCol = 4 //random(0, maxSize-1, true);
                const testBoard = JSON.parse(JSON.stringify(board));

                for(let r=0; r<rdmPiece.length; r++) {
                    for(let c=0; c<rdmPiece[r].length; c++) {
                        //ピースにセルがあるか(1かどうか)
                        if(!rdmPiece[r][c])continue;

                        const boardRow = rdmRow + r;
                        const boardCol = rdmCol + c;

                        //範囲外の場合
                        if(boardRow < 0 || boardRow >= maxSize || boardCol < 0 || boardCol >= maxSize) {
                            success = false;
                            break;
                        }

                        if(testBoard[boardRow][boardCol]) {
                            success = false;
                            break;
                        }

                        //ボードにピースを追加
                        testBoard[boardRow][boardCol] = 1;
                    }
                }

                if(success) {
                    for(let r=0; r<testBoard.length; r++) {
                        for(let c=0; c<testBoard[r].length; c++) {
                            if(!testBoard[r][c])continue;
                            oldCells.push([r,c])
                        }
                    }
                    return testBoard;
                }

            }
            
        }else {
            let tryCnt = 10000;
            while(tryCnt > 0) {
                tryCnt--;

                let success = true;

                const rdmPiece = this.randomTransformPiece(piece);

                const cell = oldCells[random(0, oldCells.length - 1, true)];

                let targetRow = cell[0];
                let targetCol = cell[1];

                if(random(0,1) > 0.5) {
                    targetRow += random(0,1,true) ? -1 : 1;
                } else {
                    targetCol += random(0,1,true) ? -1 : 1;
                }

                const pieceCells = [];

                for(let r = 0; r < rdmPiece.length; r++) {
                    for(let c = 0; c < rdmPiece[r].length; c++) {
                        if(rdmPiece[r][c]) {
                            pieceCells.push([r, c]);
                        }
                    }
                }

                const baseCell =
                    pieceCells[random(0, pieceCells.length - 1, true)];

                const rdmRow = targetRow - baseCell[0];
                const rdmCol = targetCol - baseCell[1];

                const testBoard = JSON.parse(JSON.stringify(board));

                for(let r = 0; r < rdmPiece.length; r++) {
                    for(let c = 0; c < rdmPiece[r].length; c++) {

                        if(!rdmPiece[r][c]) continue;

                        const boardRow = rdmRow + r;
                        const boardCol = rdmCol + c;

                        if(
                            boardRow < 0 ||
                            boardRow >= maxSize ||
                            boardCol < 0 ||
                            boardCol >= maxSize
                        ) {
                            success = false;
                            break;
                        }

                        if(testBoard[boardRow][boardCol]) {
                            success = false;
                            break;
                        }

                        testBoard[boardRow][boardCol] = 1;
                    }

                    if(!success) break;
                }

                if(success) {
                    oldCells = [];
                    for(let r=0; r<testBoard.length; r++) {
                        for(let c=0; c<testBoard[r].length; c++) {
                            if(!testBoard[r][c])continue;
                            oldCells.push([r,c])
                        }
                    }


                    return testBoard;
                }
            }
        }

    }
 






   


    static rotatePiece(piece) {
        const rows = piece.length;
        const cols = piece[0].length;
        const rotated = [];

        // 列を見る
        for(let c = 0; c < cols; c++) {
            rotated[c] = [];

            // 下から読む
            for(let r = rows - 1; r >= 0; r--) {
                rotated[c].push(
                    piece[r][c]
                );
            }
        }

        return rotated;
    }

    static flipPiece(piece) {
        return piece.map(
            row => [...row].reverse()
        );
    }

    static randomTransformPiece(piece) {
        let transformed = piece;

        // ランダム回転
        const rotateCount = random(0, 3, true);

        for(let i = 0; i < rotateCount; i++) {
            transformed = this.rotatePiece(transformed);
        }

        // 50%で反転
        if(random(0, 1, true)) {
            transformed = this.flipPiece(transformed);
        }

        return transformed;
    }


} 