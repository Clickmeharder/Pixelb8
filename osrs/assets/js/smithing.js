window.SmithingTool = (() => {
  const $=id=>document.getElementById(id);
  const COLS=['level','icon','inputs','inputCost','output','profit','xp','xpHr','gpHr'];
  let market=[],byName=new Map(),sortField='profit',sortDir=-1;
  const methods=[
    {cat:"Smelting",level:1,members:false,name:"Bronze bar",out:"Bronze bar",xp:6.2,rate:900,in:[["Copper ore",1],["Tin ore",1]]},
    {cat:"Smelting",level:13,members:true,name:"Blurite bar",out:"Blurite bar",xp:8,rate:900,in:[["Blurite ore",1]],nontradeable:true,note:"Untradeable"},
    {cat:"Smelting",level:15,members:false,name:"Iron bar",out:"Iron bar",xp:12.5,rate:900,in:[["Iron ore",1]]},
    {cat:"Smelting",level:20,members:true,name:"Elemental bar",out:"Elemental bar",xp:7.5,rate:900,in:[["Elemental ore",1],["Coal",4]],nontradeable:true,note:"Untradeable"},
    {cat:"Smelting",level:20,members:false,name:"Silver bar",out:"Silver bar",xp:13.7,rate:900,in:[["Silver ore",1]]},
    {cat:"Smelting",level:25,members:true,name:"Lead bar",out:"Lead bar",xp:15.5,rate:720,in:[["Lead ore",2]],metal:"Lead"},
    {cat:"Smelting",level:30,members:false,name:"Steel bar",out:"Steel bar",xp:17.5,rate:900,in:[["Iron ore",1],["Coal",2]]},
    {cat:"Smelting",level:40,members:false,name:"Gold bar",out:"Gold bar",xp:22.5,rate:900,in:[["Gold ore",1]]},
    {cat:"Smelting",level:45,members:true,name:"Lovakite bar",out:"Lovakite bar",xp:20,rate:900,in:[["Lovakite ore",1],["Coal",2]],nontradeable:true,note:"Untradeable"},
    {cat:"Smelting",level:50,members:false,name:"Mithril bar",out:"Mithril bar",xp:30,rate:900,in:[["Mithril ore",1],["Coal",4]]},
    {cat:"Smelting",level:70,members:false,name:"Adamantite bar",out:"Adamantite bar",xp:37.5,rate:900,in:[["Adamantite ore",1],["Coal",6]]},
    {cat:"Smelting",level:74,members:true,name:"Cupronickel bar",out:"Cupronickel bar",xp:42,rate:900,in:[["Nickel ore",1],["Copper ore",2]],metal:"Cupronickel"},
    {cat:"Smelting",level:85,members:false,name:"Runite bar",out:"Runite bar",xp:50,rate:900,in:[["Runite ore",1],["Coal",8]]},
    {cat:"Anvil",level:1,members:false,name:"Bronze axe",out:"Bronze axe",outQty:1,xp:12.5,rate:1200,in:[["Bronze bar",1]],metal:"Bronze",tags:["weapons","tools"],slot:null},
    {cat:"Anvil",level:1,members:false,name:"Bronze dagger",out:"Bronze dagger",outQty:1,xp:12.5,rate:1200,in:[["Bronze bar",1]],metal:"Bronze",tags:["weapons"],slot:null},
    {cat:"Anvil",level:2,members:false,name:"Bronze mace",out:"Bronze mace",outQty:1,xp:12.5,rate:1200,in:[["Bronze bar",1]],metal:"Bronze",tags:["weapons"],slot:null},
    {cat:"Anvil",level:3,members:false,name:"Bronze med helm",out:"Bronze med helm",outQty:1,xp:12.5,rate:1200,in:[["Bronze bar",1]],metal:"Bronze",tags:["armour"],slot:"head"},
    {cat:"Anvil",level:3,members:true,name:"Bronze bolts (unf)",out:"Bronze bolts (unf)",outQty:10,xp:12.5,rate:1200,in:[["Bronze bar",1]],metal:"Bronze",tags:["ranged"],slot:null},
    {cat:"Anvil",level:4,members:false,name:"Bronze sword",out:"Bronze sword",outQty:1,xp:12.5,rate:1200,in:[["Bronze bar",1]],metal:"Bronze",tags:["weapons"],slot:null},
    {cat:"Anvil",level:4,members:true,name:"Bronze dart tip",out:"Bronze dart tip",outQty:10,xp:12.5,rate:1200,in:[["Bronze bar",1]],metal:"Bronze",tags:["ranged"],slot:null},
    {cat:"Anvil",level:4,members:false,name:"Bronze nails",out:"Bronze nails",outQty:15,xp:12.5,rate:1200,in:[["Bronze bar",1]],metal:"Bronze",tags:["tools"],slot:null},
    {cat:"Anvil",level:5,members:false,name:"Bronze scimitar",out:"Bronze scimitar",outQty:1,xp:25.0,rate:1200,in:[["Bronze bar",2]],metal:"Bronze",tags:["weapons"],slot:null},
    {cat:"Anvil",level:5,members:false,name:"Bronze arrowtips",out:"Bronze arrowtips",outQty:15,xp:12.5,rate:1200,in:[["Bronze bar",1]],metal:"Bronze",tags:["ranged"],slot:null},
    {cat:"Anvil",level:6,members:false,name:"Bronze longsword",out:"Bronze longsword",outQty:1,xp:25.0,rate:1200,in:[["Bronze bar",2]],metal:"Bronze",tags:["weapons"],slot:null},
    {cat:"Anvil",level:6,members:true,name:"Bronze limbs",out:"Bronze limbs",outQty:1,xp:12.5,rate:1200,in:[["Bronze bar",1]],metal:"Bronze",tags:["ranged","tools"],slot:null},
    {cat:"Anvil",level:6,members:true,name:"Bronze javelin heads",out:"Bronze javelin heads",outQty:5,xp:12.5,rate:1200,in:[["Bronze bar",1]],metal:"Bronze",tags:["ranged"],slot:null},
    {cat:"Anvil",level:7,members:false,name:"Bronze full helm",out:"Bronze full helm",outQty:1,xp:25.0,rate:1200,in:[["Bronze bar",2]],metal:"Bronze",tags:["armour"],slot:"head"},
    {cat:"Anvil",level:7,members:true,name:"Bronze knife",out:"Bronze knife",outQty:5,xp:12.5,rate:1200,in:[["Bronze bar",1]],metal:"Bronze",tags:["ranged","tools"],slot:null},
    {cat:"Anvil",level:8,members:false,name:"Bronze sq shield",out:"Bronze sq shield",outQty:1,xp:25.0,rate:1200,in:[["Bronze bar",2]],metal:"Bronze",tags:["armour"],slot:"shield"},
    {cat:"Anvil",level:9,members:false,name:"Bronze warhammer",out:"Bronze warhammer",outQty:1,xp:37.5,rate:1200,in:[["Bronze bar",3]],metal:"Bronze",tags:["weapons"],slot:null},
    {cat:"Anvil",level:10,members:false,name:"Bronze battleaxe",out:"Bronze battleaxe",outQty:1,xp:37.5,rate:1200,in:[["Bronze bar",3]],metal:"Bronze",tags:["weapons","tools"],slot:null},
    {cat:"Anvil",level:11,members:false,name:"Bronze chainbody",out:"Bronze chainbody",outQty:1,xp:37.5,rate:1200,in:[["Bronze bar",3]],metal:"Bronze",tags:["armour"],slot:"body"},
    {cat:"Anvil",level:12,members:false,name:"Bronze kiteshield",out:"Bronze kiteshield",outQty:1,xp:37.5,rate:1200,in:[["Bronze bar",3]],metal:"Bronze",tags:["armour"],slot:"shield"},
    {cat:"Anvil",level:13,members:true,name:"Bronze claws",out:"Bronze claws",outQty:1,xp:25.0,rate:1200,in:[["Bronze bar",2]],metal:"Bronze",tags:["weapons"],slot:null},
    {cat:"Anvil",level:14,members:false,name:"Bronze 2h sword",out:"Bronze 2h sword",outQty:1,xp:37.5,rate:1200,in:[["Bronze bar",3]],metal:"Bronze",tags:["weapons"],slot:null},
    {cat:"Anvil",level:16,members:false,name:"Bronze platelegs",out:"Bronze platelegs",outQty:1,xp:37.5,rate:1200,in:[["Bronze bar",3]],metal:"Bronze",tags:["armour"],slot:"legs"},
    {cat:"Anvil",level:16,members:false,name:"Bronze plateskirt",out:"Bronze plateskirt",outQty:1,xp:37.5,rate:1200,in:[["Bronze bar",3]],metal:"Bronze",tags:["armour"],slot:"legs"},
    {cat:"Anvil",level:18,members:false,name:"Bronze platebody",out:"Bronze platebody",outQty:1,xp:62.5,rate:900,in:[["Bronze bar",5]],metal:"Bronze",tags:["armour"],slot:"body"},
    {cat:"Anvil",level:16,members:false,name:"Iron axe",out:"Iron axe",outQty:1,xp:25,rate:1200,in:[["Iron bar",1]],metal:"Iron",tags:["weapons","tools"],slot:null},
    {cat:"Anvil",level:16,members:false,name:"Iron dagger",out:"Iron dagger",outQty:1,xp:25,rate:1200,in:[["Iron bar",1]],metal:"Iron",tags:["weapons"],slot:null},
    {cat:"Anvil",level:17,members:false,name:"Iron mace",out:"Iron mace",outQty:1,xp:25,rate:1200,in:[["Iron bar",1]],metal:"Iron",tags:["weapons"],slot:null},
    {cat:"Anvil",level:18,members:false,name:"Iron med helm",out:"Iron med helm",outQty:1,xp:25,rate:1200,in:[["Iron bar",1]],metal:"Iron",tags:["armour"],slot:"head"},
    {cat:"Anvil",level:18,members:true,name:"Iron bolts (unf)",out:"Iron bolts (unf)",outQty:10,xp:25,rate:1200,in:[["Iron bar",1]],metal:"Iron",tags:["ranged"],slot:null},
    {cat:"Anvil",level:19,members:false,name:"Iron sword",out:"Iron sword",outQty:1,xp:25,rate:1200,in:[["Iron bar",1]],metal:"Iron",tags:["weapons"],slot:null},
    {cat:"Anvil",level:19,members:true,name:"Iron dart tip",out:"Iron dart tip",outQty:10,xp:25,rate:1200,in:[["Iron bar",1]],metal:"Iron",tags:["ranged"],slot:null},
    {cat:"Anvil",level:19,members:false,name:"Iron nails",out:"Iron nails",outQty:15,xp:25,rate:1200,in:[["Iron bar",1]],metal:"Iron",tags:["tools"],slot:null},
    {cat:"Anvil",level:20,members:false,name:"Iron scimitar",out:"Iron scimitar",outQty:1,xp:50,rate:1200,in:[["Iron bar",2]],metal:"Iron",tags:["weapons"],slot:null},
    {cat:"Anvil",level:20,members:false,name:"Iron arrowtips",out:"Iron arrowtips",outQty:15,xp:25,rate:1200,in:[["Iron bar",1]],metal:"Iron",tags:["ranged"],slot:null},
    {cat:"Anvil",level:21,members:false,name:"Iron longsword",out:"Iron longsword",outQty:1,xp:50,rate:1200,in:[["Iron bar",2]],metal:"Iron",tags:["weapons"],slot:null},
    {cat:"Anvil",level:21,members:true,name:"Iron limbs",out:"Iron limbs",outQty:1,xp:25,rate:1200,in:[["Iron bar",1]],metal:"Iron",tags:["ranged","tools"],slot:null},
    {cat:"Anvil",level:21,members:true,name:"Iron javelin heads",out:"Iron javelin heads",outQty:5,xp:25,rate:1200,in:[["Iron bar",1]],metal:"Iron",tags:["ranged"],slot:null},
    {cat:"Anvil",level:22,members:false,name:"Iron full helm",out:"Iron full helm",outQty:1,xp:50,rate:1200,in:[["Iron bar",2]],metal:"Iron",tags:["armour"],slot:"head"},
    {cat:"Anvil",level:22,members:true,name:"Iron knife",out:"Iron knife",outQty:5,xp:25,rate:1200,in:[["Iron bar",1]],metal:"Iron",tags:["ranged","tools"],slot:null},
    {cat:"Anvil",level:23,members:false,name:"Iron sq shield",out:"Iron sq shield",outQty:1,xp:50,rate:1200,in:[["Iron bar",2]],metal:"Iron",tags:["armour"],slot:"shield"},
    {cat:"Anvil",level:24,members:false,name:"Iron warhammer",out:"Iron warhammer",outQty:1,xp:75,rate:1200,in:[["Iron bar",3]],metal:"Iron",tags:["weapons"],slot:null},
    {cat:"Anvil",level:25,members:false,name:"Iron battleaxe",out:"Iron battleaxe",outQty:1,xp:75,rate:1200,in:[["Iron bar",3]],metal:"Iron",tags:["weapons","tools"],slot:null},
    {cat:"Anvil",level:26,members:false,name:"Iron chainbody",out:"Iron chainbody",outQty:1,xp:75,rate:1200,in:[["Iron bar",3]],metal:"Iron",tags:["armour"],slot:"body"},
    {cat:"Anvil",level:27,members:false,name:"Iron kiteshield",out:"Iron kiteshield",outQty:1,xp:75,rate:1200,in:[["Iron bar",3]],metal:"Iron",tags:["armour"],slot:"shield"},
    {cat:"Anvil",level:28,members:true,name:"Iron claws",out:"Iron claws",outQty:1,xp:50,rate:1200,in:[["Iron bar",2]],metal:"Iron",tags:["weapons"],slot:null},
    {cat:"Anvil",level:29,members:false,name:"Iron 2h sword",out:"Iron 2h sword",outQty:1,xp:75,rate:1200,in:[["Iron bar",3]],metal:"Iron",tags:["weapons"],slot:null},
    {cat:"Anvil",level:31,members:false,name:"Iron platelegs",out:"Iron platelegs",outQty:1,xp:75,rate:1200,in:[["Iron bar",3]],metal:"Iron",tags:["armour"],slot:"legs"},
    {cat:"Anvil",level:31,members:false,name:"Iron plateskirt",out:"Iron plateskirt",outQty:1,xp:75,rate:1200,in:[["Iron bar",3]],metal:"Iron",tags:["armour"],slot:"legs"},
    {cat:"Anvil",level:33,members:false,name:"Iron platebody",out:"Iron platebody",outQty:1,xp:125,rate:900,in:[["Iron bar",5]],metal:"Iron",tags:["armour"],slot:"body"},
    {cat:"Anvil",level:31,members:false,name:"Steel axe",out:"Steel axe",outQty:1,xp:37.5,rate:1200,in:[["Steel bar",1]],metal:"Steel",tags:["weapons","tools"],slot:null},
    {cat:"Anvil",level:31,members:false,name:"Steel dagger",out:"Steel dagger",outQty:1,xp:37.5,rate:1200,in:[["Steel bar",1]],metal:"Steel",tags:["weapons"],slot:null},
    {cat:"Anvil",level:32,members:false,name:"Steel mace",out:"Steel mace",outQty:1,xp:37.5,rate:1200,in:[["Steel bar",1]],metal:"Steel",tags:["weapons"],slot:null},
    {cat:"Anvil",level:33,members:false,name:"Steel med helm",out:"Steel med helm",outQty:1,xp:37.5,rate:1200,in:[["Steel bar",1]],metal:"Steel",tags:["armour"],slot:"head"},
    {cat:"Anvil",level:33,members:true,name:"Steel bolts (unf)",out:"Steel bolts (unf)",outQty:10,xp:37.5,rate:1200,in:[["Steel bar",1]],metal:"Steel",tags:["ranged"],slot:null},
    {cat:"Anvil",level:34,members:false,name:"Steel sword",out:"Steel sword",outQty:1,xp:37.5,rate:1200,in:[["Steel bar",1]],metal:"Steel",tags:["weapons"],slot:null},
    {cat:"Anvil",level:34,members:true,name:"Steel dart tip",out:"Steel dart tip",outQty:10,xp:37.5,rate:1200,in:[["Steel bar",1]],metal:"Steel",tags:["ranged"],slot:null},
    {cat:"Anvil",level:34,members:false,name:"Steel nails",out:"Steel nails",outQty:15,xp:37.5,rate:1200,in:[["Steel bar",1]],metal:"Steel",tags:["tools"],slot:null},
    {cat:"Anvil",level:35,members:false,name:"Steel scimitar",out:"Steel scimitar",outQty:1,xp:75.0,rate:1200,in:[["Steel bar",2]],metal:"Steel",tags:["weapons"],slot:null},
    {cat:"Anvil",level:35,members:false,name:"Steel arrowtips",out:"Steel arrowtips",outQty:15,xp:37.5,rate:1200,in:[["Steel bar",1]],metal:"Steel",tags:["ranged"],slot:null},
    {cat:"Anvil",level:36,members:false,name:"Steel longsword",out:"Steel longsword",outQty:1,xp:75.0,rate:1200,in:[["Steel bar",2]],metal:"Steel",tags:["weapons"],slot:null},
    {cat:"Anvil",level:36,members:true,name:"Steel limbs",out:"Steel limbs",outQty:1,xp:37.5,rate:1200,in:[["Steel bar",1]],metal:"Steel",tags:["ranged","tools"],slot:null},
    {cat:"Anvil",level:36,members:true,name:"Steel javelin heads",out:"Steel javelin heads",outQty:5,xp:37.5,rate:1200,in:[["Steel bar",1]],metal:"Steel",tags:["ranged"],slot:null},
    {cat:"Anvil",level:37,members:false,name:"Steel full helm",out:"Steel full helm",outQty:1,xp:75.0,rate:1200,in:[["Steel bar",2]],metal:"Steel",tags:["armour"],slot:"head"},
    {cat:"Anvil",level:37,members:true,name:"Steel knife",out:"Steel knife",outQty:5,xp:37.5,rate:1200,in:[["Steel bar",1]],metal:"Steel",tags:["ranged","tools"],slot:null},
    {cat:"Anvil",level:38,members:false,name:"Steel sq shield",out:"Steel sq shield",outQty:1,xp:75.0,rate:1200,in:[["Steel bar",2]],metal:"Steel",tags:["armour"],slot:"shield"},
    {cat:"Anvil",level:39,members:false,name:"Steel warhammer",out:"Steel warhammer",outQty:1,xp:112.5,rate:1200,in:[["Steel bar",3]],metal:"Steel",tags:["weapons"],slot:null},
    {cat:"Anvil",level:40,members:false,name:"Steel battleaxe",out:"Steel battleaxe",outQty:1,xp:112.5,rate:1200,in:[["Steel bar",3]],metal:"Steel",tags:["weapons","tools"],slot:null},
    {cat:"Anvil",level:41,members:false,name:"Steel chainbody",out:"Steel chainbody",outQty:1,xp:112.5,rate:1200,in:[["Steel bar",3]],metal:"Steel",tags:["armour"],slot:"body"},
    {cat:"Anvil",level:42,members:false,name:"Steel kiteshield",out:"Steel kiteshield",outQty:1,xp:112.5,rate:1200,in:[["Steel bar",3]],metal:"Steel",tags:["armour"],slot:"shield"},
    {cat:"Anvil",level:43,members:true,name:"Steel claws",out:"Steel claws",outQty:1,xp:75.0,rate:1200,in:[["Steel bar",2]],metal:"Steel",tags:["weapons"],slot:null},
    {cat:"Anvil",level:44,members:false,name:"Steel 2h sword",out:"Steel 2h sword",outQty:1,xp:112.5,rate:1200,in:[["Steel bar",3]],metal:"Steel",tags:["weapons"],slot:null},
    {cat:"Anvil",level:46,members:false,name:"Steel platelegs",out:"Steel platelegs",outQty:1,xp:112.5,rate:1200,in:[["Steel bar",3]],metal:"Steel",tags:["armour"],slot:"legs"},
    {cat:"Anvil",level:46,members:false,name:"Steel plateskirt",out:"Steel plateskirt",outQty:1,xp:112.5,rate:1200,in:[["Steel bar",3]],metal:"Steel",tags:["armour"],slot:"legs"},
    {cat:"Anvil",level:48,members:false,name:"Steel platebody",out:"Steel platebody",outQty:1,xp:187.5,rate:900,in:[["Steel bar",5]],metal:"Steel",tags:["armour"],slot:"body"},
    {cat:"Anvil",level:51,members:false,name:"Mithril axe",out:"Mithril axe",outQty:1,xp:50,rate:1200,in:[["Mithril bar",1]],metal:"Mithril",tags:["weapons","tools"],slot:null},
    {cat:"Anvil",level:51,members:false,name:"Mithril dagger",out:"Mithril dagger",outQty:1,xp:50,rate:1200,in:[["Mithril bar",1]],metal:"Mithril",tags:["weapons"],slot:null},
    {cat:"Anvil",level:52,members:false,name:"Mithril mace",out:"Mithril mace",outQty:1,xp:50,rate:1200,in:[["Mithril bar",1]],metal:"Mithril",tags:["weapons"],slot:null},
    {cat:"Anvil",level:53,members:false,name:"Mithril med helm",out:"Mithril med helm",outQty:1,xp:50,rate:1200,in:[["Mithril bar",1]],metal:"Mithril",tags:["armour"],slot:"head"},
    {cat:"Anvil",level:53,members:true,name:"Mithril bolts (unf)",out:"Mithril bolts (unf)",outQty:10,xp:50,rate:1200,in:[["Mithril bar",1]],metal:"Mithril",tags:["ranged"],slot:null},
    {cat:"Anvil",level:54,members:false,name:"Mithril sword",out:"Mithril sword",outQty:1,xp:50,rate:1200,in:[["Mithril bar",1]],metal:"Mithril",tags:["weapons"],slot:null},
    {cat:"Anvil",level:54,members:true,name:"Mithril dart tip",out:"Mithril dart tip",outQty:10,xp:50,rate:1200,in:[["Mithril bar",1]],metal:"Mithril",tags:["ranged"],slot:null},
    {cat:"Anvil",level:54,members:false,name:"Mithril nails",out:"Mithril nails",outQty:15,xp:50,rate:1200,in:[["Mithril bar",1]],metal:"Mithril",tags:["tools"],slot:null},
    {cat:"Anvil",level:55,members:false,name:"Mithril scimitar",out:"Mithril scimitar",outQty:1,xp:100,rate:1200,in:[["Mithril bar",2]],metal:"Mithril",tags:["weapons"],slot:null},
    {cat:"Anvil",level:55,members:false,name:"Mithril arrowtips",out:"Mithril arrowtips",outQty:15,xp:50,rate:1200,in:[["Mithril bar",1]],metal:"Mithril",tags:["ranged"],slot:null},
    {cat:"Anvil",level:56,members:false,name:"Mithril longsword",out:"Mithril longsword",outQty:1,xp:100,rate:1200,in:[["Mithril bar",2]],metal:"Mithril",tags:["weapons"],slot:null},
    {cat:"Anvil",level:56,members:true,name:"Mithril limbs",out:"Mithril limbs",outQty:1,xp:50,rate:1200,in:[["Mithril bar",1]],metal:"Mithril",tags:["ranged","tools"],slot:null},
    {cat:"Anvil",level:56,members:true,name:"Mithril javelin heads",out:"Mithril javelin heads",outQty:5,xp:50,rate:1200,in:[["Mithril bar",1]],metal:"Mithril",tags:["ranged"],slot:null},
    {cat:"Anvil",level:57,members:false,name:"Mithril full helm",out:"Mithril full helm",outQty:1,xp:100,rate:1200,in:[["Mithril bar",2]],metal:"Mithril",tags:["armour"],slot:"head"},
    {cat:"Anvil",level:57,members:true,name:"Mithril knife",out:"Mithril knife",outQty:5,xp:50,rate:1200,in:[["Mithril bar",1]],metal:"Mithril",tags:["ranged","tools"],slot:null},
    {cat:"Anvil",level:58,members:false,name:"Mithril sq shield",out:"Mithril sq shield",outQty:1,xp:100,rate:1200,in:[["Mithril bar",2]],metal:"Mithril",tags:["armour"],slot:"shield"},
    {cat:"Anvil",level:59,members:false,name:"Mithril warhammer",out:"Mithril warhammer",outQty:1,xp:150,rate:1200,in:[["Mithril bar",3]],metal:"Mithril",tags:["weapons"],slot:null},
    {cat:"Anvil",level:60,members:false,name:"Mithril battleaxe",out:"Mithril battleaxe",outQty:1,xp:150,rate:1200,in:[["Mithril bar",3]],metal:"Mithril",tags:["weapons","tools"],slot:null},
    {cat:"Anvil",level:61,members:false,name:"Mithril chainbody",out:"Mithril chainbody",outQty:1,xp:150,rate:1200,in:[["Mithril bar",3]],metal:"Mithril",tags:["armour"],slot:"body"},
    {cat:"Anvil",level:62,members:false,name:"Mithril kiteshield",out:"Mithril kiteshield",outQty:1,xp:150,rate:1200,in:[["Mithril bar",3]],metal:"Mithril",tags:["armour"],slot:"shield"},
    {cat:"Anvil",level:63,members:true,name:"Mithril claws",out:"Mithril claws",outQty:1,xp:100,rate:1200,in:[["Mithril bar",2]],metal:"Mithril",tags:["weapons"],slot:null},
    {cat:"Anvil",level:64,members:false,name:"Mithril 2h sword",out:"Mithril 2h sword",outQty:1,xp:150,rate:1200,in:[["Mithril bar",3]],metal:"Mithril",tags:["weapons"],slot:null},
    {cat:"Anvil",level:66,members:false,name:"Mithril platelegs",out:"Mithril platelegs",outQty:1,xp:150,rate:1200,in:[["Mithril bar",3]],metal:"Mithril",tags:["armour"],slot:"legs"},
    {cat:"Anvil",level:66,members:false,name:"Mithril plateskirt",out:"Mithril plateskirt",outQty:1,xp:150,rate:1200,in:[["Mithril bar",3]],metal:"Mithril",tags:["armour"],slot:"legs"},
    {cat:"Anvil",level:68,members:false,name:"Mithril platebody",out:"Mithril platebody",outQty:1,xp:250,rate:900,in:[["Mithril bar",5]],metal:"Mithril",tags:["armour"],slot:"body"},
    {cat:"Anvil",level:71,members:false,name:"Adamant axe",out:"Adamant axe",outQty:1,xp:62.5,rate:1200,in:[["Adamantite bar",1]],metal:"Adamant",tags:["weapons","tools"],slot:null},
    {cat:"Anvil",level:71,members:false,name:"Adamant dagger",out:"Adamant dagger",outQty:1,xp:62.5,rate:1200,in:[["Adamantite bar",1]],metal:"Adamant",tags:["weapons"],slot:null},
    {cat:"Anvil",level:72,members:false,name:"Adamant mace",out:"Adamant mace",outQty:1,xp:62.5,rate:1200,in:[["Adamantite bar",1]],metal:"Adamant",tags:["weapons"],slot:null},
    {cat:"Anvil",level:73,members:false,name:"Adamant med helm",out:"Adamant med helm",outQty:1,xp:62.5,rate:1200,in:[["Adamantite bar",1]],metal:"Adamant",tags:["armour"],slot:"head"},
    {cat:"Anvil",level:73,members:true,name:"Adamant bolts (unf)",out:"Adamant bolts (unf)",outQty:10,xp:62.5,rate:1200,in:[["Adamantite bar",1]],metal:"Adamant",tags:["ranged"],slot:null},
    {cat:"Anvil",level:74,members:false,name:"Adamant sword",out:"Adamant sword",outQty:1,xp:62.5,rate:1200,in:[["Adamantite bar",1]],metal:"Adamant",tags:["weapons"],slot:null},
    {cat:"Anvil",level:74,members:true,name:"Adamant dart tip",out:"Adamant dart tip",outQty:10,xp:62.5,rate:1200,in:[["Adamantite bar",1]],metal:"Adamant",tags:["ranged"],slot:null},
    {cat:"Anvil",level:74,members:false,name:"Adamant nails",out:"Adamant nails",outQty:15,xp:62.5,rate:1200,in:[["Adamantite bar",1]],metal:"Adamant",tags:["tools"],slot:null},
    {cat:"Anvil",level:75,members:false,name:"Adamant scimitar",out:"Adamant scimitar",outQty:1,xp:125.0,rate:1200,in:[["Adamantite bar",2]],metal:"Adamant",tags:["weapons"],slot:null},
    {cat:"Anvil",level:75,members:false,name:"Adamant arrowtips",out:"Adamant arrowtips",outQty:15,xp:62.5,rate:1200,in:[["Adamantite bar",1]],metal:"Adamant",tags:["ranged"],slot:null},
    {cat:"Anvil",level:76,members:false,name:"Adamant longsword",out:"Adamant longsword",outQty:1,xp:125.0,rate:1200,in:[["Adamantite bar",2]],metal:"Adamant",tags:["weapons"],slot:null},
    {cat:"Anvil",level:76,members:true,name:"Adamant limbs",out:"Adamant limbs",outQty:1,xp:62.5,rate:1200,in:[["Adamantite bar",1]],metal:"Adamant",tags:["ranged","tools"],slot:null},
    {cat:"Anvil",level:76,members:true,name:"Adamant javelin heads",out:"Adamant javelin heads",outQty:5,xp:62.5,rate:1200,in:[["Adamantite bar",1]],metal:"Adamant",tags:["ranged"],slot:null},
    {cat:"Anvil",level:77,members:false,name:"Adamant full helm",out:"Adamant full helm",outQty:1,xp:125.0,rate:1200,in:[["Adamantite bar",2]],metal:"Adamant",tags:["armour"],slot:"head"},
    {cat:"Anvil",level:77,members:true,name:"Adamant knife",out:"Adamant knife",outQty:5,xp:62.5,rate:1200,in:[["Adamantite bar",1]],metal:"Adamant",tags:["ranged","tools"],slot:null},
    {cat:"Anvil",level:78,members:false,name:"Adamant sq shield",out:"Adamant sq shield",outQty:1,xp:125.0,rate:1200,in:[["Adamantite bar",2]],metal:"Adamant",tags:["armour"],slot:"shield"},
    {cat:"Anvil",level:79,members:false,name:"Adamant warhammer",out:"Adamant warhammer",outQty:1,xp:187.5,rate:1200,in:[["Adamantite bar",3]],metal:"Adamant",tags:["weapons"],slot:null},
    {cat:"Anvil",level:80,members:false,name:"Adamant battleaxe",out:"Adamant battleaxe",outQty:1,xp:187.5,rate:1200,in:[["Adamantite bar",3]],metal:"Adamant",tags:["weapons","tools"],slot:null},
    {cat:"Anvil",level:81,members:false,name:"Adamant chainbody",out:"Adamant chainbody",outQty:1,xp:187.5,rate:1200,in:[["Adamantite bar",3]],metal:"Adamant",tags:["armour"],slot:"body"},
    {cat:"Anvil",level:82,members:false,name:"Adamant kiteshield",out:"Adamant kiteshield",outQty:1,xp:187.5,rate:1200,in:[["Adamantite bar",3]],metal:"Adamant",tags:["armour"],slot:"shield"},
    {cat:"Anvil",level:83,members:true,name:"Adamant claws",out:"Adamant claws",outQty:1,xp:125.0,rate:1200,in:[["Adamantite bar",2]],metal:"Adamant",tags:["weapons"],slot:null},
    {cat:"Anvil",level:84,members:false,name:"Adamant 2h sword",out:"Adamant 2h sword",outQty:1,xp:187.5,rate:1200,in:[["Adamantite bar",3]],metal:"Adamant",tags:["weapons"],slot:null},
    {cat:"Anvil",level:86,members:false,name:"Adamant platelegs",out:"Adamant platelegs",outQty:1,xp:187.5,rate:1200,in:[["Adamantite bar",3]],metal:"Adamant",tags:["armour"],slot:"legs"},
    {cat:"Anvil",level:86,members:false,name:"Adamant plateskirt",out:"Adamant plateskirt",outQty:1,xp:187.5,rate:1200,in:[["Adamantite bar",3]],metal:"Adamant",tags:["armour"],slot:"legs"},
    {cat:"Anvil",level:88,members:false,name:"Adamant platebody",out:"Adamant platebody",outQty:1,xp:312.5,rate:900,in:[["Adamantite bar",5]],metal:"Adamant",tags:["armour"],slot:"body"},
    {cat:"Anvil",level:86,members:false,name:"Rune axe",out:"Rune axe",outQty:1,xp:75,rate:1200,in:[["Runite bar",1]],metal:"Rune",tags:["weapons","tools"],slot:null},
    {cat:"Anvil",level:85,members:false,name:"Rune dagger",out:"Rune dagger",outQty:1,xp:75,rate:1200,in:[["Runite bar",1]],metal:"Rune",tags:["weapons"],slot:null},
    {cat:"Anvil",level:87,members:false,name:"Rune mace",out:"Rune mace",outQty:1,xp:75,rate:1200,in:[["Runite bar",1]],metal:"Rune",tags:["weapons"],slot:null},
    {cat:"Anvil",level:88,members:false,name:"Rune med helm",out:"Rune med helm",outQty:1,xp:75,rate:1200,in:[["Runite bar",1]],metal:"Rune",tags:["armour"],slot:"head"},
    {cat:"Anvil",level:88,members:true,name:"Rune bolts (unf)",out:"Rune bolts (unf)",outQty:10,xp:75,rate:1200,in:[["Runite bar",1]],metal:"Rune",tags:["ranged"],slot:null},
    {cat:"Anvil",level:89,members:false,name:"Rune sword",out:"Rune sword",outQty:1,xp:75,rate:1200,in:[["Runite bar",1]],metal:"Rune",tags:["weapons"],slot:null},
    {cat:"Anvil",level:89,members:true,name:"Rune dart tip",out:"Rune dart tip",outQty:10,xp:75,rate:1200,in:[["Runite bar",1]],metal:"Rune",tags:["ranged"],slot:null},
    {cat:"Anvil",level:89,members:false,name:"Rune nails",out:"Rune nails",outQty:15,xp:75,rate:1200,in:[["Runite bar",1]],metal:"Rune",tags:["tools"],slot:null},
    {cat:"Anvil",level:90,members:false,name:"Rune scimitar",out:"Rune scimitar",outQty:1,xp:150,rate:1200,in:[["Runite bar",2]],metal:"Rune",tags:["weapons"],slot:null},
    {cat:"Anvil",level:90,members:false,name:"Rune arrowtips",out:"Rune arrowtips",outQty:15,xp:75,rate:1200,in:[["Runite bar",1]],metal:"Rune",tags:["ranged"],slot:null},
    {cat:"Anvil",level:91,members:false,name:"Rune longsword",out:"Rune longsword",outQty:1,xp:150,rate:1200,in:[["Runite bar",2]],metal:"Rune",tags:["weapons"],slot:null},
    {cat:"Anvil",level:91,members:true,name:"Rune limbs",out:"Rune limbs",outQty:1,xp:75,rate:1200,in:[["Runite bar",1]],metal:"Rune",tags:["ranged","tools"],slot:null},
    {cat:"Anvil",level:91,members:true,name:"Rune javelin heads",out:"Rune javelin heads",outQty:5,xp:75,rate:1200,in:[["Runite bar",1]],metal:"Rune",tags:["ranged"],slot:null},
    {cat:"Anvil",level:92,members:false,name:"Rune full helm",out:"Rune full helm",outQty:1,xp:150,rate:1200,in:[["Runite bar",2]],metal:"Rune",tags:["armour"],slot:"head"},
    {cat:"Anvil",level:92,members:true,name:"Rune knife",out:"Rune knife",outQty:5,xp:75,rate:1200,in:[["Runite bar",1]],metal:"Rune",tags:["ranged","tools"],slot:null},
    {cat:"Anvil",level:93,members:false,name:"Rune sq shield",out:"Rune sq shield",outQty:1,xp:150,rate:1200,in:[["Runite bar",2]],metal:"Rune",tags:["armour"],slot:"shield"},
    {cat:"Anvil",level:94,members:false,name:"Rune warhammer",out:"Rune warhammer",outQty:1,xp:225,rate:1200,in:[["Runite bar",3]],metal:"Rune",tags:["weapons"],slot:null},
    {cat:"Anvil",level:95,members:false,name:"Rune battleaxe",out:"Rune battleaxe",outQty:1,xp:225,rate:1200,in:[["Runite bar",3]],metal:"Rune",tags:["weapons","tools"],slot:null},
    {cat:"Anvil",level:96,members:false,name:"Rune chainbody",out:"Rune chainbody",outQty:1,xp:225,rate:1200,in:[["Runite bar",3]],metal:"Rune",tags:["armour"],slot:"body"},
    {cat:"Anvil",level:97,members:false,name:"Rune kiteshield",out:"Rune kiteshield",outQty:1,xp:225,rate:1200,in:[["Runite bar",3]],metal:"Rune",tags:["armour"],slot:"shield"},
    {cat:"Anvil",level:98,members:true,name:"Rune claws",out:"Rune claws",outQty:1,xp:150,rate:1200,in:[["Runite bar",2]],metal:"Rune",tags:["weapons"],slot:null},
    {cat:"Anvil",level:99,members:false,name:"Rune 2h sword",out:"Rune 2h sword",outQty:1,xp:225,rate:1200,in:[["Runite bar",3]],metal:"Rune",tags:["weapons"],slot:null},
    {cat:"Anvil",level:99,members:false,name:"Rune platelegs",out:"Rune platelegs",outQty:1,xp:225,rate:1200,in:[["Runite bar",3]],metal:"Rune",tags:["armour"],slot:"legs"},
    {cat:"Anvil",level:99,members:false,name:"Rune plateskirt",out:"Rune plateskirt",outQty:1,xp:225,rate:1200,in:[["Runite bar",3]],metal:"Rune",tags:["armour"],slot:"legs"},
    {cat:"Anvil",level:99,members:false,name:"Rune platebody",out:"Rune platebody",outQty:1,xp:375,rate:900,in:[["Runite bar",5]],metal:"Rune",tags:["armour"],slot:"body"},
    {cat:"Anvil",level:8,members:true,name:"Blurite bolts (unf)",out:"Blurite bolts (unf)",outQty:10,xp:17.5,rate:1200,in:[["Blurite bar",1]],metal:"Blurite",tags:["ranged"],slot:null,nontradeable:true,note:"Untradeable"},
    {cat:"Anvil",level:13,members:true,name:"Blurite limbs",out:"Blurite limbs",xp:17.5,rate:1200,in:[["Blurite bar",1]],metal:"Blurite",tags:["ranged","tools"],slot:null,nontradeable:true,note:"Untradeable"},
    {cat:"Utility",level:35,members:true,name:"Cannonballs",out:"Cannonball",outQty:4,xp:25.6,rate:540,in:[["Steel bar",1]],tags:["ranged","tools"]}
  ];
  const norm=s=>String(s||'').trim().toLowerCase();
  const price=(i,b)=>{const v=Number(i?.[b]);return Number.isFinite(v)&&v>0?v:null};
  const money=v=>v==null?'—':VTAM.money(Math.round(v)),num=v=>v==null?'—':VTAM.fmt(Math.round(v));
  const accessMatch=m=>VTAM.geAccess()==='all'||(VTAM.geAccess()==='f2p'&&!m.members)||(VTAM.geAccess()==='p2p'&&m.members);
  const inputBasis=()=>$('smithInputBasis')?.value||'high',outputBasis=()=>$('smithOutputBasis')?.value||'low',scale=()=>Math.max(0,(Number($('smithRateScale')?.value)||100)/100);
  function hydrate(m){
    const inputs=m.in.map(([name,qty])=>{const item=byName.get(norm(name)),p=m.nontradeable?null:price(item,inputBasis());return {name,qty,item,p}});
    const outItem=byName.get(norm(m.out)),outQty=Math.max(1,Number(m.outQty)||1);
    if(m.nontradeable){
      const actionsHr=Math.round(m.rate*scale()),xpHr=m.xp*actionsHr;
      return {...m,inputs,outItem,inputCost:null,outPrice:null,profit:null,actionsHr,xpHr,gpHr:null};
    }
    let inputCost=0,missing=false;
    inputs.forEach(x=>{if(x.p==null)missing=true;else inputCost+=x.p*x.qty});
    const outUnit=price(outItem,outputBasis()),outPrice=outUnit==null?null:outUnit*outQty;
    const cost=missing?null:inputCost,profit=cost==null||outPrice==null?null:outPrice-cost,actionsHr=Math.round(m.rate*scale()),xpHr=m.xp*actionsHr,gpHr=profit==null?null:profit*actionsHr;
    return {...m,inputs,outItem,inputCost:cost,outPrice,profit,actionsHr,xpHr,gpHr};
  }
  function syncAnvilFilters(){
    const wrap=$('smithAnvilFilters'),cat=$('smithCategory')?.value||'all',metal=$('smithMetal'),type=$('smithType'),slot=$('smithSlot');
    if(!wrap||!metal||!type||!slot)return;
    const show=cat==='Anvil';wrap.hidden=!show;
    if(!show)return;
    const prevMetal=metal.value||'all';
    const metals=[...new Set(methods.filter(m=>m.cat==='Anvil'&&accessMatch(m)&&m.metal).map(m=>m.metal))];
    metal.innerHTML='<option value="all">All metals</option>'+metals.map(x=>`<option value="${x}">${x}</option>`).join('');
    metal.value=metals.includes(prevMetal)?prevMetal:'all';
    slot.hidden=type.value!=='armour';
  }
  function syncCategories(){
    const el=$('smithCategory');if(!el)return;const prev=el.value||'all',cats=[...new Set(methods.filter(accessMatch).map(m=>m.cat))];
    el.innerHTML='<option value="all">All Categories</option>'+cats.map(c=>`<option value="${c}">${c}</option>`).join('');
    el.value=cats.includes(prev)?prev:(cats.includes('Smelting')?'Smelting':'all');
  }
  function vis(){const o={};COLS.forEach(c=>o[c]=!!document.querySelector(`[data-smith-col="${c}"]`)?.checked);return o}
  function inputCell(x){
    if(!x)return '<span class="muted">—</span>';
    const icon=x.item?VTAM.itemIconUrl(x.item.id):VTAM.path('assets/img/item-placeholder.svg');
    const line=x.p==null?null:x.p*x.qty;
    return `<span class="smith-input-card"><img src="${icon}" alt=""><span><strong>${x.qty>1?x.qty+'× ':''}${x.name}</strong><small>${x.p==null?'No live price':`${money(x.p)} ea${x.qty>1?` • ${money(line)} total`:''}`}</small></span></span>`;
  }
  function visibleRows(){
    const q=norm($('smithSearch')?.value),cat=$('smithCategory')?.value||'all',metal=$('smithMetal')?.value||'all',type=$('smithType')?.value||'all',slot=$('smithSlot')?.value||'all';
    return methods.filter(accessMatch).map(hydrate).filter(r=>{
      if(cat!=='all'&&r.cat!==cat)return false;
      if(cat==='Anvil'){
        if(metal!=='all'&&r.metal!==metal)return false;
        if(type!=='all'&&!r.tags?.includes(type))return false;
        if(type==='armour'&&slot!=='all'&&r.slot!==slot)return false;
      }
      return !q||norm(r.name+' '+r.in.map(x=>x[0]).join(' ')+' '+(r.metal||'')+' '+(r.tags||[]).join(' ')).includes(q);
    });
  }
  function relevantMaterials(rows){
    const map=new Map();
    const add=(name,item,kind)=>{const key=norm(name);if(!map.has(key))map.set(key,{name,item,kind,count:0});map.get(key).count++};
    rows.forEach(r=>{r.inputs.forEach(x=>add(x.name,x.item,'input'));add(r.out,r.outItem,'output')});
    return [...map.values()].sort((a,b)=>a.kind.localeCompare(b.kind)||b.count-a.count||a.name.localeCompare(b.name));
  }
  function renderMaterials(rows){
    const tray=$('smithMaterialTray'),grid=$('smithMaterialGrid'),toggle=$('smithMaterialToggle');if(!tray||!grid||!toggle)return;
    const open=toggle.getAttribute('aria-pressed')==='true';tray.hidden=!open;if(!open)return;
    const mats=relevantMaterials(rows);
    grid.innerHTML=mats.slice(0,20).map(m=>{const i=m.item,icon=i?VTAM.itemIconUrl(i.id):VTAM.path('assets/img/item-placeholder.svg'),h=price(i,'high'),l=price(i,'low');
      return `<div class="craft-material-card"><img src="${icon}" alt=""><div><strong>${m.name}<span class="smith-material-kind">${m.kind==='output'?'product':'input'}</span></strong><small>H ${money(h)} • L ${money(l)}</small></div></div>`;
    }).join('')+(mats.length>20?`<div class="craft-material-more">+${mats.length-20} more<br><small>Narrow category/search to focus materials</small></div>`:'');
    if(!mats.length)grid.innerHTML='<span class="muted">No materials match the current filters.</span>';
  }
  function render(){
    if(!$('smithBody'))return;const v=vis();
    let rows=visibleRows();
    rows.sort((a,b)=>{let A=a[sortField],B=b[sortField];if(A==null)A=sortDir>0?Infinity:-Infinity;if(B==null)B=sortDir>0?Infinity:-Infinity;if(typeof A==='string'){A=A.toLowerCase();B=String(B).toLowerCase()}return(A>B?1:A<B?-1:0)*sortDir});
    $('smithCount').textContent=`${rows.length} methods`;
    $('smithBody').innerHTML=rows.map(r=>{const icon=r.outItem?VTAM.itemIconUrl(r.outItem.id):VTAM.path('assets/img/item-placeholder.svg');const inputs=r.inputs.map(inputCell).join('');return `<tr><td class="right" data-col="level"${v.level?'':' hidden'}>${r.level}</td><td data-col="icon"${v.icon?'':' hidden'}><span class="alch-icon-slot"><img class="alch-item-icon" src="${icon}" alt=""></span></td><td><strong>${r.name}</strong><div class="craft-subline">${r.members?'Members':'F2P'} • ${r.cat}${r.metal?' • '+r.metal:''}${r.note?' • '+r.note:''}</div></td><td data-col="inputs"${v.inputs?'':' hidden'}><div class="smith-input-list">${inputs}</div></td><td class="right" data-col="inputCost"${v.inputCost?'':' hidden'}>${money(r.inputCost)}</td><td class="right" data-col="output"${v.output?'':' hidden'}>${money(r.outPrice)}</td><td class="right ${r.profit==null?'muted':r.profit>=0?'good':'bad'}" data-col="profit"${v.profit?'':' hidden'}>${money(r.profit)}</td><td class="right" data-col="xp"${v.xp?'':' hidden'}>${r.xp}</td><td class="right" data-col="xpHr"${v.xpHr?'':' hidden'}>${num(r.xpHr)}</td><td class="right ${r.gpHr==null?'muted':r.gpHr>=0?'good':'bad'}" data-col="gpHr"${v.gpHr?'':' hidden'}>${money(r.gpHr)}</td></tr>`}).join('')||'<tr><td colspan="10" class="center muted">No smithing methods match these filters.</td></tr>';
    renderMaterials(rows);
  }
  function status(state,title){const s=$('smithMarketStatus');if(!s)return;s.className=`bone-market-indicator${state?' '+state:''}`;s.title=title;s.setAttribute('aria-label',title)}
  function apply(data){market=Array.isArray(data)?data:[];byName=new Map(market.map(i=>[norm(i.name),i]));status('good','Live market connected');render()}
  function init(){
    if(!$('smithBody'))return;syncCategories();syncAnvilFilters();
    ['smithSearch','smithInputBasis','smithOutputBasis','smithRateScale'].forEach(id=>$(id)?.addEventListener('input',render));
    $('smithCategory')?.addEventListener('change',()=>{syncAnvilFilters();render()});
    ['smithMetal','smithType','smithSlot'].forEach(id=>$(id)?.addEventListener('change',()=>{syncAnvilFilters();render()}));
    document.querySelectorAll('[data-smith-col]').forEach(x=>x.addEventListener('change',render));
    $('smithMaterialToggle')?.addEventListener('click',()=>{const b=$('smithMaterialToggle'),next=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(next));render()});
    document.querySelectorAll('#smithTable [data-sort]').forEach(th=>th.addEventListener('click',()=>{const f=th.dataset.sort;if(sortField===f)sortDir*=-1;else{sortField=f;sortDir=f==='name'?1:-1}render()}));
    window.addEventListener('vtam:ge-access-changed',()=>{syncCategories();syncAnvilFilters();render()});
    $('smithRefresh')?.addEventListener('click',()=>{status('','Refreshing market');VTAM.loadMarket(true).then(apply).catch(()=>status('bad','Market unavailable'))});
    status('','Connecting to live market');VTAM.loadMarket().then(apply).catch(()=>{status('bad','Market unavailable');render()});
  }
  return {init};
})();