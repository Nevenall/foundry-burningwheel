import { TracksTests } from "./bwactor.js";
import { ArmorRootData } from "./items/armor.js";
import { BWItem, DisplayClass, ItemType } from "./items/item.js";
import { Skill } from "./items/skill.js";

export function updateTestsNeeded(ability: TracksTests & DisplayClass, needRoutines = true, woundDice = 0, tax = 0):void {
    const values = AbilityLookup[ability.exp] || { r: 1, d: 1, c: 1};
    ability.routineNeeded = values.r;
    ability.challengingNeeded = values.c;
    ability.difficultNeeded = values.d;
    ability.cssClass = canAdvance(ability, needRoutines) ? "can-advance" : "";
    if (parseInt(ability.exp) <= woundDice + tax) {
        ability.cssClass += " wound-disabled";
    }
}

export function slugify(name: string): string {
    return name.trim().replace(" ", "-");
}

export function toDictionary(list: string[]): StringIndexedObject<string> {
    const o:StringIndexedObject<string> = {};
    list.forEach(s => o[s] = s.titleCase());
    return o;
}

export function canAdvance(skill: TracksTests, needRoutines = true): boolean {
    const enoughRoutine = (parseInt(skill.routine, 10) >= (skill.routineNeeded || 0 ));
    const enoughDifficult = parseInt(skill.difficult, 10) >= (skill.difficultNeeded || 0);
    const enoughChallenging = parseInt(skill.challenging, 10) >= (skill.challengingNeeded || 0);

    if (parseInt(skill.exp, 10) === 0) {
        return enoughRoutine || enoughDifficult || enoughChallenging;
    }

    if (parseInt(skill.exp, 10) < 5 && needRoutines) {
        // need only enough difficult or routine, not both
        return enoughRoutine && (enoughDifficult || enoughChallenging);
    }
    // otherwise, need both routine and difficult tests to advance, don't need routine anymore
    return enoughDifficult && enoughChallenging;
}

export function addTestToSkill(
        skill: Skill,
        difficulty: TestString): Promise<unknown> | undefined {
    switch (difficulty) {
        case "Routine":
            if (parseInt(skill.data.data.routine, 10) < (skill.data.data.routineNeeded || 0)) {
                return skill.update({ "data.routine": parseInt(skill.data.data.routine, 10) + 1 }, {});
            }
            break;
        case "Difficult":
            if (parseInt(skill.data.data.difficult, 10) < (skill.data.data.difficultNeeded || 0)) {
                return skill.update({ "data.difficult": parseInt(skill.data.data.difficult, 10) + 1 }, {});
            }
            break;
        case "Challenging":
            if (parseInt(skill.data.data.challenging, 10) < (skill.data.data.challengingNeeded || 0)) {
                return skill.update({ "data.challenging": parseInt(skill.data.data.challenging, 10) + 1 }, {});
            }
            break;
        case "Routine/Difficult":
            if (parseInt(skill.data.data.routine, 10) < (skill.data.data.routineNeeded || 0)) {
                return skill.update({ "data.routine": parseInt(skill.data.data.routine, 10) + 1 }, {});
            } else if (parseInt(skill.data.data.difficult, 10) < (skill.data.data.difficultNeeded || 0)) {
                return skill.update({ "data.difficult": parseInt(skill.data.data.difficult, 10) + 1 }, {});
            }
            break;
    }
    return;
}

export function advanceSkill(skill: Skill): Promise<Skill> {
    const exp = parseInt(skill.data.data.exp, 10);
    return skill.update({ "data.routine": 0, "data.difficult": 0, "data.challenging": 0, "data.exp": exp + 1 }, {});
}

export function difficultyGroup(dice: number, difficulty: number): TestString {
    if (difficulty > dice) {
        return "Challenging";
    }
    if (dice === 1) {
        return "Routine/Difficult";
    }
    if (dice === 2) {
        return difficulty === 2 ? "Difficult" : "Routine";
    }

    let spread = 1;
    if (dice > 6) {
        spread = 3;
    } else if (dice > 3) {
        spread = 2;
    }

     return (dice - spread >= difficulty) ? "Routine" : "Difficult";
}

export function getWorstShadeString(a: ShadeString, b: ShadeString): ShadeString {
    if (a === b) {
        return a;
    } else if (a === "B" || b === "B") {
        return "B";
    }
    return "G";
}

export function getArmorLocationDataFromItem(i: ArmorRootData): { [k: string]: ArmorRootData } {
    if (!i.data.equipped) { return {}; }
    const data: StringIndexedObject<ArmorRootData> = {};
    if (i.data.hasHelm) { data.head = i; }
    if (i.data.hasTorso) { data.torso = i; }
    if (i.data.hasLeftArm) { data.leftArm = i; }
    if (i.data.hasRightArm) { data.rightArm = i; }
    if (i.data.hasRightLeg) { data.rightLeg = i; }
    if (i.data.hasLeftLeg) { data.leftLeg = i; }
    if (i.data.hasShield) { data.shield = i; }
    return data;
}

export async function sleep(ms: number): Promise<unknown> {
    return new Promise(r => setTimeout(r, ms));
}

export function isStat(name: string): boolean {
    return ([
        "forte", "power", "will", "perception", "agility", "speed"
    ].indexOf(name.toLowerCase()) !== -1);
}

export async function getItemsOfTypes(itemTypes: ItemType[], compendiums?: string[]): Promise<(BWItem & {itemSource?: string })[]> {
    let itemList: (BWItem & {itemSource?: string })[] = [];
    const useAll = !compendiums;
    const useWorld = compendiums?.indexOf('world') !== -1;
    if (useWorld) {
        itemList = game.items.filter((i: BWItem) => itemTypes.indexOf(i.type) !== -1)
        .map((item: BWItem & {itemSource?: string } ) => {
            item.itemSource = "World"; 
            return item; 
        }) as (BWItem & {itemSource?: string })[];
    }

    let compendiumItems: (BWItem & {itemSource?: string })[] = [];
    let sourceLabel = "";
    const packs = Array.from(game.packs.values()).filter(p => useAll || compendiums?.indexOf(p.collection) !== -1) as Compendium[];
    for (const pack of packs) {
        const packItems = await pack.getContent();
        sourceLabel = compendiumName(pack);
        compendiumItems = compendiumItems.concat(
            ...packItems.filter((item: (BWItem & {itemSource?: string })) => itemTypes.indexOf(item.type) !== -1)
            .map((item: BWItem & {itemSource?: string } ) => {
                item.itemSource = sourceLabel;
                return item;
            })) as (BWItem & {itemSource?: string })[];
    }
    return itemList.concat(...compendiumItems);
}

export function compendiumName(c: Compendium): string {
    return c.collection.substr(c.collection.indexOf('.')+1).replace('-', ' ').titleCase();
}

export async function getItemsOfType<T extends BWItem>(itemType: ItemType, compendiums?: string[]): Promise<(T & {itemSource?: string })[]> {
    return getItemsOfTypes([itemType], compendiums) as Promise<(T & {itemSource?: string })[]>;
}

export function getCompendiumList(): { name: string, label: string}[] {
    const packs = Array.from(game.packs.values()) as Compendium[];
    return [ { name: "world", label: "World Content" }].concat(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...packs.filter((p: any) => game.user.isGM || !p.private)
        .map(p => {
            return {
                name: p.collection,
                label: compendiumName(p)
            };
        })
        .sort((a, b) => a.label.localeCompare(b.label))
    );
}

export async function notifyError(title: string, errorMessage: string): Promise<Application> {
    return new Dialog({
        title,
        content: `<p>${errorMessage}</p>`,
        buttons: {
            ok: {
                label: "OK"
            }
        }
    }).render(true);
}

export function deCamelCaseify(phrase: string): string {
    return phrase.replace(/([a-zA-Z])(?=[A-Z])/, '$1 ');
}

export function DivOfText(text: string | number, cssClass?: string): HTMLDivElement {
    const element = document.createElement("div");
    element.innerHTML = text.toString();
    if (cssClass) { element.className = cssClass; }
    return element;
}

export function translateWoundValue(shade: ShadeString, value: number | string): string {
    value = parseInt(value.toString());
    if (value < 17) {
        return shade + value;
    }
    if (shade === "B") {
        value -= 16;
        shade = "G";
        if (value < 17) {
            return shade + value;
        }
    }
    if (shade === "G") {
        value -= 16;
        shade = "W";
    }
    return shade + value;
}

const AbilityLookup = {
    "1": { r: 1, d: 1, c: 1},
    "2": { r: 2, d: 1, c: 1},
    "3": { r: 3, d: 2, c: 1},
    "4": { r: 4, d: 2, c: 1},
    "5": { r: 0, d: 3, c: 1},
    "6": { r: 0, d: 3, c: 2},
    "7": { r: 0, d: 4, c: 2},
    "8": { r: 0, d: 4, c: 3},
    "9": { r: 0, d: 5, c: 3},
};

export type TestString = "Routine" | "Difficult" | "Challenging" | "Routine/Difficult";
export type ShadeString = "B" | "G" | "W";
export type StringIndexedObject<T> = { [i: string]: T };

/** For Sorting Items/Actors/Etc. by Name */
export const byName = (a: { name: string }, b: { name: string }): number => a.name.localeCompare(b.name);