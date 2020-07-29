import { Ability, BWActor } from "module/actor.js";
import { BWActorSheet } from "module/bwactor-sheet.js";
import * as helpers from "../helpers.js";
import {
    AttributeDialogData,
    buildDiceSourceObject,
    buildRerollData,
    extractBaseData,
    getRollNameClass,
    RerollData,
    RollChatMessageData,
    rollDice,
    templates
} from "../rolls.js";

export async function handleAttrRoll(target: HTMLButtonElement, sheet: BWActorSheet): Promise<unknown> {
    const stat = getProperty(sheet.actor.data, target.dataset.accessor || "") as Ability;
    const actor = sheet.actor as BWActor;
    const attrName = target.dataset.rollableName || "Unknown Attribute";
    const rollModifiers = sheet.actor.getRollModifiers(attrName);
    const data: AttributeDialogData = {
        name: `${attrName} Test`,
        difficulty: 3,
        bonusDice: 0,
        arthaDice: 0,
        woundDice: attrName === "Steel" ? actor.data.data.ptgs.woundDice : undefined,
        obPenalty: actor.data.data.ptgs.obPenalty,
        stat,
        optionalDiceModifiers: rollModifiers.filter(r => r.optional && r.dice),
        optionalObModifiers: rollModifiers.filter(r => r.optional && r.obstacle)
    };

    const html = await renderTemplate(templates.attrDialog, data);
    return new Promise(_resolve =>
        new Dialog({
            title: `${target.dataset.rollableName} Test`,
            content: html,
            buttons: {
                roll: {
                    label: "Roll",
                    callback: async (dialogHtml: JQuery<HTMLElement>) =>
                        attrRollCallback(dialogHtml, stat, sheet, attrName, target.dataset.accessor || "")
                }
            }
        }).render(true)
    );
}

async function attrRollCallback(
        dialogHtml: JQuery<HTMLElement>,
        stat: Ability,
        sheet: BWActorSheet,
        name: string,
        accessor: string) {
    const baseData = extractBaseData(dialogHtml, sheet);
    const exp = parseInt(stat.exp, 10);
    const dieSources = buildDiceSourceObject(exp, baseData.aDice, baseData.bDice, 0, baseData.woundDice, 0);
    const dg = helpers.difficultyGroup(exp + baseData.bDice - baseData.woundDice + baseData.miscDice.sum,
        baseData.obstacleTotal);

    const numDice = exp + baseData.bDice + baseData.aDice - baseData.woundDice + baseData.miscDice.sum;
    const roll = await rollDice(numDice, stat.open, stat.shade);
    if (!roll) { return; }

    const isSuccessful = parseInt(roll.result, 10) >= (baseData.obstacleTotal);

    const fateReroll = buildRerollData(sheet.actor, roll, accessor);
    const callons: RerollData[] = sheet.actor.getCallons(name).map(s => {
        return { label: s, ...buildRerollData(sheet.actor, roll, accessor) as RerollData };
    });
    const data: RollChatMessageData = {
        name: `${name}`,
        successes: roll.result,
        difficulty: baseData.diff,
        obstacleTotal: baseData.obstacleTotal,
        nameClass: getRollNameClass(stat.open, stat.shade),
        success: isSuccessful,
        rolls: roll.dice[0].rolls,
        difficultyGroup: dg,
        penaltySources: baseData.penaltySources,
        dieSources: { ...dieSources, ...baseData.miscDice.entries },
        fateReroll,
        callons
    };

    sheet.actor.addAttributeTest(stat, name, accessor, dg, isSuccessful);
    const messageHtml = await renderTemplate(templates.attrMessage, data);
    return ChatMessage.create({
        content: messageHtml,
        speaker: ChatMessage.getSpeaker({actor: sheet.actor})
    });
}