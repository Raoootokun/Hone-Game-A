import { random } from "./lib/Util.js";


export class ProblemManager {

    /**
     * ピースを作成
     */
    static createPiece(size, difficulty) {

        // ======================
        // ベース生成
        // ======================

        const piece = [];

        for(let i = 0; i < size; i++) {

            piece.push(
                new Array(size).fill(0)
            );

        }


        // ======================
        // 初期位置
        // ======================

        piece[0][0] = 1;

        const cells = [[0, 0]];


        // 現在セル
        let currentCell = [0, 0];

        // 前回方向
        let oldDirection = null;

        // 失敗回数
        let failCount = 0;


        // ======================
        // マス数
        // ======================

        const count = random(2, size * 2, true);


        // ======================
        // 生成ループ
        // ======================

        while(cells.length < count) {

            const row = currentCell[0];
            const col = currentCell[1];


            // ======================
            // 4方向
            // ======================

            const directions = [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1]
            ];


            // ======================
            // 重み付き方向
            // ======================

            const weightedDirections = [
                ...directions
            ];


            // 直進補正
            if(oldDirection) {

                for(let i = 0; i < difficulty; i++) {

                    weightedDirections.push(
                        oldDirection
                    );

                }
            }


            // ======================
            // ランダム方向
            // ======================

            const dir =
                weightedDirections[
                    random(
                        0,
                        weightedDirections.length - 1,
                        true
                    )
                ];


            const newRow =
                row + dir[0];

            const newCol =
                col + dir[1];


            // ======================
            // 範囲外
            // ======================

            if(
                newRow < 0 ||
                newCol < 0 ||
                newRow >= size ||
                newCol >= size
            ) {

                failCount++;

            }
            else {

                // ======================
                // 既に存在
                // ======================

                if(piece[newRow][newCol] === 1) {

                    failCount++;

                }
                else {

                    // ======================
                    // 配置
                    // ======================

                    piece[newRow][newCol] = 1;

                    cells.push([
                        newRow,
                        newCol
                    ]);


                    // 現在セル更新
                    currentCell = [
                        newRow,
                        newCol
                    ];


                    // 方向保存
                    oldDirection = dir;


                    // 失敗リセット
                    failCount = 0;
                }
            }


            // ======================
            // 詰まり対策
            // ======================

            if(failCount >= 5) {

                const edgeCells =
                    this.getEdgeCells(
                        cells,
                        piece,
                        size
                    );


                // 端セルへワープ
                currentCell =
                    edgeCells[
                        random(
                            0,
                            edgeCells.length - 1,
                            true
                        )
                    ];


                failCount = 0;
            }
        }

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

            let hasEmpty = false;


            for(const [dr, dc] of directions) {

                const newRow = row + dr;
                const newCol = col + dc;


                // 範囲外
                if(
                    newRow < 0 ||
                    newCol < 0 ||
                    newRow >= size ||
                    newCol >= size
                ) {
                    continue;
                }


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

    static createBoard(piece,difficulty) {

        for(let i=0;i<100;i++) {

            const board =
                this.tryCreateBoard(
                    piece,
                    difficulty
                );

            // 成功
            if(board) {
                return board;
            }

            console.log("再生成");
        }

        console.error("board生成失敗");

        return null;
    }


    static tryCreateBoard(piece, difficulty) {
    const patterns = this.getAllPiecePatterns(piece);

    let pieceCount = 0;

    for (const row of piece) {
        for (const cell of row) {
            if (cell === 1) pieceCount++;
        }
    }

    const width = piece[0].length + difficulty;
    const height = piece.length + difficulty;

    const target = Math.floor(width * height * 0.7);

    // ===== ① 安全な初期盤面 =====
    const board = Array.from({ length: height }, () =>
        Array(width).fill(0)
    );

    let filled = 0;

    // ===== ② ランダム配置（制限付き）=====
    const maxAttempts = width * height * 10;

    for (let i = 0; i < maxAttempts; i++) {
        const pattern = patterns[random(0, patterns.length - 1, true)];

        const row = random(0, height - 1, true);
        const col = random(0, width - 1, true);

        const placed = this.placePiece(board, pattern, row, col);

        if (placed) {
            filled += pieceCount;
        }

        // 早期終了
        if (filled >= target) {
            return board;
        }
    }

    // ===== ③ 強制補完（ここが重要）=====
    this.forceFillBoard(board, patterns, target - filled, pieceCount);

    return board;
}



static forceFillBoard(board, patterns, remaining, pieceCount) {
    const height = board.length;
    const width = board[0].length;

    let safety = 0;

    while (remaining > 0 && safety < 1000) {
        safety++;

        const pattern = patterns[random(0, patterns.length - 1, true)];
        const row = random(0, height - 1, true);
        const col = random(0, width - 1, true);

        const placed = this.placePiece(board, pattern, row, col);

        if (placed) {
            remaining -= pieceCount;
        }
    }

    // 最終保険（絶対埋める）
    if (remaining > 0) {
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (remaining <= 0) return;

                if (board[i][j] === 0) {
                    board[i][j] = 1;
                    remaining--;
                }
            }
        }
    }
}



    static placePiece(board,piece,startRow,startCol) {

        // 配置可能判定
        for(let i=0;i<piece.length;i++) {
            for(let j=0;j<piece[i].length;j++) {

                if(piece[i][j] !== 1) continue;

                const row = startRow + i;
                const col = startCol + j;

                // 範囲外
                if(
                    row < 0 ||
                    col < 0 ||
                    row >= board.length ||
                    col >= board[0].length
                ) {
                    return false;
                }

                // 重なり
                if(board[row][col] === 1) {
                    return false;
                }
            }
        }

        // 実際配置
        for(let i=0;i<piece.length;i++) {
            for(let j=0;j<piece[i].length;j++) {

                if(piece[i][j] !== 1) continue;

                const row = startRow + i;
                const col = startCol + j;

                board[row][col] = 1;
            }
        }

        return true;
    }

    static getAllPiecePatterns(basePiece) {

        const patterns = [];

        let current = basePiece;

        for(let i=0;i<4;i++) {

            // 通常
            patterns.push(current);

            // 左右反転
            patterns.push(
                this.flipPiece(current)
            );

            // 次回転
            current =
                this.rotatePiece(current);
        }

        return patterns;
    }

    static rotatePiece(piece) {

        const rows = piece.length;
        const cols = piece[0].length;

        const rotated = [];

        for(let j=0;j<cols;j++) {

            const newRow = [];

            for(let i=rows-1;i>=0;i--) {
                newRow.push(piece[i][j]);
            }

            rotated.push(newRow);
        }

        return rotated;
    }

    static flipPiece(piece) {

        const flipped = [];

        for(const row of piece) {
            flipped.push([...row].reverse());
        }

        return flipped;
    }
}



// ProblemManager.createPiece(3, 1);


