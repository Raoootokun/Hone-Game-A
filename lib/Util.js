export class Utils {
}


/**
 * @param {number} number1
 * @param {number} number2 
 * @param {boolean} isFloor 
 * @returns {number}
 */
export function random(number1, number2, isFloor) {
    const max = Math.max(...[number1, number2]);
    const min = Math.min(...[number1, number2]);

    if(isFloor){
        return Math.floor(Math.random() * (max + 1 - min)) + min;
    }else{
        return min + (max-min) * Math.random();
    };
};