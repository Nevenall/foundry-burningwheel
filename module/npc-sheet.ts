import { BWActorSheet } from "./bwactor-sheet.js";
import { ShadeString } from "./helpers.js";
import { BWActor } from "./bwactor.js";
import { TraitDataRoot, SkillDataRoot } from "./items/item.js";
import { Npc } from "./npc.js";
import { handleNpcStatRoll } from "./rolls/rollNpcStat.js";

export class NpcSheet extends BWActorSheet {
    actor: BWActor & Npc;
    getData(): ActorSheetData<unknown> {
        const data = super.getData() as NpcSheetData;
        const rollable = true; const open = true;
        const actor = this.actor;
        data.statRow = [
            { statName: "will", rollable, label: "Wi", value: actor.data.data.will.exp, valuePath: "will.exp", shade: actor.data.data.will.shade, shadePath: "will.shade" },
            { statName: "perception", rollable, label: "Pe", value: actor.data.data.perception.exp, valuePath: "perception.exp", shade: actor.data.data.perception.shade, shadePath: "perception.shade" },
            { statName: "agility", rollable, label: "Ag", value: actor.data.data.agility.exp, valuePath: "agility.exp", shade: actor.data.data.agility.shade, shadePath: "agility.shade" },
            { statName: "speed", rollable, label: "Sp", value: actor.data.data.speed.exp, valuePath: "speed.exp", shade: actor.data.data.speed.shade, shadePath: "speed.shade" },
            { statName: "power", rollable, label: "Po", value: actor.data.data.power.exp, valuePath: "power.exp", shade: actor.data.data.power.shade, shadePath: "power.shade" },
            { statName: "forte", rollable, label: "Fo", value: actor.data.data.forte.exp, valuePath: "forte.exp", shade: actor.data.data.forte.shade, shadePath: "forte.shade" },
            { statName: "health", rollable, label: "Hea", value: actor.data.data.health.exp, valuePath: "health.exp", shade: actor.data.data.health.shade, shadePath: "health.shade" },
            { label: "Ref", value: actor.data.data.reflexes || 0, valuePath: "reflexes", shade: actor.data.data.reflexesShade, shadePath: "reflexesShade" },
            { label: "MW", value: actor.data.data.ptgs.moThresh || 0, valuePath: "ptgs.moThresh", shade: actor.data.data.ptgs.woundShade, shadePath: "ptgs.woundShade" },
            { statName: "steel", rollable, open, label: "Ste", value: actor.data.data.steel.exp, valuePath: "steel.exp", shade: actor.data.data.steel.shade, shadePath: "steel.shade" },
            { label: "Hes", value: actor.data.data.hesitation || 0, valuePath: "hesitation" },
            { statName: "resources", rollable, label: "Res", value: actor.data.data.resources.exp, valuePath: "resources.exp", shade: actor.data.data.resources.shade, shadePath: "resources.shade" },
            { statName: "circles", rollable, label: "Cir", value: actor.data.data.circles.exp, valuePath: "circles.exp", shade: actor.data.data.circles.shade, shadePath: "circles.shade" },
            { label: "Str", value: actor.data.data.stride, valuePath: "stride" },
        ];
        data.beliefs = [];
        data.traits = [];
        data.instincts = [];
        data.skills = [];
        data.weapons = [];
        data.affiliations = [];
        data.reputations = [];
        data.relationships = [];
        data.gear = [];
        data.spells = [];
        actor.data.items.forEach((i) => {
            switch (i.type) {
                case "belief":
                    data.beliefs.push(i); break;
                case "trait":
                    data.traits.push(i as TraitDataRoot); break;
                case "instinct":
                    data.instincts.push(i); break;
                case "skill":
                    data.skills.push(i as SkillDataRoot); break;
                case "melee weapon":
                    if (i.name !== "Bare Fist") {
                        data.gear.push(i);
                    }
                    data.weapons.push(i);
                    break;
                case "relationship":
                    data.relationships.push(i); break;
                case "reputation":
                    data.reputations.push(i); break;
                case "affiliation":
                    data.affiliations.push(i); break;
                case "spell":
                    data.spells.push(i); break;
                default:
                    data.gear.push(i); break;
            }
        });
        return data;
    }

    activateListeners(html: JQuery): void {
        super.activateListeners(html);
        html.find("div[data-action='edit']").on('click', (e) => this._editSheetItem(e));
        html.find("div[data-action='delete']").on('click', (e) => this._deleteSheetItem(e));
        html.find("i[data-action='add']").on('click', (e) => this._addSheetItem(e));
        html.find("div[data-action='rollStat'], div[data-action='rollStatOpen']").on('click', (e) => handleNpcStatRoll({ target: e.target, sheet: this}));
    }
    _editSheetItem(e: JQuery.ClickEvent): void {
        const targetId = $(e.target).data("id") as string;
        const item = this.actor.getOwnedItem(targetId);
        item?.sheet.render(true);
    }
    _deleteSheetItem(e: JQuery.ClickEvent): void {
        const targetId = $(e.target).data("id") as string;
        this.actor.deleteOwnedItem(targetId);
    }
    _addSheetItem(e: JQuery.ClickEvent): void {
        const itemType = $(e.target).data("type") as string;
        this.actor.createOwnedItem({
            name: `New ${itemType}`,
            type: itemType
        }).then(i => this.actor.getOwnedItem(i._id)?.sheet.render(true));
    }
}

export interface NpcSheetData extends ActorSheetData {
    statRow: NPCStatEntry[];
    beliefs: ItemData[];
    instincts: ItemData[];
    traits: TraitDataRoot[];
    skills: SkillDataRoot[];
    weapons: ItemData[];
    affiliations: ItemData[];
    reputations: ItemData[];
    relationships: ItemData[];
    gear: ItemData[];
    spells: ItemData[];
    actor: BWActor;
}

interface NPCStatEntry {
    rollable?: boolean;
    open?: boolean;
    label: string;
    valuePath: string;
    value: string | number;
    statName?: string;
    shade?: ShadeString;
    shadePath?: string;
}