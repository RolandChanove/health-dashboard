// Built-in food database. All fast-food values are from official US nutrition pages.
// Generic foods use USDA FoodData Central values.
// servingLabel describes one serving. Nutritional values are per 1 serving.
// Scalable foods (per100g=true) have values per 100g so users can dial in exact grams.

export const FOOD_DB = [
  // ── Proteins ──────────────────────────────────────────────────────────────
  { id:'p1',  name:'Chicken Breast (cooked)',       category:'Protein',  servingLabel:'100g',       per100g:true,  calories:165, protein:31.0, carbs:0.0,  fat:3.6,  fiber:0,   sugar:0,    sodium:74,   potassium:256, calcium:15,  iron:1.0, vitaminC:0,    vitaminD:0,    magnesium:29 },
  { id:'p2',  name:'Ground Beef 90/10 (cooked)',    category:'Protein',  servingLabel:'100g',       per100g:true,  calories:196, protein:26.0, carbs:0.0,  fat:10.0, fiber:0,   sugar:0,    sodium:72,   potassium:338, calcium:20,  iron:2.9, vitaminC:0,    vitaminD:0.3,  magnesium:23 },
  { id:'p3',  name:'Ground Beef 80/20 (cooked)',    category:'Protein',  servingLabel:'100g',       per100g:true,  calories:254, protein:25.9, carbs:0.0,  fat:16.8, fiber:0,   sugar:0,    sodium:82,   potassium:300, calcium:19,  iron:2.6, vitaminC:0,    vitaminD:0.2,  magnesium:21 },
  { id:'p4',  name:'Salmon, Atlantic (cooked)',     category:'Protein',  servingLabel:'100g',       per100g:true,  calories:206, protein:20.4, carbs:0.0,  fat:13.4, fiber:0,   sugar:0,    sodium:59,   potassium:363, calcium:15,  iron:0.9, vitaminC:4.5,  vitaminD:11.1, magnesium:27 },
  { id:'p5',  name:'Tuna, canned in water',         category:'Protein',  servingLabel:'100g',       per100g:true,  calories:116, protein:25.5, carbs:0.0,  fat:0.8,  fiber:0,   sugar:0,    sodium:320,  potassium:237, calcium:11,  iron:1.3, vitaminC:0,    vitaminD:4.2,  magnesium:31 },
  { id:'p6',  name:'Egg (large)',                   category:'Protein',  servingLabel:'1 egg (50g)',per100g:false, calories:72,  protein:6.3,  carbs:0.4,  fat:5.0,  fiber:0,   sugar:0.2,  sodium:71,   potassium:69,  calcium:28,  iron:0.9, vitaminC:0,    vitaminD:1.1,  magnesium:6  },
  { id:'p7',  name:'Turkey Breast (cooked)',        category:'Protein',  servingLabel:'100g',       per100g:true,  calories:161, protein:29.0, carbs:0.0,  fat:4.0,  fiber:0,   sugar:0,    sodium:66,   potassium:298, calcium:18,  iron:1.4, vitaminC:0,    vitaminD:0,    magnesium:27 },
  { id:'p8',  name:'Shrimp (cooked)',               category:'Protein',  servingLabel:'100g',       per100g:true,  calories:99,  protein:24.0, carbs:0.3,  fat:0.3,  fiber:0,   sugar:0,    sodium:943,  potassium:201, calcium:52,  iron:0.5, vitaminC:0,    vitaminD:0,    magnesium:37 },
  { id:'p9',  name:'Pork Tenderloin (cooked)',      category:'Protein',  servingLabel:'100g',       per100g:true,  calories:166, protein:29.0, carbs:0.0,  fat:4.6,  fiber:0,   sugar:0,    sodium:58,   potassium:468, calcium:22,  iron:1.4, vitaminC:0.7,  vitaminD:0.7,  magnesium:30 },

  // ── Dairy ─────────────────────────────────────────────────────────────────
  { id:'d1',  name:'Whole Milk',                    category:'Dairy',    servingLabel:'1 cup (244g)',per100g:false, calories:149, protein:8.0,  carbs:12.0, fat:8.0,  fiber:0,   sugar:12.0, sodium:107,  potassium:322, calcium:276, iron:0.1, vitaminC:0,    vitaminD:3.2,  magnesium:27 },
  { id:'d2',  name:'2% Milk',                       category:'Dairy',    servingLabel:'1 cup (244g)',per100g:false, calories:122, protein:8.1,  carbs:11.7, fat:4.8,  fiber:0,   sugar:11.7, sodium:115,  potassium:342, calcium:293, iron:0.1, vitaminC:0,    vitaminD:2.9,  magnesium:27 },
  { id:'d3',  name:'Greek Yogurt, plain nonfat',    category:'Dairy',    servingLabel:'170g',       per100g:false, calories:100, protein:17.0, carbs:6.0,  fat:0.7,  fiber:0,   sugar:6.0,  sodium:56,   potassium:240, calcium:200, iron:0,   vitaminC:0,    vitaminD:0,    magnesium:22 },
  { id:'d4',  name:'Cheddar Cheese',                category:'Dairy',    servingLabel:'1 oz (28g)', per100g:false, calories:114, protein:7.0,  carbs:0.4,  fat:9.4,  fiber:0,   sugar:0.1,  sodium:180,  potassium:28,  calcium:204, iron:0.2, vitaminC:0,    vitaminD:0.3,  magnesium:8  },
  { id:'d5',  name:'Cottage Cheese (1%)',            category:'Dairy',    servingLabel:'½ cup (113g)',per100g:false,calories:81,  protein:14.0, carbs:3.1,  fat:1.1,  fiber:0,   sugar:3.0,  sodium:364,  potassium:97,  calcium:87,  iron:0.1, vitaminC:0,    vitaminD:0,    magnesium:8  },

  // ── Grains ────────────────────────────────────────────────────────────────
  { id:'g1',  name:'White Rice (cooked)',            category:'Grains',   servingLabel:'100g',       per100g:true,  calories:130, protein:2.7,  carbs:28.2, fat:0.3,  fiber:0.4, sugar:0,    sodium:1,    potassium:35,  calcium:10,  iron:0.2, vitaminC:0,    vitaminD:0,    magnesium:12 },
  { id:'g2',  name:'Brown Rice (cooked)',            category:'Grains',   servingLabel:'100g',       per100g:true,  calories:111, protein:2.6,  carbs:23.0, fat:0.9,  fiber:1.8, sugar:0.4,  sodium:5,    potassium:79,  calcium:10,  iron:0.5, vitaminC:0,    vitaminD:0,    magnesium:44 },
  { id:'g3',  name:'Oatmeal (cooked)',               category:'Grains',   servingLabel:'100g',       per100g:true,  calories:71,  protein:2.5,  carbs:12.0, fat:1.5,  fiber:1.7, sugar:0.1,  sodium:49,   potassium:61,  calcium:9,   iron:0.7, vitaminC:0,    vitaminD:0,    magnesium:26 },
  { id:'g4',  name:'Pasta (cooked)',                 category:'Grains',   servingLabel:'100g',       per100g:true,  calories:158, protein:5.8,  carbs:30.9, fat:0.9,  fiber:1.8, sugar:0.6,  sodium:1,    potassium:44,  calcium:7,   iron:1.3, vitaminC:0,    vitaminD:0,    magnesium:18 },
  { id:'g5',  name:'White Bread',                   category:'Grains',   servingLabel:'1 slice (30g)',per100g:false,calories:80,  protein:2.7,  carbs:15.0, fat:1.0,  fiber:0.6, sugar:1.3,  sodium:144,  potassium:37,  calcium:41,  iron:1.0, vitaminC:0,    vitaminD:0,    magnesium:6  },
  { id:'g6',  name:'Whole Wheat Bread',             category:'Grains',   servingLabel:'1 slice (32g)',per100g:false,calories:81,  protein:4.0,  carbs:13.8, fat:1.1,  fiber:1.9, sugar:1.4,  sodium:146,  potassium:77,  calcium:24,  iron:1.0, vitaminC:0,    vitaminD:0,    magnesium:23 },
  { id:'g7',  name:'Quinoa (cooked)',               category:'Grains',   servingLabel:'100g',       per100g:true,  calories:120, protein:4.4,  carbs:21.3, fat:1.9,  fiber:2.8, sugar:0.9,  sodium:7,    potassium:172, calcium:17,  iron:1.5, vitaminC:0,    vitaminD:0,    magnesium:64 },

  // ── Vegetables ────────────────────────────────────────────────────────────
  { id:'v1',  name:'Broccoli (raw)',                category:'Vegetables',servingLabel:'100g',       per100g:true,  calories:34,  protein:2.8,  carbs:6.6,  fat:0.4,  fiber:2.6, sugar:1.7,  sodium:33,   potassium:316, calcium:47,  iron:0.7, vitaminC:89.2, vitaminD:0,    magnesium:21 },
  { id:'v2',  name:'Spinach (raw)',                 category:'Vegetables',servingLabel:'100g',       per100g:true,  calories:23,  protein:2.9,  carbs:3.6,  fat:0.4,  fiber:2.2, sugar:0.4,  sodium:79,   potassium:558, calcium:99,  iron:2.7, vitaminC:28.1, vitaminD:0,    magnesium:79 },
  { id:'v3',  name:'Sweet Potato (baked)',          category:'Vegetables',servingLabel:'100g',       per100g:true,  calories:90,  protein:2.0,  carbs:20.7, fat:0.1,  fiber:3.3, sugar:4.2,  sodium:36,   potassium:475, calcium:38,  iron:0.7, vitaminC:2.4,  vitaminD:0,    magnesium:27 },
  { id:'v4',  name:'White Potato (baked)',          category:'Vegetables',servingLabel:'100g',       per100g:true,  calories:93,  protein:2.5,  carbs:21.2, fat:0.1,  fiber:2.1, sugar:1.1,  sodium:10,   potassium:544, calcium:12,  iron:0.8, vitaminC:12.4, vitaminD:0,    magnesium:28 },
  { id:'v5',  name:'Carrot (raw)',                  category:'Vegetables',servingLabel:'100g',       per100g:true,  calories:41,  protein:0.9,  carbs:9.6,  fat:0.2,  fiber:2.8, sugar:4.7,  sodium:69,   potassium:320, calcium:33,  iron:0.3, vitaminC:5.9,  vitaminD:0,    magnesium:12 },
  { id:'v6',  name:'Green Beans (cooked)',          category:'Vegetables',servingLabel:'100g',       per100g:true,  calories:35,  protein:1.9,  carbs:8.0,  fat:0.1,  fiber:3.4, sugar:1.6,  sodium:1,    potassium:211, calcium:55,  iron:1.0, vitaminC:12.2, vitaminD:0,    magnesium:25 },

  // ── Fruits ────────────────────────────────────────────────────────────────
  { id:'f1',  name:'Banana (medium)',               category:'Fruit',    servingLabel:'1 medium (118g)',per100g:false,calories:105, protein:1.3,  carbs:27.0, fat:0.4,  fiber:3.1, sugar:14.4, sodium:1,    potassium:422, calcium:6,   iron:0.3, vitaminC:10.3, vitaminD:0,    magnesium:32 },
  { id:'f2',  name:'Apple (medium)',                category:'Fruit',    servingLabel:'1 medium (182g)',per100g:false,calories:95,  protein:0.5,  carbs:25.1, fat:0.3,  fiber:4.4, sugar:18.9, sodium:2,    potassium:195, calcium:11,  iron:0.2, vitaminC:8.4,  vitaminD:0,    magnesium:9  },
  { id:'f3',  name:'Orange (medium)',               category:'Fruit',    servingLabel:'1 medium (131g)',per100g:false,calories:62,  protein:1.2,  carbs:15.4, fat:0.2,  fiber:3.1, sugar:12.2, sodium:0,    potassium:237, calcium:52,  iron:0.1, vitaminC:69.7, vitaminD:0,    magnesium:13 },
  { id:'f4',  name:'Avocado (half)',                category:'Fruit',    servingLabel:'½ fruit (68g)',per100g:false, calories:114, protein:1.3,  carbs:6.0,  fat:10.5, fiber:4.6, sugar:0.4,  sodium:5,    potassium:364, calcium:9,   iron:0.5, vitaminC:6.6,  vitaminD:0,    magnesium:19 },
  { id:'f5',  name:'Blueberries',                  category:'Fruit',    servingLabel:'100g',       per100g:true,  calories:57,  protein:0.7,  carbs:14.5, fat:0.3,  fiber:2.4, sugar:9.9,  sodium:1,    potassium:77,  calcium:6,   iron:0.3, vitaminC:9.7,  vitaminD:0,    magnesium:6  },

  // ── Legumes & Nuts ────────────────────────────────────────────────────────
  { id:'l1',  name:'Black Beans (canned)',          category:'Legumes',  servingLabel:'100g',       per100g:true,  calories:127, protein:8.7,  carbs:22.8, fat:0.5,  fiber:7.5, sugar:0.6,  sodium:256,  potassium:355, calcium:46,  iron:2.1, vitaminC:0,    vitaminD:0,    magnesium:60 },
  { id:'l2',  name:'Chickpeas (canned)',            category:'Legumes',  servingLabel:'100g',       per100g:true,  calories:139, protein:7.0,  carbs:22.5, fat:2.6,  fiber:6.3, sugar:3.9,  sodium:240,  potassium:291, calcium:48,  iron:1.7, vitaminC:0,    vitaminD:0,    magnesium:40 },
  { id:'l3',  name:'Lentils (cooked)',              category:'Legumes',  servingLabel:'100g',       per100g:true,  calories:116, protein:9.0,  carbs:20.1, fat:0.4,  fiber:7.9, sugar:1.8,  sodium:2,    potassium:369, calcium:19,  iron:3.3, vitaminC:1.5,  vitaminD:0,    magnesium:36 },
  { id:'n1',  name:'Almonds',                      category:'Nuts & Fats',servingLabel:'1 oz (28g)',per100g:false, calories:164, protein:6.0,  carbs:6.1,  fat:14.2, fiber:3.5, sugar:1.2,  sodium:0,    potassium:200, calcium:76,  iron:1.1, vitaminC:0,    vitaminD:0,    magnesium:76 },
  { id:'n2',  name:'Peanut Butter',                category:'Nuts & Fats',servingLabel:'2 tbsp (32g)',per100g:false,calories:190, protein:7.0,  carbs:7.1,  fat:16.4, fiber:1.9, sugar:3.0,  sodium:147,  potassium:200, calcium:17,  iron:0.6, vitaminC:0,    vitaminD:0,    magnesium:51 },
  { id:'n3',  name:'Olive Oil',                    category:'Nuts & Fats',servingLabel:'1 tbsp (14g)',per100g:false,calories:119, protein:0,    carbs:0,    fat:13.5, fiber:0,   sugar:0,    sodium:0,    potassium:0,   calcium:0,   iron:0,   vitaminC:0,    vitaminD:0,    magnesium:0  },

  // ── McDonald's ───────────────────────────────────────────────────────────
  { id:'mc1', name:"Big Mac",                       category:"McDonald's",brand:"McDonald's",servingLabel:'1 sandwich',  per100g:false, calories:550, protein:25, carbs:45, fat:30, fiber:3,  sugar:9,  sodium:1010, potassium:0,   calcium:232, iron:4.5, vitaminC:2,   vitaminD:0.6, magnesium:50 },
  { id:'mc2', name:"Quarter Pounder w/ Cheese",     category:"McDonald's",brand:"McDonald's",servingLabel:'1 sandwich',  per100g:false, calories:530, protein:31, carbs:41, fat:27, fiber:2,  sugar:10, sodium:1110, potassium:560, calcium:257, iron:5.4, vitaminC:2,   vitaminD:0,   magnesium:40 },
  { id:'mc3', name:"McDouble",                      category:"McDonald's",brand:"McDonald's",servingLabel:'1 sandwich',  per100g:false, calories:390, protein:24, carbs:34, fat:19, fiber:1,  sugar:7,  sodium:840,  potassium:0,   calcium:200, iron:4.5, vitaminC:1,   vitaminD:0,   magnesium:30 },
  { id:'mc4', name:"McChicken",                     category:"McDonald's",brand:"McDonald's",servingLabel:'1 sandwich',  per100g:false, calories:400, protein:14, carbs:40, fat:17, fiber:2,  sugar:5,  sodium:700,  potassium:0,   calcium:100, iron:2.7, vitaminC:1,   vitaminD:0,   magnesium:25 },
  { id:'mc5', name:"Filet-O-Fish",                  category:"McDonald's",brand:"McDonald's",servingLabel:'1 sandwich',  per100g:false, calories:380, protein:15, carbs:39, fat:18, fiber:1,  sugar:5,  sodium:590,  potassium:0,   calcium:150, iron:1.8, vitaminC:1,   vitaminD:1.5, magnesium:25 },
  { id:'mc6', name:"10-pc Chicken McNuggets",       category:"McDonald's",brand:"McDonald's",servingLabel:'10 pieces',   per100g:false, calories:420, protein:23, carbs:26, fat:25, fiber:0,  sugar:0,  sodium:920,  potassium:0,   calcium:20,  iron:0.9, vitaminC:0,   vitaminD:0,   magnesium:25 },
  { id:'mc7', name:"Egg McMuffin",                  category:"McDonald's",brand:"McDonald's",servingLabel:'1 sandwich',  per100g:false, calories:310, protein:17, carbs:30, fat:12, fiber:1,  sugar:3,  sodium:770,  potassium:0,   calcium:200, iron:2.7, vitaminC:1,   vitaminD:1.1, magnesium:30 },
  { id:'mc8', name:"Medium French Fries",           category:"McDonald's",brand:"McDonald's",servingLabel:'1 medium order',per100g:false,calories:320, protein:4,  carbs:43, fat:15, fiber:4,  sugar:0,  sodium:400,  potassium:0,   calcium:20,  iron:0.9, vitaminC:10,  vitaminD:0,   magnesium:30 },
  { id:'mc9', name:"Large French Fries",            category:"McDonald's",brand:"McDonald's",servingLabel:'1 large order',per100g:false, calories:490, protein:7,  carbs:66, fat:23, fiber:6,  sugar:0,  sodium:620,  potassium:0,   calcium:20,  iron:1.8, vitaminC:15,  vitaminD:0,   magnesium:45 },

  // ── Burger King ──────────────────────────────────────────────────────────
  { id:'bk1', name:"Whopper",                       category:"Burger King",brand:"Burger King",servingLabel:'1 burger',  per100g:false, calories:660, protein:28, carbs:49, fat:40, fiber:2,  sugar:11, sodium:980,  potassium:0,   calcium:80,  iron:5.4, vitaminC:9,   vitaminD:0,   magnesium:45 },
  { id:'bk2', name:"Double Whopper",                category:"Burger King",brand:"Burger King",servingLabel:'1 burger',  per100g:false, calories:900, protein:48, carbs:49, fat:56, fiber:2,  sugar:11, sodium:1000, potassium:0,   calcium:100, iron:7.2, vitaminC:9,   vitaminD:0,   magnesium:60 },
  { id:'bk3', name:"Chicken Sandwich",              category:"Burger King",brand:"Burger King",servingLabel:'1 sandwich',per100g:false, calories:660, protein:28, carbs:47, fat:40, fiber:2,  sugar:6,  sodium:1140, potassium:0,   calcium:100, iron:3.6, vitaminC:6,   vitaminD:0,   magnesium:40 },
  { id:'bk4', name:"Medium Onion Rings",            category:"Burger King",brand:"Burger King",servingLabel:'1 medium order',per100g:false,calories:440,protein:6,  carbs:55, fat:21, fiber:3,  sugar:8,  sodium:490,  potassium:0,   calcium:60,  iron:1.8, vitaminC:2,   vitaminD:0,   magnesium:20 },

  // ── Wendy's ───────────────────────────────────────────────────────────────
  { id:'w1',  name:"Dave's Single",                 category:"Wendy's",  brand:"Wendy's",servingLabel:'1 burger',    per100g:false, calories:590, protein:34, carbs:38, fat:33, fiber:1,  sugar:8,  sodium:950,  potassium:0,   calcium:120, iron:5.4, vitaminC:4,   vitaminD:0,   magnesium:40 },
  { id:'w2',  name:"Baconator",                     category:"Wendy's",  brand:"Wendy's",servingLabel:'1 burger',    per100g:false, calories:950, protein:62, carbs:36, fat:60, fiber:1,  sugar:9,  sodium:1820, potassium:0,   calcium:150, iron:7.2, vitaminC:2,   vitaminD:0,   magnesium:50 },
  { id:'w3',  name:"Medium French Fries (Wendy's)", category:"Wendy's",  brand:"Wendy's",servingLabel:'1 medium order',per100g:false,calories:410, protein:5,  carbs:54, fat:20, fiber:5,  sugar:0,  sodium:440,  potassium:0,   calcium:20,  iron:0.9, vitaminC:10,  vitaminD:0,   magnesium:30 },
  { id:'w4',  name:"Frosty (Medium, Chocolate)",    category:"Wendy's",  brand:"Wendy's",servingLabel:'1 medium',    per100g:false, calories:370, protein:9,  carbs:60, fat:10, fiber:1,  sugar:46, sodium:220,  potassium:0,   calcium:350, iron:1.8, vitaminC:0,   vitaminD:2.5, magnesium:40 },

  // ── Chick-fil-A ──────────────────────────────────────────────────────────
  { id:'cf1', name:"Chick-fil-A Sandwich",          category:"Chick-fil-A",brand:"Chick-fil-A",servingLabel:'1 sandwich',per100g:false, calories:440, protein:28, carbs:41, fat:19, fiber:1,  sugar:5,  sodium:1350, potassium:0,   calcium:100, iron:2.7, vitaminC:1,   vitaminD:0,   magnesium:30 },
  { id:'cf2', name:"Spicy Deluxe Sandwich",         category:"Chick-fil-A",brand:"Chick-fil-A",servingLabel:'1 sandwich',per100g:false, calories:550, protein:32, carbs:47, fat:25, fiber:2,  sugar:6,  sodium:1590, potassium:0,   calcium:150, iron:3.6, vitaminC:2,   vitaminD:0,   magnesium:35 },
  { id:'cf3', name:"8-ct Nuggets",                  category:"Chick-fil-A",brand:"Chick-fil-A",servingLabel:'8 pieces',  per100g:false, calories:250, protein:26, carbs:11, fat:11, fiber:0,  sugar:1,  sodium:680,  potassium:0,   calcium:20,  iron:0.9, vitaminC:0,   vitaminD:0,   magnesium:20 },
  { id:'cf4', name:"Medium Waffle Fries",           category:"Chick-fil-A",brand:"Chick-fil-A",servingLabel:'1 medium order',per100g:false,calories:420, protein:5,  carbs:55, fat:20, fiber:5,  sugar:0,  sodium:220,  potassium:0,   calcium:20,  iron:0.9, vitaminC:10,  vitaminD:0,   magnesium:30 },

  // ── Chipotle ─────────────────────────────────────────────────────────────
  { id:'ch1', name:"Chipotle Chicken Bowl (rice, black beans, cheese, salsa)",category:"Chipotle",brand:"Chipotle",servingLabel:'1 bowl',per100g:false,calories:685, protein:43, carbs:70, fat:22, fiber:11, sugar:5,  sodium:1615, potassium:0,   calcium:250, iron:5.4, vitaminC:10,  vitaminD:0,   magnesium:80 },
  { id:'ch2', name:"Chipotle Chicken Burrito (flour tortilla)",category:"Chipotle",brand:"Chipotle",servingLabel:'1 burrito',per100g:false,calories:870, protein:50, carbs:97, fat:28, fiber:12, sugar:6,  sodium:2120, potassium:0,   calcium:300, iron:7.2, vitaminC:10,  vitaminD:0,   magnesium:90 },
  { id:'ch3', name:"Chipotle Steak Burrito Bowl",  category:"Chipotle",brand:"Chipotle",servingLabel:'1 bowl',per100g:false,calories:650, protein:41, carbs:66, fat:20, fiber:10, sugar:4,  sodium:1560, potassium:0,   calcium:250, iron:4.5, vitaminC:8,   vitaminD:0,   magnesium:75 },

  // ── Subway ────────────────────────────────────────────────────────────────
  { id:'su1', name:'Subway 6" Rotisserie Chicken (wheat)',category:"Subway",brand:"Subway",servingLabel:'6" sandwich',per100g:false,calories:350, protein:26, carbs:46, fat:6,  fiber:5,  sugar:8,  sodium:650,  potassium:0,   calcium:150, iron:2.7, vitaminC:4,   vitaminD:0,   magnesium:30 },
  { id:'su2', name:'Subway 6" Italian BMT (wheat)', category:"Subway",  brand:"Subway",servingLabel:'6" sandwich',per100g:false, calories:380, protein:19, carbs:46, fat:15, fiber:5,  sugar:8,  sodium:1060, potassium:0,   calcium:150, iron:3.6, vitaminC:4,   vitaminD:0,   magnesium:25 },
  { id:'su3', name:'Subway 6" Turkey Breast (wheat)',category:"Subway", brand:"Subway",servingLabel:'6" sandwich',per100g:false, calories:280, protein:18, carbs:46, fat:3,  fiber:5,  sugar:7,  sodium:670,  potassium:0,   calcium:150, iron:2.7, vitaminC:4,   vitaminD:0,   magnesium:30 },

  // ── Starbucks ─────────────────────────────────────────────────────────────
  { id:'sb1', name:'Caffe Latte (Grande, 2%)',      category:"Starbucks",brand:"Starbucks",servingLabel:'16 fl oz',  per100g:false, calories:190, protein:13, carbs:19, fat:7,  fiber:0,  sugar:18, sodium:170,  potassium:0,   calcium:450, iron:0,   vitaminC:0,   vitaminD:2.5, magnesium:30 },
  { id:'sb2', name:'Caramel Macchiato (Grande, 2%)',category:"Starbucks",brand:"Starbucks",servingLabel:'16 fl oz',  per100g:false, calories:250, protein:10, carbs:35, fat:7,  fiber:0,  sugar:34, sodium:150,  potassium:0,   calcium:350, iron:0,   vitaminC:0,   vitaminD:2.5, magnesium:30 },
  { id:'sb3', name:'Cold Brew Coffee (Grande)',     category:"Starbucks",brand:"Starbucks",servingLabel:'16 fl oz',  per100g:false, calories:5,   protein:0,  carbs:0,  fat:0,  fiber:0,  sugar:0,  sodium:15,   potassium:0,   calcium:0,   iron:0,   vitaminC:0,   vitaminD:0,   magnesium:0  },

  // ── Pizza ─────────────────────────────────────────────────────────────────
  { id:'pz1', name:'Dominos Hand Tossed Cheese Pizza',category:"Pizza",brand:"Domino's",servingLabel:'1 slice (1/8 large)',per100g:false,calories:260,protein:11, carbs:35, fat:9,  fiber:2,  sugar:4,  sodium:570,  potassium:0,   calcium:200, iron:2.7, vitaminC:2,   vitaminD:0,   magnesium:20 },
  { id:'pz2', name:'Dominos Pepperoni Pizza',       category:"Pizza",  brand:"Domino's",servingLabel:'1 slice (1/8 large)',per100g:false,calories:300,protein:13, carbs:34, fat:13, fiber:2,  sugar:4,  sodium:750,  potassium:0,   calcium:200, iron:2.7, vitaminC:2,   vitaminD:0,   magnesium:20 },
  { id:'pz3', name:'Generic Cheese Pizza',          category:"Pizza",  servingLabel:'1 slice (107g)',per100g:false,calories:272, protein:12, carbs:34, fat:10, fiber:2,  sugar:4,  sodium:551,  potassium:0,   calcium:230, iron:2.7, vitaminC:2,   vitaminD:0,   magnesium:22 },
]

// Search the database. Returns up to `limit` results sorted by relevance.
export function searchFoodDb(query, limit = 10) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  if (!terms.length) return []

  return FOOD_DB
    .map((food) => {
      const hay = `${food.name} ${food.brand ?? ''} ${food.category}`.toLowerCase()
      let score = 0
      for (const t of terms) {
        if (hay.includes(t)) score += t.length > 3 ? 2 : 1
        if (food.name.toLowerCase().startsWith(t)) score += 3
      }
      return { food, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ food }) => food)
}
