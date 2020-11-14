const fs = require('fs').promises;

function restrictions(stock) {

   switch (stock) {
      case "elven":
         return 'Elves only'
      case 'orcish':
         return 'Orcs only'
      case 'dwarven':
         return 'Dwarves only'
      case 'wolfish':
         return 'Great wolves only'
      case 'roden':
         return 'Roden only'
      default:
         return ''
   }
}

function image(stock) {

   switch (stock) {
      case "elven":
         return 'modules/game-icons-net/whitetransparent/elf-helmet.svg'
      case 'orcish':
         return 'modules/game-icons-net/whitetransparent/orc-head.svg'
      case 'dwarven':
         return 'modules/game-icons-net/whitetransparent/dwarf-helmet.svg'
      case 'wolfish':
         return 'modules/game-icons-net/whitetransparent/wolf-head.svg'
      case 'roden':
         return 'modules/game-icons-net/whitetransparent/rat.svg'
      case 'trollish':
         return 'modules/game-icons-net/whitetransparent/troll.svg'
      case 'mannish':
         return 'modules/game-icons-net/whitetransparent/crown.svg'
      default:
         return ''
   }
}


(async () => {

   let skillFile = await fs.readFile('C:/src/charred-black/src/data/gold/skills.json')
   let skills = JSON.parse(skillFile)

   let skillItems = Object.entries(skills).map(([key, value]) => {

      return {

         type: 'skill',
         name: key,
         img: `${image(value.stock)}`,
         data: {
            root1: value.roots[0].toLowerCase(),
            root2: value.roots.length == 2 ? value.roots[1].toLowerCase() : '',
            open: value.magic == 1,
            restrictions: `${restrictions(value.stock)}`
         }

      }
   })

   await fs.writeFile('skills.json', JSON.stringify(skillItems))


   let traitFile = await fs.readFile('C:/src/charred-black/all-traits.json')
   let traits = JSON.parse(traitFile)

   let traitItems = Object.entries(traits).map(([key, value]) => {

      return {
         type: 'trait',
         name: key,
         img: `${image(value.restrict ? value.restrict[0]:'')}`,
         // data: {
         //    pointCost: value.cost,
         //    traittype: value.type,
         //    text: value.desc,
         //    restrictions: `${value.restrict ? value.restrict.join(' '):''}`
         // }

      }
   })

   await fs.writeFile('traits.json', JSON.stringify(traitItems))


})()


/* restrictions

mannish
dwarven
orcish
elven
wolfish
roden
trollish
*/