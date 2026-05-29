export class Utils {}

/**
 * @param {number} number1
 * @param {number} number2
 * @param {boolean} isFloor
 * @returns {number}
 */
export function random(number1, number2, isFloor) {
    const max = Math.max(...[number1, number2]);
    const min = Math.min(...[number1, number2]);

    if (isFloor) {
        return Math.floor(Math.random() * (max + 1 - min)) + min;
    } else {
        return min + (max - min) * Math.random();
    }
}

/**
 * 入力した配列の順番をシャッフルして返します
 * @param {any[]} array
 * @returns {any[]}
 */
export function aryShuffle(array) {
    const cloneAry = [...array];
    for (let i = cloneAry.length - 1; i >= 0; i--) {
        let rand = Math.floor(Math.random() * (i + 1));
        let tmpStorage = cloneAry[i];
        cloneAry[i] = cloneAry[rand];
        cloneAry[rand] = tmpStorage;
    }
    return cloneAry;
}
