export function registerSystemSettings(): void {
    game.settings.register("burningwheel", "version", {
        name: "Current World Version",
        scope: "world",
        config: false,
        type: String,
        default: "0.0.0"
    });
    game.settings.register("burningwheel", "dow-data", {
        name: "Serialized Duel of Wits dialog data.",
        scope: "world",
        config: false,
        type: String,
        default: "{}"
    });
    game.settings.register("burningwheel", "fight-data", {
        name: "Serialized Fight! dialog data.",
        scope: "world",
        config: false,
        type: String,
        default: "{}"
    });
    game.settings.register("burningwheel", "rnc-data", {
        name: "Serialized Range and Cover dialog data.",
        scope: "world",
        config: false,
        type: String,
        default: "{}"
    });
}
