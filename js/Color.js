export class Color {
    static get out() {
        return "#961313";
    }

    static get empty() {
        return "#686762";
    }

    static get filleds() {
        return [
            "rgb(255, 197, 142)",
            "#ff893b",
            "#ffe240",
            "#ffeb79",
            "#d9ffad",
            "#68ff68",
            "#c4fbff",
            "#53f4ff",
            "#c0d0ff",
            "#285eff",
            "#edc2ff",
            "#b968ff",
            "#ffc9e8",
            "#ff68c0",
        ];
    }

    static getRandom() {
        return (
            "#" +
            Math.floor(Math.random() * 16777215)
                .toString(16)
                .padStart(6, "0")
        );
    }
}
