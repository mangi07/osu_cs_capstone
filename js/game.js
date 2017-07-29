window.onload = function () {

    //var CAMERA_WIDTH = 1536;
    var CAMERA_WIDTH = 1280;
    var CAMERA_HEIGHT = 768;
    var WORLD_WIDTH = 2048;
    var WORLD_HEIGHT = 2048;
    var TILE_LENGTH = 64;
    var TILE_HEIGHT = 82;
    var POSITION_ADJUST = 4;
    var VELOCITY = 200;
    var STARTINGLUMBER = 100;
    var STARTINGFOOD = 100;
    var UI_HEIGHT = 2 * TILE_LENGTH + TILE_LENGTH / 4;
    var mapGroup;
    var uiGroup;
    var gridCoordsGenerator = new GridCoordinatesGenerator(
      WORLD_WIDTH, WORLD_HEIGHT - UI_HEIGHT, TILE_LENGTH, TILE_HEIGHT
    );
    var playerStructureGroup;
    var enemyStructureGroup;
    var addingStructureGroup;
    var playerUnits;
    var computerUnits;
    var uiResourceText;
    var uiUnitText;
    var uiSelectedUnit;
    var lumber;
    var food;
    var resources = { lumber: STARTINGLUMBER, food: STARTINGFOOD };
    var gameOver;
    var bgm;
    var selectedUnit;
    var selectedStructure;
    var playerUnitCount = 0;
    var enemyUnitCount = 0;
    var enemyLumber;
    var enemyFood;
    var spawnX;
    var spawnY;
    var spawnFlag;
    var currStructCount;
    var compCollectUnit1;
    var compCollectUnit2;
    var compDefenseUnits = [];
    var compAttackUnits = [];
    var moveDown;
    var startAttack;
    var uiResourceText;
  
    var units = {};
    //change this to a loop over an array of unit types??
    var type = "beaver";
    loadJSON(type, (function (response) {
        // Parse JSON string into object
        units[type] = JSON.parse(response);
    }));

    var type = "lumberjack";
    loadJSON(type, (function (response) {
        // Parse JSON string into object
        units[type] = JSON.parse(response);
    }));

    var type = "bear";
    loadJSON(type, (function (response) {
        // Parse JSON string into object
        units[type] = JSON.parse(response);
    }));

    var type = "woodsman";
    loadJSON(type, (function (response) {
        // Parse JSON string into object
        units[type] = JSON.parse(response);
    }));

    var game = new Phaser.Game(CAMERA_WIDTH, CAMERA_HEIGHT, Phaser.AUTO, '',
      { preload: preload, create: create, update: update, render: render });

    function preload() {
        loadSounds();
        loadSprites();
    }

    function create() {
        game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
        bgm = game.add.audio('bgm');
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        createGroups();
        loadMap();
        initResourceCount();

        loadUserInterface();

        unitCount = 0;
        createUnits();
        collectResourcesAI();
        spawnUnitAI();
        defendAI();
        attackAI();

        game.input.mousePointer.leftButton.onDown.add(selectUnit, this);

        this.game.input.mousePointer.rightButton.onDown.add(moveUnit, this)
        gameOver = false;

        game.sound.setDecodedCallback([bgm], start, this);

        currStructCount = 1;
        spawnFlag = true;
        moveDown = true;
        startAttack = true;

    }

    function start() {
        bgm.loopFull(0.6);
    }

    function update() {
        if (!gameOver) {
            updateCameraView();
            updateUIText();

            // check overlap between all player units and resources
            for (var j = 0; j < mapGroup.children.length; j++) {
                if (game.physics.arcade.overlap(playerUnits, mapGroup.children[j], collectResource, null, this) == false) {
                    mapGroup.children[j].alpha = 1;
                }
                game.physics.arcade.overlap(computerUnits, mapGroup.children[j], collectResource, null, this);
            }

            // check overlap between all player units and their destinations, each other, and structures
            // Note: Group versus Group overlap checks could make such overlap checking more concise
            for (i = 0; i < playerUnits.children.length; i++) {
                game.physics.arcade.overlap(playerUnits.children[i], game['destPoint' + playerUnits.children[i].name], stopUnit, null, this);
                for (var j = 0; j < playerUnits.children.length; j++) { // suggest var j = i if it helps performance
                    game.physics.arcade.overlap(playerUnits.children[i], playerUnits.children[j], stopUnit, null, this);
                }
                // TODO: units get stuck on overlap
                game.physics.arcade.overlap(playerUnits.children[i], playerStructureGroup, healUnit, null, this);
                game.physics.arcade.overlap(playerUnits.children[i], enemyStructureGroup, structureDamage, null, this);


            }

            // check overlap between all computer units and their destinations, each other, and structures
            for (i = 0; i < computerUnits.children.length; i++) {
                game.physics.arcade.overlap(computerUnits.children[i], game['destPoint' + computerUnits.children[i].name], stopUnit, null, this);
                for (var j = 0; j < computerUnits.children.length; j++) { // suggest var j = i if it helps performance
                    game.physics.arcade.overlap(computerUnits.children[i], computerUnits.children[j], stopUnit, null, this);
                }
                game.physics.arcade.overlap(computerUnits.children[i], enemyStructureGroup, healUnit, null, this);
                game.physics.arcade.overlap(computerUnits.children[i], playerStructureGroup, structureDamage, null, this);
            }

            // check overlap of each player unit with a computer unit
            for (var i = 0; i < playerUnits.children.length; i++) {
                for (var j = 0; j < computerUnits.children.length; j++) {
                    game.physics.arcade.overlap(playerUnits.children[i], computerUnits.children[j], unitCombat, null, this);
                }
            }

            // when placing a resource and dragging over a sprite it should not overlap, tint the dragged resource red
            //Structures.update(uiGroup, playerStructureGroup, enemyStructureGroup, mapGroup, game);
            Structures.update(game, uiGroup, [playerStructureGroup, enemyStructureGroup, mapGroup, playerUnits, computerUnits]);

            if (spawnFlag) {
                spawnFlag = false;
            }

        }
        else { // game over stuff
            playerUnits.forEach(function (unit) {
                unit.body.velocity.x = 0;
                unit.body.velocity.y = 0;
            });
            computerUnits.forEach(function (unit) {
                unit.body.velocity.x = 0;
                unit.body.velocity.y = 0;
            });
            Structures.disableStructureCreation(uiGroup);
            game.time.events.removeAll();
        }
        checkGameOver();
    }

    function collectResource(resource, unit) {
        if (playerUnits.getIndex(unit) > -1)
            resource.alpha = 0.6;
        if (resource.collectFlag == true) {
            //console.log(enemyLumber + " " + enemyFood);
            game.time.events.add(5000, function () {
                if (resource.type == 'tree') {
                    if (playerUnits.getIndex(unit) > -1)
                        game.resources.lumber += 10;
                    else
                        enemyLumber += 10;
                }
                else {
                    if (playerUnits.getIndex(unit) > -1)
                        game.resources.food += 10;
                    else
                        enemyFood += 10;
                }
                resource.collectFlag = true;
            }, this);
            resource.collectFlag = false;
        }
    }

    function selectUnit() {
        console.log(selectedUnit);
        console.log(selectedStructure);
        console.log(playerUnits);
        for (i = 0; i < playerUnits.children.length; i++) {
            playerUnits.children[i].tint = 0xFFFFFF;
            if (Phaser.Rectangle.contains(playerUnits.children[i].body, this.game.input.activePointer.x + game.camera.x, this.game.input.activePointer.y + game.camera.y)) {
                playerUnits.children[i].tint = 0xFFDF00;
                selectedUnit = playerUnits.children[i];
                console.log(playerUnits.children[i]);
                selectedStructure = null;
            }
        }
        for (i = 0; i < playerStructureGroup.children.length; i++) {
            playerStructureGroup.children[i].tint = 0xFFFFFF;
            console.log(playerStructureGroup);
            if (Phaser.Rectangle.contains(playerStructureGroup.children[i].body, this.game.input.activePointer.x + game.camera.x, this.game.input.activePointer.y + game.camera.y)) {
                selectedStructure = playerStructureGroup.children[i];
                playerStructureGroup.children[i].tint = 0xFFDF00;
                if (selectedUnit) {
                    selectedUnit.alpha = 1;
                }
                selectedUnit = null;
                return;
            }
        }
    }

    function moveUnit() {
        if (selectedStructure != null) {
            return;
        }
        console.log(game.input);
        if (!gameOver) {
            if (this.game.input.activePointer.y > CAMERA_HEIGHT - UI_HEIGHT)
                return;
        if (game['destPoint' + selectedUnit.name]) {
            game['destPoint' + selectedUnit.name].kill();
        }

        game['destPoint' + selectedUnit.name] = game.add.sprite(this.game.input.activePointer.x + game.camera.x, this.game.input.activePointer.y + game.camera.y);


            //console.log(selectedUnit);

            if (game['destPoint' + selectedUnit.name]) {
                game['destPoint' + selectedUnit.name].kill();
            }
            game['destPoint' + selectedUnit.name] = game.add.sprite(this.game.input.activePointer.x + game.camera.x, this.game.input.activePointer.y + game.camera.y);
            game['destPoint' + selectedUnit.name].width = 10;
            game['destPoint' + selectedUnit.name].height = 10;
            game['destPoint' + selectedUnit.name].enableBody = true;
            game.physics.arcade.enable(game['destPoint' + selectedUnit.name]);
            game.physics.arcade.moveToObject(selectedUnit, game['destPoint' + selectedUnit.name], VELOCITY);
        }
    }

    function moveCompUnit(unit, x, y) {
        if (!gameOver) {
            if (game['destPoint' + unit.name]) {
                game['destPoint' + unit.name].kill();
            }
            game['destPoint' + unit.name] = game.add.sprite(x, y);

            game['destPoint' + unit.name].enableBody = true;
            game.physics.arcade.enable(game['destPoint' + unit.name]);
            game.physics.arcade.moveToObject(unit, game['destPoint' + unit.name], VELOCITY);
        }
    }

    function render() {

        //game.debug.cameraInfo(game.camera, 32, 32);
        //game.debug.pointer(game.input.mousePointer);
    }

    function stopUnit(unit, destSprite) {
        if (unit.body != null) {
            unit.body.velocity.y = 0;
            unit.body.velocity.x = 0;
        }
        if (destSprite != undefined) {
            if (playerUnits.getIndex(destSprite) == -1 &&
                computerUnits.getIndex(destSprite) == -1) {
                destSprite.destroy();
            }
            else {
                if (destSprite.body.velocity.x == 0 &&
                    destSprite.body.velocity.y == 0) {
                    if (unit.body.position.y < destSprite.body.position.y) {
                        unit.body.position.y -= TILE_LENGTH / 8;
                        destSprite.body.position.y += TILE_LENGTH / 8;
                    }
                    else {
                        unit.body.position.y += TILE_LENGTH / 8;
                        destSprite.body.position.y -= TILE_LENGTH / 8;

                    }
                }
            }
        }
    }

    function healUnit(unit) {
        unit.body.velocity.x = 0;
        unit.body.velocity.y = 0;
        if (unit.HP < unit.Max_HP) {
            unit.HP += Math.min(1, unit.Max_HP - unit.HP);
        }
        //console.log(unit.HP);
    }
    function unitCombat(player, enemy) {
        if (playerUnits.getIndex(player) > -1) {
            stopUnit(player, game['destPoint' + player.name]);
        }
        if (computerUnits.getIndex(enemy) > -1) {
            stopUnit(enemy, game['destPoint' + enemy.name]);
        }
        var roll = Math.random();
        //console.log(roll);
        if (roll > .5)
            player.HP = player.HP - Math.max(0, (enemy.Attack - player.Defense));
        else
            enemy.HP = enemy.HP - Math.max(0,(player.Attack - enemy.Defense));

        console.log(player.HP, enemy.HP);
        if (player.HP < 0)
            player.destroy();
        if (enemy.HP < 0)
            enemy.destroy();
    }
    function structureDamage(player, structure){
        Structures.damage(game, structure)
    }

    function initResourceCount() {
        game.resources = { lumber: STARTINGLUMBER, food: STARTINGFOOD };
        enemyLumber = 100;
        enemyFood = 100;
    }

    function updateCameraView() {
        var x;
        var y;
        if (game.input.activePointer.isUp) {
            x = game.input.activePointer.position.x;
            y = game.input.activePointer.position.y;
            if (x > CAMERA_WIDTH - TILE_LENGTH) {
                game.camera.x += 10;
            }
            else if (x < TILE_LENGTH) {
                game.camera.x -= 10;
            }

            if (y > CAMERA_HEIGHT - TILE_LENGTH / 4) {
                game.camera.y += 10;
            }
            else if (y < TILE_LENGTH) {
                game.camera.y -= 10;
            }
        }
    }

    function createGroups() {
        mapGroup = game.add.group();
        playerStructureGroup = game.add.group();
        enemyStructureGroup = game.add.group();
        addingStructureGroup = game.add.group();
        uiGroup = game.add.group();
        playerUnits = game.add.group();
        computerUnits = game.add.group();
    }

    function loadSprites() {
        game.load.image('structure', 'assets/tiles/grass.png');
        game.load.image('tree', 'assets/tiles/tree.png');
        game.load.image('cut-tree', 'assets/tiles/cut-tree.png');
        game.load.image('berry', 'assets/tiles/berry-bush.png');
        game.load.image('cut-berry', 'assets/tiles/cut-berry-bush.png');
        game.load.image('ui-background', 'assets/tiles/sky.png');
        game.load.image('sawmill', 'assets/structures/sawmill.png');
        game.load.image('dam', 'assets/structures/dam.png');
        game.load.image('beaver', 'assets/units/beaver.png');
        game.load.image('lumberjack', 'assets/units/lumberjack.png');
        game.load.image('bear', 'assets/units/bear.png');
        game.load.image('woodsman', 'assets/units/woodsman.png');
        game.load.spritesheet('explosion', 'assets/structures/exp2.png', 64, 64, 16);
        //game.load.image('explosion', 'assets/structures/exp2.png');
    }

    function loadSounds() {
        game.load.audio('bgm', 'assets/audio/Blob-Monsters-Return.mp3');
        game.sound.setDecodedCallback([bgm], create, this);
    }

    function loadMap() {
        var tile;
        var treeSparsityFactor = 10;
        var resourceSparsityFactor = 3;
        var treeFlag = true;
        var secondClick = false;

        game.stage.backgroundColor = 0x22b14c;
        for (var j = 0; j < 100; j++) {
            var coords = gridCoordsGenerator.getCoords(3);
            x = coords[0];
            y = coords[1];
            //x = Math.floor(Math.random() * game.world.width);
            //y = Math.floor(Math.random() * game.world.height);
            if (x < game.world.width / 3 || x > game.world.width * 2 / 3) {
                if (treeFlag) {
                    tile = game.add.sprite(x, y, 'tree');
                    treeFlag = false;
                    tile.type = 'tree';
                }
                else {
                    tile = game.add.sprite(x, y, 'berry');
                    tile.width = TILE_LENGTH;
                    tile.height = TILE_LENGTH;
                    treeFlag = true;
                    tile.type = 'berry';

                }
            }
            else {
                if (Math.floor(Math.random() * 2) != 0) {
                    tile = game.add.sprite(x, y, 'tree');
                    tile.type = 'tree';
                }
                else {
                    tile = game.add.sprite(x, y, 'berry');
                    tile.width = TILE_LENGTH;
                    tile.height = TILE_LENGTH;
                    tile.type = 'berry';
                }
            }
            tile.anchor.setTo(0, 0);
            mapGroup.add(tile);
            tile.inputEnabled = true;
            game.physics.arcade.enable(tile);
            tile.collectFlag = true;
        }
        /*
                    Structures.initStructures(
                      gridCoordsGenerator,
                      playerStructureGroup,
                      enemyStructureGroup,
                      game
                    );
        */
        // This leaves us the option to initialize more structures if later we decide we want to.
        Structures.initStructures(
          gridCoordsGenerator, 1, 1,
          playerStructureGroup, "sawmill",
          game
        );
        Structures.initStructures(
          gridCoordsGenerator, 2, 1,
          enemyStructureGroup, "dam",
          game
        );
        
        //borrowed from: http://www.andy-howard.com/how-to-double-click-in-phaser/index.html on 7/12/17
        playerStructureGroup.forEach(function(structure) {
            structure.secondClick = false;
            structure.events.onInputDown.add(function(itemBeingClicked) {
                if (!structure.secondClick) { 
                    structure.secondClick = true;
                    game.time.events.add(300, function(){
                        structure.secondClick = false;
                    }, this);
                }
                else {
                    structure.secondClick = false;
                    if (game.resources.lumber > 10 && game.resources.food > 10) {
                        game.resources.lumber -= 10;
                        game.resources.food -= 10;
                        if (structure.position.x - TILE_LENGTH > 0)
                            spawnX = structure.position.x - TILE_LENGTH;
                        else
                            spawnX = structure.position.x + 2*TILE_LENGTH;
                        if (structure.position.y - TILE_LENGTH > 0)
                            spawnY = structure.position.y - TILE_LENGTH;
                        else
                            spawnY = structure.position.y + 2*TILE_LENGTH;
                        spawnPlayerUnit(spawnX, spawnY, 'lumberjack');
                    }
                }

            }, this);
            playerStructureGroup.enableBody = true;
        });

        enemyStructureGroup.forEach(function (structure){
            structure.HP = 25000;
            structure.Attack = 15;
            structure.Defense = 20;

        });
    }


    function loadUserInterface() {
        var uiSprite;
        var uiResourceBar;
        var uiBackground = game.add.image(0, CAMERA_HEIGHT - UI_HEIGHT, 'ui-background');
        uiBackground.width = CAMERA_WIDTH;
        uiBackground.height = UI_HEIGHT;
        uiGroup.add(uiBackground);
        addingStructureGroup.inputEnableChildren = true;
        var structureSprites = ["sawmill", "structure", "structure", "structure", "structure"];
        var x;
        var y = CAMERA_HEIGHT - UI_HEIGHT + TILE_LENGTH;
        for (var i = 1; i <= structureSprites.length; i++) {
            x = i * TILE_LENGTH + TILE_LENGTH / 2;

            uiSprite = game.add.sprite(x, y, structureSprites[i-1]);
            uiSprite.anchor.setTo(0, 0);

            uiGroup.add(uiSprite);

            Structures.enableStructureCreation(
              uiGroup,
              uiSprite,
              playerStructureGroup,
              enemyStructureGroup,
              mapGroup,
              resources,
              playerUnits,
              computerUnits,
              playerUnitCount,
              game
            );
        }

        uiResourceText = game.add.text(TILE_LENGTH + 5, CAMERA_HEIGHT - UI_HEIGHT + 5, "Lumber: " + game.resources.lumber + "   Food: " + game.resources.food);
        uiUnitText = game.add.text(TILE_LENGTH + 600, CAMERA_HEIGHT - UI_HEIGHT + 5, "Selected Unit: ");
        uiResourceText.fill = "white";
        uiUnitText.anchor.setTo(0, 0);
        uiSelectedUnit = game.add.sprite(TILE_LENGTH + 450, CAMERA_HEIGHT - UI_HEIGHT + 5, "lumberjack");
        uiSelectedUnit.height = 40;
        uiSelectedUnit.width = 40;
        uiUnitText.fill = "white";
        uiSelectedUnit.anchor.setTo(0, 0);
        uiResourceText.anchor.setTo(0, 0);
        uiGroup.add(uiResourceText);
        uiGroup.add(uiUnitText);
        uiGroup.add(uiSelectedUnit);
        uiGroup.fixedToCamera = true;
    }

    function updateUIText() {
        //console.log(selectedUnit);
        uiResourceText.setText("Lumber: " + game.resources.lumber + "   Food: " + game.resources.food);

        if (selectedUnit) {
            uiUnitText.setText("Selected Unit: " + (selectedUnit && selectedUnit.type ? selectedUnit.type : "None") + "\nHealth: " + selectedUnit.HP + "\nAttack: " + selectedUnit.Attack + "\nDefense: " + selectedUnit.Defense);
            uiSelectedUnit.loadTexture(selectedUnit.key, 0, false);
        }
        else if (selectedStructure) {
            uiUnitText.setText("HitPoints: " + selectedStructure.HP);
            uiSelectedUnit.loadTexture(selectedStructure.key, 0, false);
        }

        uiSelectedUnit.width = UI_HEIGHT;
        uiSelectedUnit.height = UI_HEIGHT;


    }

    function checkGameOver() {
        var resultString;
        var gameOverText;
        if (playerStructureGroup.countLiving() == 0 ||
            enemyStructureGroup.countLiving() == 0) {
            gameOver = true;
            if (playerStructureGroup.countLiving() == 0)
                resultString = "LOSE";
            else
                resultString = "WIN";
            gameOverText = game.add.text(game.camera.x + CAMERA_WIDTH / 2, game.camera.y + CAMERA_HEIGHT / 2, "GAME OVER - YOU " + resultString + "!");
            gameOverText.anchor.setTo(0.5, 0.5);
            gameOverText.fontSize = 60;
        }
    }


    function createUnits() {
        var playerUnitX = playerStructureGroup.getTop().position.x;
        var playerUnitY = playerStructureGroup.getTop().position.y;
        var computerUnitX = enemyStructureGroup.getTop().position.x;
        var computerUnitY = enemyStructureGroup.getTop().position.y;
        if (playerUnitY + 2 * TILE_LENGTH < WORLD_HEIGHT - UI_HEIGHT) {
            spawnPlayerUnit(playerUnitX, playerUnitY + 2 * TILE_LENGTH, 'lumberjack');
        }
        else if (playerUnitX + 2 * TILE_LENGTH < WORLD_WIDTH) {
            spawnPlayerUnit(playerUnitX + 2 * TILE_LENGTH, playerUnitY, 'lumberjack');
        }
        else if (playerUnitX - 2 * TILE_LENGTH > 0) {
            spawnPlayerUnit(playerUnitX - 2 * TILE_LENGTH, playerUnitY, 'lumberjack');
        }
        if (playerUnitY - 2 * TILE_LENGTH > 0) {
            spawnPlayerUnit(playerUnitX, playerUnitY - 2 * TILE_LENGTH, 'woodsman');
        }
        else if (playerUnitX - 2 * TILE_LENGTH > 0) {
            spawnPlayerUnit(playerUnitX - 2 * TILE_LENGTH, playerUnitY, 'woodsman');
        }
        else if (playerUnitX + 2 * TILE_LENGTH > WORLD_WIDTH) {
            spawnPlayerUnit(playerUnitX + 2 * TILE_LENGTH, playerUnitY, 'woodsman');
        }


        spawnEnemyUnit(computerUnitX, computerUnitY, 'bear');
        selectedUnit = playerUnits.children[0];
    }

    function spawnPlayerUnit(x, y, type) {
        console.log(units);
        var unitData = units[type];
        console.log(unitData);
        var playerUnit = playerUnits.create(x, y, type);
        playerUnit.name = "playerUnit" + playerUnitCount;
        playerUnit.type = type;
        playerUnit.width = 40; //possibly make variable based on unit file later
        playerUnit.height = 40;//possibly make variable based on unit file later
        playerUnit.anchor.setTo(0, 0);
        playerUnit.HP = unitData.max_hp;
        playerUnit.Max_HP = unitData.max_hp;
        playerUnit.Attack = unitData.attack;
        playerUnit.Defense = unitData.defense;

        game.physics.arcade.enable(playerUnit);
        playerUnit.enableBody = true;
        playerUnitCount += 1;
        console.log("spawned unit");
    }


    function spawnEnemyUnit(x, y, type) {
        console.log(units);
        var unitData = units[type];
        console.log(unitData);
        var enemyUnit = computerUnits.create(x, y, type);
        enemyUnit.name = "enemyUnit" + playerUnitCount;
        enemyUnit.Type = type;
        enemyUnit.width = 40; //possibly make variable based on unit file later
        enemyUnit.height = 40;//possibly make variable based on unit file later
        enemyUnit.anchor.setTo(0, 0);
        enemyUnit.HP = unitData.max_hp;
        enemyUnit.Max_HP = unitData.max_hp;
        enemyUnit.Attack = unitData.attack;
        enemyUnit.Defense = unitData.defense;
        game.physics.arcade.enable(enemyUnit);
        enemyUnit.enableBody = true;
        enemyUnitCount += 1;
        console.log("spawned unit");

    }

    function collectResourcesAI() {
      if (computerUnits.countLiving() > 1) {
        var closestResource;
        var compUnit1 = computerUnits.getChildAt(0);
        var compUnit2 = computerUnits.getChildAt(1);
        closestResource = mapGroup.getClosestTo(enemyStructureGroup.getTop(), function(resource){return resource.type == 'tree';});
        moveCompUnit(compUnit1, closestResource.body.position.x, closestResource.body.position.y);
        closestResource = mapGroup.getClosestTo(enemyStructureGroup.getTop(), function(resource){return resource.type == 'berry';});
        moveCompUnit(compUnit2, closestResource.body.position.x, closestResource.body.position.y);
        compCollectUnit1 = compUnit1;
        compCollectUnit2 = compUnit2;
        game.time.events.add(1000, collectResourcesAI, this);
      }
    }

    function spawnUnitAI() {
        var compStruct1 = enemyStructureGroup.getTop();
        if (enemyLumber > 10 && enemyFood > 10) {
            spawnEnemyUnit(compStruct1.position.x - TILE_LENGTH, compStruct1.position.y - TILE_LENGTH, "beaver");
            enemyLumber -= 10;
            enemyFood -= 10;
        }
        game.time.events.add(10000, spawnUnitAI, this);
    }

    function defendAI() {
        var compStruct1 = enemyStructureGroup.getTop();
        if (computerUnits.countLiving() < 3) {
            compDefenseUnits = [];
        }
        if (compDefenseUnits.length < 12) {
            computerUnits.forEachAlive(function(unit) {
                if (unit != compCollectUnit1 && unit != compCollectUnit2 &&
                    compDefenseUnits.indexOf(unit) == -1) {
                    compDefenseUnits.push(unit);
                }
            });
        }
        xOffsetGlobal = 2*TILE_LENGTH;
        yOffsetGlobal = 2*TILE_LENGTH;
        for (i = 0; i < compDefenseUnits.length; i++) {
            if (compDefenseUnits[i].alive){
                    stopUnit(compDefenseUnits[i], undefined);
                    if (i < 4) {
                        xOffset = (2 - Math.floor(i/2) + 1) * TILE_LENGTH;
                        yOffset = yOffsetGlobal/2;
                    }
                    else if (i < 8) {
                        xOffset = xOffsetGlobal/2;
                        yOffset = (2 - Math.floor((i-4)/2) + 1) * TILE_LENGTH;
                    }
                    else if (i < 12) {
                        xOffset = xOffsetGlobal/2;
                        yOffset = -((2 - Math.floor((i-8)/2) + 1) * TILE_LENGTH);
                    }
                    if (moveDown == true) {
                        if (i > 3 && i < 12)
                            xOffset = -xOffset;
                    }
                    else {
                        if (i < 4)
                            yOffset = -yOffset;
                    }
                    if (i < 4)
                        yOffset = (i % 2) * yOffsetGlobal + yOffset;
                    else if (i < 12)
                        xOffset = ((i % 2) - 1) * xOffsetGlobal - xOffset;
                    moveCompUnit(compDefenseUnits[i],
                        compStruct1.body.position.x - xOffset,
                        compStruct1.body.position.y + yOffset);
            }
        }
        if (moveDown == true)
            moveDown = false;
        else
            moveDown = true;
        game.time.events.add(1000, defendAI, this);
    }

    function attackAI() {
        var compAttackUnit;
        if (computerUnits.countLiving() > 17) {
          if (startAttack) {
            for (i = 0; i < 4; i++) {
                compAttackUnit = compDefenseUnits.shift();
                moveCompUnit(compAttackUnit, playerStructureGroup.getTop().body.position.x,
                playerStructureGroup.getTop().body.position.y);
                compAttackUnits.push(compAttackUnit);
                
            }
            computerUnits.forEachAlive(function(unit) {
                if (unit != compCollectUnit1 && unit != compCollectUnit2
                    && compDefenseUnits.indexOf(unit) == -1
                    && compAttackUnits.indexOf(unit) == -1) {
                    compDefenseUnits.unshift(unit);
                }
            });
            startAttack = false;
          }
          else {
            for (var j = 0; j < compAttackUnits.length; j++) {
                moveCompUnit(compAttackUnits[j], playerStructureGroup.getTop().body.position.x,
                playerStructureGroup.getTop().body.position.y);
            }
          }
        }
        else {
            compAttackUnits = [];
            startAttack = true;
        }
        game.time.events.add(1000, attackAI, this);

    }

  function loadJSON(type, callback) {   
//https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', 'assets/units/' + type + '.json', false); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }
//         return fetch("assets/units/" + type + ".json")
//   .then((resp) => resp.json())
//   .then(data => {
//       return data;
//   });

    

};
