export const GAME_TITLE = 'Paw-a-dise';

export const ART = {
  loadingAurora: 'https://static.seeles.ai/media/assets/6427ec1e117f41e9bc6506b504d7036a_1780722110411188200_c30a5de61706973027a93b9d7e266c77_17807221079824836849572063542802.jpg',
  villageMeadow: 'https://static.seeles.ai/media/assets/565b432ca70241ed8f04cdbb262ed481_1780722110411188200_a10e5a24668456ad57d06792b90b6ea1_17807221049827748708342842997105.jpg',
  levelMap: 'https://static.seeles.ai/media/assets/2d43c3fa45ea41d9a94eb173348a5a5d_1780722110411188200_699f23849308c8de077c6e50fea9dbbd_17807221060779164475892006008261.jpg',
  shopBackground: 'https://static.seeles.ai/media/assets/fdcf3d469d8c42e9b9db64b1df887582_1780722110411188200_f6f530340d7d751f495f8fc6efee42cf_17807221048763141266808779971955.jpg',
  collectionBackground: 'https://static.seeles.ai/media/assets/7bc6a7dda4844b26883bd8991b5b93e0_1780722449484306200_fc9161c2102ce6a7f6bb773379dd04f7_17807224472982055213231472781692.jpg',
  profileBackground: 'https://static.seeles.ai/media/assets/a329db01472541a5bb9a6c6c134db5b9_1780722443473547200_2dd5215ff9fb57558733ecc7187defe2_17807224417695873656148515865338.jpg',
  settingsBackground: 'https://static.seeles.ai/media/assets/dba5a9c782014a24bd32a48ae33f2d89_1780722471604628800_0cafff8b1ad0986042c52cc3705e10f2_17807224699962186574648185544067.jpg',
};

export const AUDIO = {
  bgm: {
    meadow: 'https://static.seeles.ai/data/asset/export/b8f7cabb-fa15-4c53-bc91-216e51b70f25/120914/bgm_a89dba64-c0f3-4a7b-a0d2-2710ab18d1d1.mp3',
    reveal: 'https://static.seeles.ai/data/asset/export/20956258-0864-4b75-b482-35f57d81a5a7/130727/bgm_0ae69691-136e-4eb1-8823-92bf71494814.mp3'
  },
  sfx: {
    tap: 'https://static.seeles.ai/data/asset/export/bf100615-b2b6-4304-a30c-046850253e5b/172463/sfx_b1705e41-6344-4841-a225-37c9c63e9b69.mp3',
    crack: 'https://static.seeles.ai/data/asset/export/02bcec6a-dad3-4f49-aaee-1466256feccb/172244/sfx_4cc00e46-6511-4737-8eba-86b82d97dc8e.mp3',
    combo: 'https://static.seeles.ai/data/asset/export/9b61cd5f-3fd4-4b08-beba-abb54673c25e/172426/sfx_2dac3f37-6856-4a18-9e25-4e90a0d1ce25.mp3',
    pawSwipe: 'https://static.seeles.ai/data/asset/export/6765de3f-1838-4cbf-8c57-2ffb1583c2ec/172204/sfx_d5d72120-b625-4e54-a473-808d9801717e.mp3',
    vineBurst: 'https://static.seeles.ai/data/asset/export/740c6c6d-b942-41d9-8bc9-b7afd1e9be94/172715/sfx_ccba1ba7-dc97-458e-8ef4-1f01217f5801.mp3',
    rainbowEgg: 'https://static.seeles.ai/data/asset/export/f64d5448-6c3b-45e1-80ba-cf09c98aa122/172111/sfx_86941429-8bc3-4f3c-845b-cfe927655069.mp3',
    dewdropFreeze: 'https://static.seeles.ai/data/asset/export/061be4f1-497d-4e13-85dc-5d57e4106779/172545/sfx_27a9ceb8-cf11-4a1b-aec8-6f8815bdfa11.mp3',
    grandHatch: 'https://static.seeles.ai/data/asset/export/279f5ec4-17d2-4ca1-97c2-cc17360c7c5c/171728/sfx_11ec4f09-9752-462a-ab93-a6fe2f1d4469.mp3',
    win: 'https://static.seeles.ai/data/asset/export/02bcec6a-dad3-4f49-aaee-1466256feccb/172244/sfx_4cc00e46-6511-4737-8eba-86b82d97dc8e.mp3',
    fail: 'https://static.seeles.ai/data/asset/export/279f5ec4-17d2-4ca1-97c2-cc17360c7c5c/171728/sfx_11ec4f09-9752-462a-ab93-a6fe2f1d4469.mp3',
    rareFound: 'https://static.seeles.ai/data/asset/export/f64d5448-6c3b-45e1-80ba-cf09c98aa122/172111/sfx_86941429-8bc3-4f3c-845b-cfe927655069.mp3'
  }
};

export const SKINS = {
  jewel: { key: 'jewel', name: 'Jewel Eggs', unlockText: 'Default skin' },
  materia: { key: 'materia', name: 'Materia Eggs', unlockText: 'Unlock at Level 25 or buy for 99 Acorns', acornCost: 99, unlockLevel: 25 },
};

export const EGG_TYPES = {
  clover: { key: 'clover', name: 'Clover Egg', accent: '#f7dfae', glow: 'rgba(255, 214, 139, 0.88)', jewelUrl: 'https://static.seeles.ai/media/assets/0ac90ec7b1494e3ebc8ecc0fa952e42d_1780722195427998300_fcadb3bfe4223f030e466c24ced76ae7_17807221935175779285243420619084.jpg', materiaUrl: 'https://static.seeles.ai/media/assets/c5bd0e139f274bc4af1b59b282e9ffdc_1780722249640729500_9a2dbc806726df62ef7efc9b7a8caae8_17807222436668141873991362828899.jpg' },
  amethyst: { key: 'amethyst', name: 'Amethyst Egg', accent: '#9a7dff', glow: 'rgba(166, 133, 255, 0.9)', jewelUrl: 'https://static.seeles.ai/media/assets/a89f956d4bf749a19b0667798218e23c_1780722210454771500_6b9916395b60dc38fa3d6381889e79f8_17807222080484774304207758316748.jpg', materiaUrl: 'https://static.seeles.ai/media/assets/d9a8d7388c0744919de2a5975d10de78_1780722246630580700_37ecca076d6759da97a04d6faaed30b6_17807222445109007311979059905760.jpg' },
  mossy: { key: 'mossy', name: 'Mossy Egg', accent: '#7eca75', glow: 'rgba(126, 216, 128, 0.88)', jewelUrl: 'https://static.seeles.ai/media/assets/5f9257df456b4de895467ecac1a18f08_1780722194851214800_d9ee3f138986cff07ef6e8237631e259_17807221923432689360501554875383.jpg', materiaUrl: 'https://static.seeles.ai/media/assets/5276bff00f42433390f3712ca96ffe9f_1780722308132617000_2e3cb550f1a593dd61203052e877cff5_17807223064744207073695992883827.jpg' },
  pearl: { key: 'pearl', name: 'Pearl Egg', accent: '#a8e8f8', glow: 'rgba(150, 241, 255, 0.92)', jewelUrl: 'https://static.seeles.ai/media/assets/94a0585ede744f7ab3800e39516f92dd_1780722194851214800_49821168066fcd5932c2bc9708c0ce0a_17807221921663015913601894791313.jpg', materiaUrl: 'https://static.seeles.ai/media/assets/c408fe2e3558483c91e9e41147ddaac2_1780722310817447700_353d0b93a62a40af8e3c9b608b788e5c_17807223093454305308930498785887.jpg' },
  sunburst: { key: 'sunburst', name: 'Sunburst Egg', accent: '#ffbf61', glow: 'rgba(255, 188, 93, 0.92)', jewelUrl: 'https://static.seeles.ai/media/assets/7d89578aace644f8b38368c6e47c579c_1780722245948368900_19385a19a29651f92b488330d63fced6_17807222432633647129470469412630.jpg', materiaUrl: 'https://static.seeles.ai/media/assets/790c1b454f634f0abbda7c6dda7960e4_1780722326224350000_e48379cb1ce9912168975374949a9fcf_17807223239067383700995190273537.jpg' },
  rosy: { key: 'rosy', name: 'Rosy Egg', accent: '#ffb0ca', glow: 'rgba(255, 178, 215, 0.9)', jewelUrl: 'https://static.seeles.ai/media/assets/f58558256b504787bf9d693608f62556_1780722247633780500_be78019c88062771f34f6086f1198242_17807222459036373270174402262140.jpg', materiaUrl: 'https://static.seeles.ai/media/assets/6f7d6a81ed7c48b2b12436b54d28b2b1_1780722306478713800_a7e65bd05585a002cceb46f83a730c3a_17807223040044503352586598043117.jpg' },
};

export const ANIMALS = {
  clover: { id: 'clover', name: 'Clover', rarity: 1, species: 'Baby white bunny', imageUrl: 'https://static.seeles.ai/media/assets/959347691f574fdcb06ea6408f0ef9e2_1780722405661824300_3f71d9e9dbe84bfe695b5896f8fd4d22_17807224038603748269587282433590.jpg', ability: 'Hops over with a welcome bonus when you return.', hint: 'Found often in Levels 1-5.', fragmentTarget: 4, eggKey: 'clover', rarityLabel: 'Common' },
  bramble: { id: 'bramble', name: 'Bramble', rarity: 1, species: 'Baby hedgehog', imageUrl: 'https://static.seeles.ai/media/assets/e1252727e34847e08146ebe9652a2ce7_1780722381809520800_58c4d8a08015c4fa789c7239ee92bc79_17807223795788839399424749633911.jpg', ability: 'Brings tiny meadow gifts every morning.', hint: 'Found in Levels 3-10.', fragmentTarget: 6, eggKey: 'mossy', rarityLabel: 'Common' },
  pippin: { id: 'pippin', name: 'Pippin', rarity: 1, species: 'Baby field mouse', imageUrl: 'https://static.seeles.ai/media/assets/31b3a811a77a402195003f2f2f19cf2d_1780722383531112700_6e0efc80f9cb97d8a47af879053c2ca3_17807223811784338044701962422112.jpg', ability: 'Leaves acorn offerings beside your path.', hint: 'Found in Levels 5-15.', fragmentTarget: 6, eggKey: 'pearl', rarityLabel: 'Common' },
  fern: { id: 'fern', name: 'Fern', rarity: 2, species: 'Baby fawn', imageUrl: 'https://static.seeles.ai/media/assets/7f31b080b3c248ad93f05806af5ee5a2_1780722382523936400_3fede1b3cc6db159c1fb38a14b2fdfcd_17807223808912205902261893289050.jpg', ability: 'Nuzzles the screen and boosts village bloom.', hint: 'Found in Levels 8-20.', fragmentTarget: 8, eggKey: 'sunburst', rarityLabel: 'Rare-Uncommon' },
  thistle: { id: 'thistle', name: 'Thistle', rarity: 3, species: 'Rare bunny', imageUrl: 'https://static.seeles.ai/media/assets/7fd98266e90a460abc9e64c7a98723b4_1780722613678988200_ec67d15fb9a6e1897ebd9a5dd96a6c83_17807226116821003922879834891882.jpg', ability: 'Watches the sunrise from the highest hill.', hint: 'Gold Level 10 or gather 8 clover fragments.', fragmentTarget: 1, eggKey: 'amethyst', rarityLabel: '⭐⭐⭐' },
  cobble: { id: 'cobble', name: 'Cobble', rarity: 3, species: 'Rare hedgehog', imageUrl: 'https://static.seeles.ai/media/assets/c27a9c7a071f496083816f87b9e3bb36_1780722598928662800_ddf5d43beee620b1b1ec732e26297867_17807225968224402531108199086247.jpg', ability: 'Tends a mushroom patch beside the bridge.', hint: 'Revisit Level 5 three times or earn Gold on Level 15.', fragmentTarget: 1, eggKey: 'mossy', rarityLabel: '⭐⭐⭐' },
  shimmer: { id: 'shimmer', name: 'Shimmer', rarity: 3, species: 'Rare field mouse', imageUrl: 'https://static.seeles.ai/media/assets/c5307d7a5b3846d38e704f07ad98f910_1780722591232485200_b9cca2ba4ce765b3247765cf48d78d57_17807225882876983738369540178608.jpg', ability: 'Plants glowing seeds that bloom overnight.', hint: 'Win 5 levels without power-ups.', fragmentTarget: 1, eggKey: 'pearl', rarityLabel: '⭐⭐⭐' },
  soleil: { id: 'soleil', name: 'Soleil', rarity: 4, species: 'Rare fawn', imageUrl: 'https://static.seeles.ai/media/assets/bcfa59ee3c4148ee8a128e52cc11c880_1780722595913421800_c63b15e5f0d006cbb5f41f07a4e33b3e_1780722593744595071919715939576.jpg', ability: 'Makes flowers bloom where it walks.', hint: 'Login 7 days and clear Level 20 with Gold.', fragmentTarget: 1, eggKey: 'sunburst', rarityLabel: '⭐⭐⭐⭐' },
  mist: { id: 'mist', name: 'Mist', rarity: 4, species: 'Rare hedgehog variant', imageUrl: 'https://static.seeles.ai/media/assets/92c7692f1be4457c81e213875d235388_1780722641733220400_a3a86b8934ad94ccd0ae005955beaabb_17807226396033947311392805147342.jpg', ability: 'Glows at night and gathers the village around it.', hint: 'Earn Silver or better on Levels 20-25 in one sweep.', fragmentTarget: 1, eggKey: 'amethyst', rarityLabel: '⭐⭐⭐⭐' },
  aurora: { id: 'aurora', name: 'Aurora', rarity: 5, species: 'Celestial Bunny Guardian', imageUrl: 'https://static.seeles.ai/media/assets/a81f341fdc794ed2b2a6c1ad359da2da_1780722436742780300_9df32e79558cc970f5c65fd9d8d16465_1780722434256198637849980400815.jpg', ability: 'Transforms night lighting into an aurora and becomes village guardian.', hint: 'Collect all five rare animals and 12 Aurora Fragments from Gold revisits.', fragmentTarget: 12, eggKey: 'amethyst', rarityLabel: '⭐⭐⭐⭐⭐ ULTRA' },
};

export const COMMON_ANIMAL_ORDER = ['clover', 'bramble', 'pippin', 'fern'];
export const RARE_ANIMAL_ORDER = ['thistle', 'cobble', 'shimmer', 'soleil', 'mist'];
export const COLLECTION_ORDER = [...COMMON_ANIMAL_ORDER, ...RARE_ANIMAL_ORDER, 'aurora'];

export const BUILDINGS = [
  { id: 'clover_burrow', name: 'Clover Burrow', cost: 50, type: 'Home', blurb: 'A snug hill burrow for bunny families.' },
  { id: 'hedgehog_hollow', name: 'Hedgehog Hollow', cost: 75, type: 'Home', blurb: 'A mossy den with mushroom lanterns.' },
  { id: 'mouse_mill', name: 'Mouse Mill', cost: 100, type: 'Utility', blurb: 'A tiny windmill that spins acorn dust into sparkles.' },
  { id: 'fawn_garden', name: 'Fawn Garden', cost: 120, type: 'Decor', blurb: 'A petal-lined resting meadow for fawns.' },
  { id: 'meadow_pond', name: 'Meadow Pond', cost: 150, type: 'Decor', blurb: 'Animals gather here for drinks and sunset reflections.' },
  { id: 'lantern_path', name: 'Lantern Path', cost: 80, type: 'Path', blurb: 'Golden lanterns that glow when evening falls.' },
  { id: 'rainbow_bridge', name: 'Rainbow Bridge', cost: 200, type: 'Landmark', blurb: 'A painted bridge that links new bloom pockets together.' },
];

export const WEATHER_STATES = ['Sunny Glow', 'Light Rain', 'Golden Mist', 'Starry Night'];

export const NAV_ITEMS = [
  { key: 'levels', label: 'Puzzle' },
  { key: 'village', label: 'Village' },
  { key: 'collection', label: 'Collection' },
  { key: 'shop', label: 'Shop' },
  { key: 'profile', label: 'Settings' },
];

export const POWER_UPS = {
  pawSwipe: { key: 'pawSwipe', label: 'Paw Swipe', icon: '🐾', comboThreshold: 6, description: 'Clears an entire row.' },
  vineBurst: { key: 'vineBurst', label: 'Vine Burst', icon: '🌿', comboThreshold: 8, description: 'Clears the row and column.' },
  rainbowEgg: { key: 'rainbowEgg', label: 'Rainbow Egg', icon: '🌈', comboThreshold: 10, description: 'Clears all eggs of one type.' },
  nestSpin: { key: 'nestSpin', label: 'Nest Spin', icon: '🍃', description: 'Clears a 3x3 area.' },
  dewdropFreeze: { key: 'dewdropFreeze', label: 'Dewdrop Freeze', icon: '❄️', description: 'Freezes vine growth for 15 seconds.' },
  grandHatch: { key: 'grandHatch', label: 'Grand Hatch', icon: '⭐', description: 'Clears the entire board.' },
};

export const WORLD = {
  key: 'cloverfield_meadow',
  name: 'Cloverfield Meadow',
  nextWorldName: 'Moonpetal Coast',
};
