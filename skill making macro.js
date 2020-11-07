(async function main() {
   let skill = {
      "type": "skill",
      "name": "Accounting 3",
      "root1": "perception",
      "root2": "will",
      "open": false,
      "restrictions": "",
      "description": "Updatres"
   }

   let existing = game.items.getName(skill.name)

   if (existing) {
      let updated = {
         _id: existing._id,
         ...skill
      }
      console.log(updated)
      await Item.update(updated)
   } else {
      await Item.create(skill)
   }

})()