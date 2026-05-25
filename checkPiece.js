// ======================
// piece判定
// ======================
export function checkPiece(pieces, playerPiece) {
    console.log(`aaaaaaaaaaa`);
    // player側
    const normalizedPlayer = normalizeCoords(
        JSON.parse(JSON.stringify(playerPiece)),
    );

    let same = false;
    for (const piece of pieces) {
        // pieceの全パターン取得
        const piecePatterns = getAllPiecePatterns(piece);
        if (normalizedPlayer.length == 0) return;

        let same = false;
        // 全パターン比較
        for (const pattern of piecePatterns) {
            const normalizedPattern = normalizeCoords(pieceToCoords(pattern));

            // 一致判定
            if (
                JSON.stringify(normalizedPlayer) ===
                JSON.stringify(normalizedPattern)
            ) {
                return true;
            }
        }
    }
    //===================================
    return;

    if (same) {
        for (const data of filledPieces) {
            filledBoard[data[0]][data[1]] = 1;
        }
    } else {
        for (const data of filledPieces) {
            filledBoard[data[0]][data[1]] = -2;
        }

        //不一致の場合
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
        flipped.push([...row].reverse());
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
    for (const [r, c] of coords) {
        const row = Number(r);
        const col = Number(c);

        if (row < minRow) minRow = row;
        if (col < minCol) minCol = col;
    }

    // 左上基準へ変換
    const normalized = [];

    for (const [row, col] of coords) {
        normalized.push([Number(row) - minRow, Number(col) - minCol]);
    }

    // ソート
    normalized.sort();

    return normalized;
}
