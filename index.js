// todo - convert charred black skills into templated skills for foundry
const fs = require('fs').promises;

function restrictions(stock) {

   switch (stock) {
      case "elven":
         return 'Elves only'
      case 'orcish':
         return 'Orcs only'
      case 'dwarven':
         return 'Dwarves only'
      default:
         return ''
   }
}

// make a new random identifier
function id(length = 10) {
   const rnd = () => Math.random().toString(36).substr(2);
   let id = "";
   while (id.length < length)
      id += rnd();
   return id.substr(0, length);
}


(async function main() {

   let file = await fs.readFile('C:/src/charred-black/src/data/gold/skills.json')
   let skills = JSON.parse(file)

   let items = Object.entries(skills).map(([key, value]) => {
      // console.log(`${key}​—${value}`)
      return {
         
         type: 'skill',
         name: key,
         root1: value.roots[0].toLowerCase(),
         root2: value.roots.length == 2 ? value.roots[1].toLowerCase() : '',
         open: value.magic == 1,
         restrictions: `${restrictions(value.stock)}`
      }
   })

   await fs.writeFile('skills.json', JSON.stringify(items))

})()

// https://foundryvtt.com/article/compendium/

// maybe make a macro we can run in foundry to do this import