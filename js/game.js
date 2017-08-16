window.onload = function () {
    var query = window.location.search.substring(1);
    var DIFFICULTY = false;
    var saveButton = document.getElementById('savebutton');
    var mode = document.getElementById('mode');

    saveButton.onclick = function () {
        saveGame();
    }
    var loadBool;
    if (query == "load") {
        loadBool = true;
    }
    else if (query == "easy") {
        loadBool = false;
        DIFFICULTY = false;
        mode.textContent = "Easy Mode";
    }

    else if (query == "hard") {
        loadBool = false;
        DIFFICULTY = true;
        mode.textContent = "Hard Mode";
    }
   
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
    var LUMBER_PER_TREE = 160;
    var FOOD_PER_BUSH = 160;
    var RESOURCE_PER_GATHER = 10;
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
    var combatSFX;
    var gatherBerry;
    var gatherWood;
    var selectedUnit = [];
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
    var selectWindow;
    var selectWindowFlag;
    var selectionChange;
    var runInitialAI = true;
    var damBuilders = [];
    var harvesters = [];
    var attackers = [];
    var boundayCheckLoopEvent;
    var downKey;
    var rightKey;
    var upKey;
    var leftKey;
    var uiBackground;
    var units = {};
    var announceText;
    var border;		   
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
        border = game.add.graphics(0, 0);
        border.lineStyle(3, 0x00000000, 1);
        border.drawRect(1, 1, WORLD_WIDTH -3, WORLD_HEIGHT - UI_HEIGHT - 3);
        border.endFill();
        border.z = -99999;
        game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
        bgm = game.add.audio('bgm');
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        game.physics.setBoundsToWorld();					
        createGroups();
        initResourceCount();
        loadUserInterface();
        unitCount = 0;

        if (loadBool) {
            loadGame();
        }
        else {
            loadMap();
            createUnits();
        }
        collectResourcesAI();
        spawnUnitAI();
        defendAI();
        attackAI();
        selectWindowFlag = false;
        game.input.mousePointer.leftButton.onDown.add(selectUnit, this);
        game.input.mousePointer.rightButton.onUp.add(moveUnit, this);
		downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        gameOver = false;
        game.sound.setDecodedCallback([bgm], start, this);
        combatSFX = game.add.audio('combatSFX');
        gatherBerry = game.add.audio('gatherBerry');
        gatherWood = game.add.audio('gatherWood');
        game.input.
        currStructCount = 1;
        spawnFlag = true;
        moveDown = true;
        startAttack = true;
        initAImapBoundaryUpdates();
        selectWindow = new Phaser.Rectangle(0, 0, 10, 10);							   
		game.world.bringToTop(uiGroup);
    }

    function start() {
        bgm.loopFull(0.2);
    }

    function update() {
        if (!gameOver) {
            updateCameraView();
            updateUIText();
            selectedUnit = selectedUnit.filter(function(unit) {
                return unit.alive;
            });
            if (game.input.mousePointer.rightButton.ctrlKey) {
                game.input.mousePointer.rightButton.ctrlKey = false;
                if (selectedUnit.length == 1) {
                    mapGroup.forEach(function(resource) {
                        if (Phaser.Rectangle.contains(resource, game.camera.x+game.input.activePointer.x, game.camera.y+game.input.activePointer.y)) {
                            selectedUnit[0].gather = true;
                            selectedUnit[0].resourceType = resource.type;
                        }
                    });
                }
            }
            mapGroup.forEach(function(resource) {
                if (resource.type == 'tree' &&
                    resource.count <= LUMBER_PER_TREE/2) {
                    resource.loadTexture('cut-tree');
                }
                else if (resource.type == 'berry' &&
                         resource.count <= FOOD_PER_BUSH/2) {
                    resource.loadTexture('cut-berry');
                }
            });
            playerUnits.forEach(function(unit) {
                if (unit.key == 'lumberjack' && unit.body.velocity.x < 0)
                    unit.loadTexture('lumberjack-left');
                else if (unit.key == 'lumberjack-left' && unit.body.velocity.x > 0)
                    unit.loadTexture('lumberjack');
                if (unit.key == 'woodsman' && unit.body.velocity.x < 0)
                    unit.loadTexture('woodsman-left');
                else if (unit.key == 'woodsman-left' && unit.body.velocity.x > 0)
                    unit.loadTexture('woodsman');
                if (unit.gather)
                    collectResourceAI(unit, playerStructureGroup);
                if (unit.heal && unit.healSprite) {
                    unit.healSprite.x = unit.x;
                    unit.healSprite.y = unit.y;
                }
            });
            computerUnits.forEach(function(unit) {
                if (unit.key == 'beaver' && unit.body.velocity.x < 0)
                    unit.loadTexture('beaver-left');
                else if (unit.key == 'beaver-left' && unit.body.velocity.x > 0)
                    unit.loadTexture('beaver');
                if (unit.key == 'bear' && unit.body.velocity.x < 0)
                    unit.loadTexture('bear-left');
                else if (unit.key == 'bear-left' && unit.body.velocity.x > 0)
                    unit.loadTexture('bear');
                if (unit.gather)
                    collectResourceAI(unit, enemyStructureGroup);
                if (unit.heal && unit.healSprite) {
                    unit.healSprite.x = unit.x;
                    unit.healSprite.y = unit.y;
                }
            });
            if (game.input.mousePointer.leftButton.ctrlKey) {
                game.input.mousePointer.leftButton.ctrlKey = false;
                if (!selectWindowFlag) {
                    selectWindow.x = game.camera.x + game.input.activePointer.x;
                    selectWindow.y = game.camera.y + game.input.activePointer.y;
                    selectWindowFlag = true;
                    graphics = game.add.graphics(0, 0); 
                    graphics.beginFill(0x00FFFF);
                    graphics.drawRect(selectWindow.x, selectWindow.y, 10, 10);
                    graphics.endFill();
                }
                else {
                    selectWindow.width = game.camera.x + game.input.activePointer.x - selectWindow.x;
                    if (selectWindow.width < 0) {
                        selectWindow.x = game.camera.x + game.input.activePointer.x;
                        selectWindow.width = -selectWindow.width;
                    }
                    selectWindow.height = game.camera.y + game.input.activePointer.y - selectWindow.y;
                    if (selectWindow.height < 0) {
                        selectWindow.y = game.camera.y + game.input.activePointer.y;
                        selectWindow.height = -selectWindow.height;
                    }
                selectedUnit = [];
                for (i = 0; i < playerUnits.children.length; i++) {
            playerUnits.children[i].tint = 0xFFFFFF;
                  if (selectWindow.contains(playerUnits.children[i].body.position.x, playerUnits.children[i].body.position.y)) {
                    playerUnits.children[i].tint = 0xFFDF00;
                    selectedUnit.push(playerUnits.children[i]);
                    selectedStructure = null;
                  }
                }
                    selectWindowFlag = false;
                    graphics.destroy();
                }
            }

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
            Structures.update(game, uiGroup, [playerStructureGroup, enemyStructureGroup, mapGroup, playerUnits, computerUnits]);
            // AI2 overlaps and updates
            AI2Updates();

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
            game.time.events.add(5000, function () {
                if (resource.type == 'tree') {
                    if (unit.lumber == 0) {
                        gatherWood.play(null, null, .3);
                        unit.lumber = RESOURCE_PER_GATHER;
                        resource.count -= RESOURCE_PER_GATHER;
                        if (resource.count <= 0)
                            resource.destroy();
                    }
                }
                else {
                    if (unit.food == 0) {
                        gatherBerry.play(null, null, .3);
                        unit.food = RESOURCE_PER_GATHER;
                        resource.count -= RESOURCE_PER_GATHER;
                        if (resource.count <= 0)
                            resource.destroy();
                    }
                }
                resource.collectFlag = true;
            }, this);
            resource.collectFlag = false;
        }
    }

    function selectUnit() {
      if (game.input.activePointer.y < CAMERA_HEIGHT-UI_HEIGHT) {
        selectionChange = true;
        selectedUnit = [];
        selectedStructure = null;
        for (i = 0; i < playerUnits.children.length; i++) {
            playerUnits.children[i].tint = 0xFFFFFF;
            if (Phaser.Rectangle.contains(playerUnits.children[i].body, this.game.input.activePointer.x + game.camera.x, this.game.input.activePointer.y + game.camera.y)) {
                playerUnits.children[i].tint = 0xFFDF00;
                selectedUnit.push(playerUnits.children[i]);
                selectedStructure = null;
            }
        }
        for (i = 0; i < playerStructureGroup.children.length; i++) {
            if (Phaser.Rectangle.contains(playerStructureGroup.children[i].body, this.game.input.activePointer.x + game.camera.x, this.game.input.activePointer.y + game.camera.y)) {
                selectedStructure = playerStructureGroup.children[i];
                selectedStructure.side = "Player's Side";
                if (selectedStructure.tint != 0x00FFFF) {
                    playerStructureGroup.children[i].tint = 0xFFDF00;
                    selectedUnit = [];
                }
                							 
            }
            else if (playerStructureGroup.children[i].tint == 0xFFDF00)
                playerStructureGroup.children[i].tint = 0xFFFFFF;
        }
        for (i = 0; i < enemyStructureGroup.children.length; i++) {
            if (Phaser.Rectangle.contains(enemyStructureGroup.children[i].body, this.game.input.activePointer.x + game.camera.x, this.game.input.activePointer.y + game.camera.y)) {
                selectedStructure = enemyStructureGroup.children[i];
                selectedStructure.side = "Enemy's Side";
                enemyStructureGroup.children[i].tint = 0xFFDF00;
                selectedUnit = [];
            }
            else if (enemyStructureGroup.children[i].tint == 0xFFDF00)
                enemyStructureGroup.children[i].tint = 0xFFFFFF;
        }
      }
    }

    function moveUnit() {
        if (selectedStructure != null || selectedUnit.length < 1) {
            return;
        }
        if (!gameOver) {
            if (this.game.input.activePointer.y > CAMERA_HEIGHT - UI_HEIGHT)
                return;
            var xOffset = game.camera.x + game.input.activePointer.x - selectedUnit[0].x;
            var yOffset = game.camera.y + game.input.activePointer.y - selectedUnit[0].y;
            for (i = 0; i < selectedUnit.length; i++) {
              if (game['destPoint' + selectedUnit[i].name]) {
                game['destPoint' + selectedUnit[i].name].kill();
              }
              if (selectedUnit[i].alive) {
                selectedUnit[i].gather = false;
                game['destPoint' + selectedUnit[i].name] = game.add.sprite(game.camera.x + game.input.activePointer.x + (i%3)*TILE_LENGTH, game.camera.y + game.input.activePointer.y + Math.floor(i/3)*TILE_LENGTH);
                game['destPoint' + selectedUnit[i].name].width = 10;
                game['destPoint' + selectedUnit[i].name].height = 10;
                game['destPoint' + selectedUnit[i].name].enableBody = true;
                game.physics.arcade.enable(game['destPoint' + selectedUnit[i].name]);
                game.physics.arcade.moveToObject(selectedUnit[i], game['destPoint' + selectedUnit[i].name], VELOCITY);
				 
            }
          }
        }
    }

    function moveCompUnit(unit, x, y) {
        if (!gameOver) {
            if (game['destPoint' + unit.name]) {
                game['destPoint' + unit.name].kill();
            }
            game['destPoint' + unit.name] = game.add.sprite(x, y);

            game['destPoint' + unit.name].width = 10;
            game['destPoint' + unit.name].height = 10;
            game['destPoint' + unit.name].enableBody = true;
            game.physics.arcade.enable(game['destPoint' + unit.name]);											 
            game.physics.arcade.moveToObject(unit, game['destPoint' + unit.name], VELOCITY);
        }
    }

    function render() {
        //game.debug(game.timer, 32, 32);
        //game.debug.text("Queued events: " + game.time.events.length, 32, 32);
        //game.debug.text("Total enemy units: " + computerUnits.length, 32, 70);
        //game.debug.text("Enemy lumber: " + enemyLumber, 32, 90);
        //game.debug.text("Enemy food: " + enemyFood, 32, 110);
        //game.debug.cameraInfo(game.camera, 32, 32);
        //game.debug.pointer(game.input.mousePointer);
    }

    function stopUnit(unit, destSprite) {
        if (( (playerUnits.getIndex(unit) > -1 &&
               playerUnits.getIndex(destSprite) > -1) ||
              (computerUnits.getIndex(unit) > -1 &&
               computerUnits.getIndex(destSprite) > -1)
            ) &&
            (unit.body.velocity.x != 0 || unit.body.velocity.y != 0 ||
             destSprite.body.velocity.x != 0 || destSprite.body.velocity.y != 0
            )
           )
            return;
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

    function healUnit(unit, structure) {
            if (unit.lumber > 0) {
                if (unit.gatherLumberSprite != null) {
                    unit.gatherLumberSprite.destroy();
                    unit.gatherLumberSprite = null;
                }
                unit.gatherLumberSprite = game.add.text(structure.x-16, structure.y-32, 'L+10');
                unit.gatherLumberSprite.fill = 'blue';
                unit.gatherLumberSprite.width = 40;
                unit.gatherLumberSprite.height = 40;
                unit.gatherLumberSprite.alpha = 0.6;
                game.time.events.add(400, function() {    
                    if (unit.gatherLumberSprite != null) {
                        unit.gatherLumberSprite.destroy();
                        unit.gatherLumberSprite = null;
                    }
                });
            }
            if (unit.food > 0) {
                if (unit.gatherFoodSprite != null) {
                    unit.gatherFoodSprite.destroy();
                    unit.gatherFoodSprite = null;
                }
                unit.gatherFoodSprite = game.add.text(structure.x+32, structure.y-32, 'F+10');
		unit.gatherFoodSprite.fill = 'red';
                unit.gatherFoodSprite.width = 40;
                unit.gatherFoodSprite.height = 40;
                unit.gatherFoodSprite.alpha = 0.6;
                game.time.events.add(400, function() {    
                    if (unit.gatherFoodSprite != null) {
                        unit.gatherFoodSprite.destroy();
                        unit.gatherFoodSprite = null;
                    }
                });
            }
            if (!unit.heal) {
                unit.healSprite = game.add.sprite(unit.x, unit.y, 'heal');
                unit.healSprite.width = 40;
                unit.healSprite.height = 40;
                unit.healSprite.alpha = 0.6;
                unit.heal = true;
                game.time.events.add(500, function() {    
                    unit.healSprite.destroy();
                    game.time.events.add(500, function() {
                        unit.heal = false;
                    });
                });
            }
            else {
                if (unit.healSprite && unit.healSprite.alpha > 0.05) {
                    unit.healSprite.alpha -= 0.05;
                }
            }
        if (unit.HP < unit.Max_HP) {
            unit.HP += Math.min(1, unit.Max_HP - unit.HP);
        }
        if (playerUnits.getIndex(unit) > -1) {
            game.resources.lumber += unit.lumber;
            game.resources.food += unit.food;
        }
        else {
            enemyLumber += unit.lumber;
            enemyFood += unit.food;
        }
        unit.lumber = 0;
        unit.food = 0;
        //console.log(unit.HP);
    }

    function unitCombat(player, enemy) {
        combatSFX.play(null, null, .3);
        if (enemy.key == 'beaver' && enemy.x > player.x)
            enemy.loadTexture('beaver-left');
        else if (enemy.key == 'beaver-left' && enemy.x < player.x)
            enemy.loadTexture('beaver');
        if (enemy.key == 'bear' && enemy.x > player.x)
            enemy.loadTexture('bear-left');
        else if (enemy.key == 'bear-left' && enemy.x < player.x)
            enemy.loadTexture('bear');
        if (!player.combat) {
            if (player.key == 'lumberjack' || player.key == 'woodsman')
                player.slash = game.add.sprite(player.x, player.y, 'attack');
            else
                player.slash = game.add.sprite(player.x, player.y, 'attack-left');
            player.slash.width = 40;
            player.slash.height = 40;
            player.combat = true;
            game.time.events.add(500, function() {
                player.slash.destroy();
                game.time.events.add(500, function() {
                    player.combat = false;
                });
            });
        }
        else {
            if (player.slash.alpha > 0.02) {
                player.slash.alpha -= 0.02;
            }
        }
        if (!enemy.combat) {
            if (enemy.key == 'beaver' || enemy.key == 'bear')
                enemy.slash = game.add.sprite(enemy.x, enemy.y, 'enemy-attack');
            else
                enemy.slash = game.add.sprite(enemy.x, enemy.y, 'enemy-attack-left');
            enemy.slash.width = 40;
            enemy.slash.height = 40;
            enemy.combat = true;
            game.time.events.add(500, function() {
                enemy.slash.destroy();
                game.time.events.add(500, function() {
                    enemy.combat = false;
                });
            });
        }
        else {
            if (enemy.slash.alpha > 0.02) {
                enemy.slash.alpha -= 0.02;
            }
        }
        if (playerUnits.getIndex(player) > -1) {
            stopUnit(player, game['destPoint' + player.name]);
        }
        if (computerUnits.getIndex(enemy) > -1) {
            stopUnit(enemy, game['destPoint' + enemy.name]);
        }
        var roll = Math.random();
        if (roll > .5)
            player.HP = player.HP - Math.max(0, (enemy.Attack - player.Defense));
        else
            enemy.HP = enemy.HP - Math.max(0,(player.Attack - enemy.Defense));
        if (player.HP < 0)
            player.destroy();
        if (enemy.HP < 0)
            enemy.destroy();
    }

    function structureDamage(player, structure){
        combatSFX.play(null, null, .3);
        Structures.damage(game, structure, player)
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
            if (x > CAMERA_WIDTH - TILE_LENGTH || rightKey.isDown) {
                game.camera.x += 10;
            }
            else if (x < TILE_LENGTH || leftKey.isDown) {
                game.camera.x -= 10;
            }

            if (y > CAMERA_HEIGHT - TILE_LENGTH / 4 || downKey.isDown) {
                game.camera.y += 10;
            }
            else if (y < TILE_LENGTH || upKey.isDown) {
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
        game.load.image('beaver-left', 'assets/units/beaver-left.png');
        game.load.image('lumberjack', 'assets/units/lumberjack.png');
        game.load.image('lumberjack-left', 'assets/units/lumberjack-left.png');
        game.load.image('bear', 'assets/units/bear.png');
        game.load.image('bear-left', 'assets/units/bear-left.png');
        game.load.image('woodsman', 'assets/units/woodsman.png');
        game.load.image('woodsman-left', 'assets/units/woodsman-left.png');
        game.load.spritesheet('explosion', 'assets/structures/exp2.png', 64, 64, 16);
        game.load.image('attack', 'assets/actions/slash-blue.png');
        game.load.image('attack-left', 'assets/actions/slash-blue-left.png');
        game.load.image('enemy-attack', 'assets/actions/slash-red.png');
        game.load.image('enemy-attack-left', 'assets/actions/slash-red-left.png');
        game.load.image('structure-attack', 'assets/actions/structure-slash.png');
        game.load.image('heal', 'assets/actions/heart.png');
    }

    function loadSounds() {
        game.load.audio('bgm', 'assets/audio/Blob-Monsters-Return.mp3');
        game.load.audio('combatSFX', 'assets/audio/combat.mp3');
        game.load.audio('gatherBerry', 'assets/audio/gatherberry.mp3');
        game.load.audio('gatherWood', 'assets/audio/gatherwood.mp3');
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
            if (tile.type == 'tree')
                tile.count = LUMBER_PER_TREE;
            else
                tile.count = FOOD_PER_BUSH;
        }
								   
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
    }


    function loadUserInterface() {
        var uiSprite;
        var uiResourceBar;
        var uiBackground = game.add.image(0, CAMERA_HEIGHT - UI_HEIGHT, 'ui-background');
        uiBackground.width = CAMERA_WIDTH;
        uiBackground.height = UI_HEIGHT;
        uiGroup.add(uiBackground);
        addingStructureGroup.inputEnableChildren = true;
        var structureSprites = ["sawmill", "sawmill"];
        var x;
        var y = CAMERA_HEIGHT - UI_HEIGHT + TILE_LENGTH;
        for (var i = 1; i < structureSprites.length; i++) {
            x = i * TILE_LENGTH + TILE_LENGTH / 2;
            uiSprite = game.add.sprite(x, y, structureSprites[i-1]);
            uiSprite.anchor.setTo(0, 0);
            uiSprite.type = 'structure';
            uiSprite.num = i;
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
        uiUnitResourceText = game.add.text(TILE_LENGTH + 1000, CAMERA_HEIGHT - UI_HEIGHT + 5, "Lumber: ");
        uiResourceText.fill = "white";
        uiUnitResourceText.fill = "white";
        uiUnitText.anchor.setTo(0, 0);
        uiSelectedUnit = game.add.sprite(TILE_LENGTH + 450, CAMERA_HEIGHT - UI_HEIGHT + 5, "lumberjack");
        uiSelectedUnit.height = 40;
        uiSelectedUnit.width = 40;
        uiUnitText.fill = "white";
        uiSelectedUnit.anchor.setTo(0, 0);
        uiResourceText.anchor.setTo(0, 0);
        uiUnitResourceText.anchor.setTo(0, 0);
        uiGroup.add(uiResourceText);
        uiGroup.add(uiUnitResourceText);
        uiGroup.add(uiUnitText);
        uiGroup.add(uiSelectedUnit);
        uiGroup.fixedToCamera = true;
    }

    function updateUIText() {
        //console.log(selectedUnit[i]);
        uiResourceText.setText("Lumber: " + game.resources.lumber + "   Food: " + game.resources.food);
        i = 0;
        if (selectedUnit[i]) {
            uiUnitText.setText("Selected Unit: " + (selectedUnit[i] && selectedUnit[i].type ? selectedUnit[i].type : "None") + "\nHealth: " + selectedUnit[i].HP + "\nAttack: " + selectedUnit[i].Attack + "\nDefense: " + selectedUnit[i].Defense);
            uiUnitResourceText.setText("Lumber: " + selectedUnit[i].lumber + "\nFood: " + selectedUnit[i].food);
            uiSelectedUnit.visible = true;
            uiSelectedUnit.loadTexture(selectedUnit[i].key, 0, false);
            if (selectionChange) {
            selectionChange = false;
            uiGroup.forEach(function(sprite) {
              if (sprite.type == 'unit') {
                if (sprite.num == 1) {
            var sawmill = game.add.sprite(sprite.position.x, sprite.position.y, 'sawmill');
            sawmill.anchor.setTo(0, 0);
            sawmill.type = 'structure';
            sawmill.num = 1;
            uiGroup.replace(sprite, sawmill);
            Structures.enableStructureCreation(
              uiGroup,
              sawmill,
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
                else if (sprite.num == 2) {
            var structure = game.add.sprite(sprite.position.x, sprite.position.y, 'sawmill');
            structure.anchor.setTo(0, 0);
            structure.type = 'structure';
            structure.num = 2;
            uiGroup.replace(sprite, structure);
            Structures.enableStructureCreation(
              uiGroup,
              structure,
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
              }
            });
            }
        }
        else if (selectedStructure) {
            uiUnitText.setText(selectedStructure.side + " HitPoints: " + selectedStructure.HP);
            uiUnitResourceText.setText("");
            uiSelectedUnit.visible = true;
            uiSelectedUnit.loadTexture(selectedStructure.key, 0, false);
            if (selectionChange) {
            selectionChange = false;
            if (selectedStructure.key == 'sawmill') {
            uiGroup.forEach(function(sprite) {
              if (sprite.type == 'structure') {
                if (sprite.num == 1) {
            lumberjack = game.add.sprite(sprite.position.x, sprite.position.y, 'lumberjack');
            lumberjack.width = 40;
            lumberjack.height = 40;
            lumberjack.anchor.setTo(0, 0);
            lumberjack.type = 'unit';
            lumberjack.num = 1;
            uiGroup.replace(sprite, lumberjack);
            lumberjack.inputEnabled = true;
            lumberjack.events.onInputDown.add(function() {
                    if (game.resources.lumber >= 10 &&
                        game.resources.food >= 10 &&
                        selectedStructure.tint != 0x00FFFF) {
                        selectedStructure.tint = 0x00FFFF;
                        var selStruct = selectedStructure;
                        game.time.events.add(8000, function() {
                            selStruct.tint = 0xFFFFFF;
                        }, this);
                        game.resources.lumber -= 10;
                        game.resources.food -= 10;
                        if (selectedStructure.position.x - TILE_LENGTH > 0)
                            spawnX = selectedStructure.position.x - TILE_LENGTH;
                        else
                            spawnX = selectedStructure.position.x + 2*TILE_LENGTH;
                        if (selectedStructure.position.y - TILE_LENGTH > 0)
                            spawnY = selectedStructure.position.y - TILE_LENGTH;
                        else
                            spawnY = selectedStructure.position.y + 2*TILE_LENGTH;
                        spawnPlayerUnit(spawnX, spawnY, 'lumberjack');
                    }
            }, this);
                }
                else if (sprite.num == 2) {
            woodsman = game.add.sprite(sprite.position.x, sprite.position.y, 'woodsman');
            woodsman.width = 40;
            woodsman.height = 40;
            woodsman.anchor.setTo(0, 0);
            woodsman.type = 'unit';
            woodsman.num = 2;
            uiGroup.replace(sprite, woodsman);
            woodsman.inputEnabled = true;
            woodsman.events.onInputDown.add(function() {
                    if (game.resources.lumber >= 10 &&
                        game.resources.food >= 10 &&
                        selectedStructure.tint != 0x00FFFF) {
                        selectedStructure.tint = 0x00FFFF;
                        var selStruct = selectedStructure;
                        game.time.events.add(5000, function() {
                            selStruct.tint = 0xFFFFFF;
                        }, this);
                        game.resources.lumber -= 10;
                        game.resources.food -= 10;
                        if (selectedStructure.position.x - TILE_LENGTH > 0)
                            spawnX = selectedStructure.position.x - TILE_LENGTH;
                        else
                            spawnX = selectedStructure.position.x + 2*TILE_LENGTH;
                        if (selectedStructure.position.y - TILE_LENGTH > 0)
                            spawnY = selectedStructure.position.y - TILE_LENGTH;
                        else
                            spawnY = selectedStructure.position.y + 2*TILE_LENGTH;
                        spawnPlayerUnit(spawnX, spawnY, 'woodsman');
                    }
            }, this);
                }
              }
            });
            }
          }
        }
        else {
            uiUnitText.setText("");
            uiUnitResourceText.setText("");
            uiSelectedUnit.visible = false;
            if (selectionChange) {
            selectionChange = false;
            uiGroup.forEach(function(sprite) {
              if (sprite.type == 'unit') {
                if (sprite.num == 1) {
            var sawmill = game.add.sprite(sprite.position.x, sprite.position.y, 'sawmill');
            sawmill.anchor.setTo(0, 0);
            sawmill.type = 'structure';
            sawmill.num = 1;
            uiGroup.replace(sprite, sawmill);
            Structures.enableStructureCreation(
              uiGroup,
              sawmill,
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
                else if (sprite.num == 2) {
            var structure = game.add.sprite(sprite.position.x, sprite.position.y, 'sawmill');
            structure.anchor.setTo(0, 0);
            structure.type = 'structure';
            structure.num = 2;
            uiGroup.replace(sprite, structure);
            Structures.enableStructureCreation(
              uiGroup,
              structure,
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
              }
            });
            }
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
        else if (playerUnitX + 2 * TILE_LENGTH < WORLD_WIDTH) {
            spawnPlayerUnit(playerUnitX + 2 * TILE_LENGTH, playerUnitY, 'woodsman');
        }
        //spawnEnemyUnit(computerUnitX, computerUnitY, 'bear');
        selectedUnit.push(playerUnits.children[0]);
    }

    function spawnPlayerUnit(x, y, type) {
        //console.log(units);
        var unitData = units[type];
        //console.log(unitData);
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
        playerUnit.food = 0;
        playerUnit.lumber = 0;
        playerUnit.gather = false;
        playerUnit.resourceType = 'tree';
        playerUnit.combat = false;
        playerUnit.heal = false;
        playerUnit.gatherLumberSprite = null;
        playerUnit.gatherFoodSprite = null;
        game.physics.arcade.enable(playerUnit);
        playerUnit.enableBody = true;
        playerUnitCount += 1;
        //console.log("spawned unit");
    }

    function spawnEnemyUnit(x, y, type) {
        //console.log(units);
        var unitData = units[type];
        //console.log(unitData);
        var enemyUnit = game.add.sprite(x, y, type);
        enemyUnit.name = "enemyUnit" + playerUnitCount;
        enemyUnit.Type = type;
        enemyUnit.width = 40; //possibly make variable based on unit file later
        enemyUnit.height = 40;//possibly make variable based on unit file later
        enemyUnit.anchor.setTo(0, 0);
        enemyUnit.HP = unitData.max_hp;
        enemyUnit.Max_HP = unitData.max_hp;
        enemyUnit.Attack = unitData.attack;
        enemyUnit.Defense = unitData.defense;
        enemyUnit.food = 0;
        enemyUnit.lumber = 0;
        enemyUnit.gather = false;
        enemyUnit.resourceType = 'tree';
        enemyUnit.combat = false;
        enemyUnit.heal = false;
        enemyUnit.gatherLumberSprite = null;
        enemyUnit.gatherFoodSprite = null;
        game.physics.arcade.enable(enemyUnit);
        enemyUnit.enableBody = true;
        enemyUnitCount += 1;
        computerUnits.add(enemyUnit);
        //console.log("spawned unit");

    }

    function collectResourceAI(unit, structureGroup) {
        //if ( !runInitialAI ) return;

        var closestResource;
        var nearestHome = structureGroup.getBottom();
        if ((unit.resourceType == 'tree' && unit.lumber == 0) ||
            (unit.resourceType == 'berry' && unit.food == 0) ) {
            
            closestResource = mapGroup.getClosestTo(nearestHome, function(resource){return resource.type == unit.resourceType;});
            moveCompUnit(unit, closestResource.body.position.x, closestResource.body.position.y);
        }
        else if ((unit.resourceType == 'tree' && unit.lumber == 10) ||
                 (unit.resourceType == 'berry' && unit.food == 10) ) {
            moveCompUnit(unit, nearestHome.body.position.x, nearestHome.body.position.y);
        }
    }

    function collectResourcesAI() {
      if ( !runInitialAI ) return;

      if (computerUnits.countLiving() > 1) {
        var closestResource;
        var compUnit1 = computerUnits.getChildAt(0);
        var compUnit2 = computerUnits.getChildAt(1);
        compUnit1.gather = true;
        compUnit1.resourceType = 'tree';
        compUnit2.gather = true;
        compUnit2.resourceType = 'berry';
        compCollectUnit1 = compUnit1;
        compCollectUnit2 = compUnit2;
      }

      if (!gameOver && runInitialAI )
        game.time.events.add(500, collectResourcesAI, this);
    }

    function spawnUnitAI() {
        var compStruct1 = enemyStructureGroup.getTop();
        if (enemyLumber >= 10 && enemyFood >= 10) {
            if (Math.floor(2 * Math.random()) == 1)
                spawnEnemyUnit(compStruct1.position.x - TILE_LENGTH, compStruct1.position.y - TILE_LENGTH, 'beaver');
            else
                spawnEnemyUnit(compStruct1.position.x - TILE_LENGTH, compStruct1.position.y - TILE_LENGTH, 'bear');
            enemyLumber -= 10;
            enemyFood -= 10;
        }

        if (!gameOver && runInitialAI) {
            if (DIFFICULTY)
                game.time.events.add(5000, spawnUnitAI, this);
            else
                game.time.events.add(9000, spawnUnitAI, this);
        }
    }

    function defendAI() {
        if ( !runInitialAI ) return;

        var compStruct1 = enemyStructureGroup.getTop();
        compDefenseUnits = compDefenseUnits.filter(function(unit) {
            return unit.alive;
        });
        if (computerUnits.countLiving() < 3) {
            compDefenseUnits = [];
        }
        else if (compDefenseUnits.length < 12) {
            computerUnits.forEachAlive(function(unit) {
                if (unit != compCollectUnit1 && unit != compCollectUnit2 &&
                    compDefenseUnits.indexOf(unit) == -1 &&
                    compAttackUnits.indexOf(unit) == -1) {
                    compDefenseUnits.push(unit);
                }
            });
        }
        xOffsetGlobal = 2*TILE_LENGTH;
        yOffsetGlobal = 2*TILE_LENGTH;
        var target = playerUnits.getClosestTo(compStruct1);
        var dist;
        if (target != null)
            dist = Phaser.Math.distance(target.x, target.y, compStruct1.x,
                                        compStruct1.y);
        else
            dist = 99999;
        var defenseNum;
        if (DIFFICULTY)
            defenseNum = compDefenseUnits.length/2;
        else
            defenseNum = compDefenseUnits.length;
        if (dist < 2*TILE_LENGTH) {            
            for (i = 0; i < defenseNum; i++) {
                moveCompUnit(compDefenseUnits[i], target.x, target.y);
            }
        }
        else {
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
        }
        if (!gameOver)
            game.time.events.add(1000, defendAI, this);
    }

    function attackAI() {
        if ( !runInitialAI ) return;

        // AI will start branching out from home base and initial home base operations will cease
        var maxAIUnitsPhase1 = 20;
        if(DIFFICULTY){
            maxAIUnitsPhase1 = 15
        }
        if (computerUnits.countLiving() > maxAIUnitsPhase1) {
            runInitialAI = false;
            computerUnits.forEachAlive(
                function(unit){
                    unit.body.velocity.x = 0;
                    unit.body.velocity.y = 0;
                }
            );
            initPhase2AI();
            return;
        }

        var compAttackUnit;
        compAttackUnits = compAttackUnits.filter(function(unit) {
            return unit.alive;
        });
        if (computerUnits.countLiving() > 17) {
          if (compDefenseUnits.length >= 16) {
            for (i = 0; i < 4; i++) {
                compAttackUnit = compDefenseUnits.shift();														  
                compAttackUnits.push(compAttackUnit);
                compDefenseUnits.unshift(compDefenseUnits.pop());	
            }
          }
          for (var j = 0; j < compAttackUnits.length; j++) {
              moveCompUnit(compAttackUnits[j], playerStructureGroup.getTop().body.position.x,
              playerStructureGroup.getTop().body.position.y);
          }
        }
        else {
            compAttackUnits = [];		   
        }
        if (!gameOver && runInitialAI)
            game.time.events.add(1000, attackAI, this);
    }


    function initPhase2AI(){
        reassignRolesAI();
        dispatchRolesAI();

        var secondsUntilPhase2Repeat = 120;
        var spawnCountPerRepeat = 1;
        if(DIFFICULTY){
            secondsUntilPhase2Repeat = 60;
            spawnCountPerRepeat = 2;
        }

        game.time.events.loop(secondsUntilPhase2Repeat * 1000, function() {
            if(computerUnits.children.length <= 30)
                spawnMoreUnitsAI(spawnCountPerRepeat);
            reassignRolesAI();
            dispatchRolesAI();
        });
    }

    /* Spawn x number of units, each from a given tree */
    // TODO: test this
    function spawnMoreUnitsAI(count){
        // choose count more units to spawn
        for (var i = 0; i < count; i++){
            // spawn additional enemy unit
            if (enemyLumber >= 10 && enemyFood >= 10) {
                var index = game.rnd.integerInRange(0, enemyStructureGroup.children.length-1);
                var x = enemyStructureGroup.children[index].position.x;
                var y = enemyStructureGroup.children[index].position.y;
                
                if (Math.floor(2 * Math.random()) == 1)
                    spawnEnemyUnit(x - TILE_LENGTH, y - TILE_LENGTH, 'beaver');
                else
                    spawnEnemyUnit(x - TILE_LENGTH, y - TILE_LENGTH, 'bear');
                enemyLumber -= 10;
                enemyFood -= 10;
            } else {
                break;
            }
        }
    }

    function reassignRolesAI(){
        var roles = ["damBuilder", "harvester", "lumber", "attacker", "defender"];
        var x =  game.rnd.integerInRange(1, 5);

        // tweak difficulty here
        var attackerCount = 0;
        var damBuilderCount = 0;
        var maxAttackers = 4;
        var maxDamBuilders = 1;
        if(DIFFICULTY){
            maxAttackers = 7;
            maxDamBuilders = 2;
        }

        computerUnits.forEachAlive(
            function(unit){
                //if(unit.key == "bear" || unit.key == "bear-left"){
                //    unit.role = "attacker";
                //} else {
                    unit.role = roles[x % 5];
                    x++;
                //}
                if(unit.role == "attacker") attackerCount++;
                if(unit.role == "damBuilder") damBuilderCount++;
                if(unit.role == "attacker" && attackerCount > maxAttackers){
                    unit.role = "harvester";
                }
                if(unit.role == "damBuilder" && damBuilderCount > maxDamBuilders){
                    unit.role = "lumber";
                }
            }
        );

        mapGroup.forEach(function(resource){
            if(resource.markedForCollection)
                resource.markedForCollection = false;
        });
    }

    var defenseLoops = [];
    function dispatchRolesAI(){
        if(defenseLoops && defenseLoops.length > 0){
            defenseLoops.forEach(function(event){
                game.time.events.remove(event);
            });
            //alert("defenseLoop");
        }

        computerUnits.forEachAlive(
            function(unit){
                if ( unit.role == "damBuilder"){
                    enemyStructureAI(unit);
                } else if ( unit.role == "harvester" ){
                    // wait a few seconds for trees to be marked
                    enemyHarvestAI(unit, "berry");
                } else if ( unit.role == "lumber" ){
                    enemyHarvestAI(unit, "tree");
                } else if ( unit.role == "attacker" ){
                    enemyAttackerAI(unit);
                } else if ( unit.role == "defender" ){
                    var loopEvent = game.time.events.loop(1000, function() {
                        enemyDefenderAI(unit);
                    });
                    defenseLoops.push(loopEvent);
                }
            }
        );
    }

    function enemyStructureAI(damBuilder){
        //var damBuilder = Structures.chooseDamBuilder(computerUnits);
        // this will be checked in subsequent iterations over computerUnits group
        damBuilders.push(damBuilder);
        Structures.moveBeaverToClosestTree(damBuilder, mapGroup, moveCompUnit);
        // in update, when beaver overlaps tree, call buildDamAI below...
    }

    /* Only called from update when one of damBuilders overlaps one of mapGroup */
    function buildDamAI(beaver, mapResource){
        if (beaver.buildingDam){
            return;
        } else if ( mapResource.key = "tree"  ){
            stopUnit(beaver, undefined);
            beaver.buildingDam = true;
            if (enemyLumber >= 50) {
                Structures.addEnemyStructure(game, mapResource, enemyStructureGroup);
                enemyLumber -= 50;
            }
        }
    }

    function checkTree(beaver, tree){
        return beaver.tree === tree;
    }

    function checkResource(unit, resource){
        return unit.resource === resource;
    }

    function checkHome(unit, home){
        return home.key == "dam";
    }

    function enemyHarvestAI(unit, resourceType){
        // unit find nearest resource
        // move to that resource
        // unit find nearest dam
        // move to dam
        // add resource points
        //unit.tint = 0x00FFFF;
        unit.resourceType  = resourceType;
        //if(unit.resourceType != "berry-bush" && unit.resourceType != "tree") alert("found it!"); // debug
        unit.harvestMode = "gather";
        harvesters.push(unit);
        unit.home = findNearestHome(unit, enemyStructureGroup);
        unit.resource = findClosestResource(unit, unit.home);
        if(unit.resource != null && unit.resource != undefined && unit.body != undefined && unit.home != undefined)
            collectResourceAI2(unit, enemyStructureGroup, unit.resource, unit.home);
    }

    function collisionResourceAI2(unit, otherSprite){
        unit.lumber = 10;
        unit.food = 10;
        if (unit.harvestMode == "gather")
            unit.harvestMode = "deliver";
        else
            unit.harvestMode = "gather";
        // pause before changing directions
        unit.body.velocity.y = 0;
        unit.body.velocity.x = 0;
        game.time.events.add(4000, function(){
            if(unit.resource != null && unit.resource != undefined && unit.body != undefined && unit.home != undefined)
                collectResourceAI2(unit, enemyStructureGroup, unit.resource, unit.home);
        });
    }

    function findClosestResource(unit, nearestHome){
        var minDist = 200; // to prevent AI units from rapidly collecting resources right next to their homes
        resource = mapGroup.getClosestTo(nearestHome, function(resource){
                var dist = Math.abs(Phaser.Point.distance(nearestHome, resource));
                return resource.key == unit.resourceType && resource.markedForDam != true && 
                    resource.markedForCollection != true &&
                    dist > minDist;
            });
        if(resource == null)
            return null;
        resource.markedForCollection = true;
        return resource;
    }

    function findNearestHome(unit, structureGroup){
        return structureGroup.getClosestTo(unit, function(structure){return structure.key = "dam";});
    }

    function collectResourceAI2(unit, structureGroup, closestResource, nearestHome){
        if (unit.harvestMode == "gather" && closestResource != null && closestResource != undefined) { // unit should have just reached home
            //closestResource.tint = 0x0000FF;
            if(closestResource.body != null && closestResource.body != undefined)
                moveCompUnit(unit, closestResource.body.position.x, closestResource.body.position.y);
        }
        else if (unit.harvestMode == "deliver" ) { // unit should have just reached resource
            if(nearestHome.body != null && nearestHome.body != undefined)
                moveCompUnit(unit, nearestHome.body.position.x, nearestHome.body.position.y);
        }
    }

    function enemyAttackerAI(unit){
        // move unit to nearest sawmill
        //unit.tint = 0xFFDF00;
        attackers.push(unit);
        unit.nearestPlayerStructure = playerStructureGroup.getClosestTo(
            unit, function(structure){
                return structure.key = "sawmill";
        });
        moveCompUnit(unit, unit.nearestPlayerStructure.body.position.x, 
            unit.nearestPlayerStructure.body.position.y);
    }

    function enemyDefenderAI(unit){
        // position unit between nearest player and nearest dam
        var nearestPlayer = playerUnits.getClosestTo(unit);
        var nearestDam = enemyStructureGroup.getClosestTo(unit);
        if(nearestPlayer == undefined || nearestDam == undefined) return;
        // find midway coordinates between the two
        var midpoint = getMidpoint(nearestPlayer.body.position.x, nearestPlayer.body.position.y,
                                    nearestDam.body.position.x, nearestDam.body.position.y);
        if(unit.body == null) return;
        // move unit to that midway point
        moveCompUnit(unit, midpoint[0], midpoint[1]);
        // repeat after so many seconds - set event as a loop?
    }

    /* Borrowed from user "Forgeable Sum" at: https://github.com/photonstorm/phaser/issues/2040
    on 8/10/2017 */
    function getMidpoint(x1, y1, x2, y2) {

        var midX = (x1 + x2) / 2;
        var midY = (y1 + y2) / 2;

        return [midX, midY];
    }

    /* TODO: finish refactoring */
    function fastResourceGather(){
        //unit.body.moves = false;
        var resourceX = closestResource.body.position.x;
        var resourceY = closestResource.body.position.y;
        var homeX = nearestHome.body.position.x;
        var homeY = nearestHome.body.position.y;
        unit.resourceTween = game.add.tween(unit).to({x:resourceX,y:resourceY},4000);
        unit.homeTween = game.add.tween(unit).to({x:homeX,y:homeY},4000);
        unit.resourceTween.chain(unit.homeTween);
        unit.homeTween.chain(unit.resourceTween);
        unit.resourceTween.start();
    }

    function AI2Updates(){
        for (var i = 0; i < damBuilders.length; i++){
            game.physics.arcade.overlap(damBuilders[i], mapGroup, buildDamAI, checkTree, this);
        }
        for (var i = 0; i < harvesters.length; i++){
            if (harvesters[i].harvestMode == "gather"){
                game.physics.arcade.overlap(harvesters[i], mapGroup, 
                collisionResourceAI2, checkResource, this);
            }
            if (harvesters[i].harvestMode == "deliver"){
                game.physics.arcade.overlap(harvesters[i], enemyStructureGroup, 
                collisionResourceAI2, checkHome, this);
            }   
        }
        for (var i = 0; i < damBuilders.length; i++){
            game.physics.arcade.overlap(damBuilders[i], mapGroup, buildDamAI, checkTree, this);
        }
        for (var i = 0; i < attackers.length; i++){
            game.physics.arcade.overlap(attackers[i], playerStructureGroup, function(){
                attackers[i].body.velocity.x = 0;
                attackers[i].body.velocity.y = 0;
            }, null, this);
        }
    }

    function initAImapBoundaryUpdates(){
        boundayCheckLoopEvent = game.time.events.loop(1000, function() {
            if(!computerUnits || computerUnits.children.length < 1)
                return;

            if(gameOver)
                game.time.events.remove(boundayCheckLoopEvent);

            computerUnits.forEach(function(unit){
                checkBoundary(unit, WORLD_WIDTH, WORLD_HEIGHT);
            });
        });
    }

    function checkBoundary(unit, width, height){
        if(unit.body.position.x > width || unit.body.position.x < 0)
            unit.body.velocity.x = -unit.body.velocity.x;

        if(unit.body.position.y > height || unit.body.position.y < 0)
            unit.body.velocity.y = -unit.body.velocity.y;
    }

function saveGame() {
        var gameState = {};
        gameState.DIFFICULTY = DIFFICULTY;
        gameState.playerStructures = {};
        gameState.playerUnits = {};
        gameState.computerUnits = {};
        gameState.computerStructures = {};
        var savePlayerStructureGroup = [];
        var savePlayerUnitsGroup = [];
        console.log(playerUnits);
        playerUnits.children.forEach(function (unit) {
            var saveUnit = {
                'HP': unit.HP,
                'Max_HP': unit.Max_HP,
                'Attack': unit.Attack,
                'Defense': unit.Defense,
                'position': unit.body.position,
                'lumber': unit.lumber,
                'food': unit.food,
                'key': unit.key,
                'gather': unit.gather,
                'resourceType': unit.resourceType,
            };
            savePlayerUnitsGroup.push(saveUnit);

        });
        var saveComputerUnitsGroup = [];
        computerUnits.children.forEach(function (unit) {
            var saveUnit = {
                'HP': unit.HP,
                'Max_HP': unit.Max_HP,
                'Attack': unit.Attack,
                'Defense': unit.Defense,
                'position': unit.body.position,
                'lumber': unit.lumber,
                'food': unit.food,
                'key': unit.key,
                'gather': unit.gather,
                'resourceType': unit.resourceType,
            };
            saveComputerUnitsGroup.push(saveUnit);

        });


        var saveMapGroup = [];
        mapGroup.children.forEach(function (tile) {
            var saveTile = {
                'position': tile.body.position,
                'key': tile.key,
                'type': tile.type,
                'width': tile.width,
                'height': tile.height,
                'count': tile.count
            };

            saveMapGroup.push(saveTile);
        });

        var savePlayerStructureGroup = [];
        playerStructureGroup.children.forEach(function (structure) {
            var savePlayerStructure = {
                'position': structure.body.position,
                'Attack': structure.Attack,
                'Defense': structure.Defense,
                'HP': structure.HP,
                'type': structure.key,
            };

            savePlayerStructureGroup.push(savePlayerStructure);
        });

        var saveEnemyStructureGroup = [];
        enemyStructureGroup.children.forEach(function (structure) {
            var saveEnemyStructure = {
                'position': structure.body.position,
                'Attack': structure.Attack,
                'Defense': structure.Defense,
                'HP': structure.HP,
                'type': structure.key,
            };

            saveEnemyStructureGroup.push(saveEnemyStructure);
        });


        gameState.playerStructuresGroup = savePlayerStructureGroup;

        gameState.enemyStructuresGroup = saveEnemyStructureGroup;
        gameState.playerUnits = savePlayerUnitsGroup;
        gameState.computerUnits = saveComputerUnitsGroup;
        gameState.mapGroup = saveMapGroup;
        var gameStateJson = JSON.stringify(gameState);
        localStorage.setItem('lumberjacksvsbeaverssave', gameStateJson);

        var gameStateJson = localStorage.getItem('lumberjacksvsbeaverssave');

        announceText = game.add.text(TILE_LENGTH + 5, CAMERA_HEIGHT - UI_HEIGHT + 5, "GAME SAVED!");

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

    function loadGame() {
        game.stage.backgroundColor = 0x22b14c;
        var gameStateJson = localStorage.getItem('lumberjacksvsbeaverssave');
        var gameState = JSON.parse(gameStateJson);
        //console.log(gameState);
        gameState.playerUnits.forEach(function (unit) {
            loadPlayerUnits(unit);
        });
        gameState.computerUnits.forEach(function (unit) {
            loadComputerUnits(unit);
        });
        gameState.mapGroup.forEach(function (tile) {
            loadMapGroup(tile);
        });
        gameState.playerStructuresGroup.forEach(function (structure) {
            loadPlayerStructures(structure);
        });
        gameState.enemyStructuresGroup.forEach(function (structure) {
            loadEnemyStructures(structure);
        });
        DIFFICULTY = gameState.DIFFICULTY;
        if (DIFFICULTY)
            mode.textContent = "Hard Mode";
        else
            mode.textContent = "Easy Mode";
        return;
    }

     function loadPlayerUnits(unit) {
        var unitData = units[unit.type];
        var playerUnit = playerUnits.create(unit.position.x, unit.position.y, unit.key);
        playerUnit.name = "playerUnit" + playerUnitCount;
        playerUnit.width = 40; //possibly make variable based on unit file later
        playerUnit.height = 40;//possibly make variable based on unit file later
        playerUnit.anchor.setTo(0, 0);
        playerUnit.HP = unit.HP;
        playerUnit.Max_HP = unit.max_hp;
        playerUnit.Attack = unit.Attack;
        playerUnit.Defense = unit.Defense;
        playerUnit.food = unit.food;
        playerUnit.lumber = unit.lumber;
        game.physics.arcade.enable(playerUnit);
        playerUnit.enableBody = true;
        playerUnit.body.position = unit.position;
        playerUnitCount += 1;
        playerUnit.checkWorldBounds = true;
        playerUnit.gather = unit.gather;
        playerUnit.resourceType = unit.resourceType;
        //console.log("spawned unit");
    }

    function loadComputerUnits(unit) {
        var unitData = units[unit.type];
        var computerUnit = computerUnits.create(unit.position.x, unit.position.y, unit.key);
        computerUnit.name = "computerUnit" + enemyUnitCount;
        computerUnit.width = 40; //possibly make variable based on unit file later
        computerUnit.height = 40;//possibly make variable based on unit file later
        computerUnit.anchor.setTo(0, 0);
        computerUnit.HP = unit.HP;
        computerUnit.Max_HP = unit.max_hp;
        computerUnit.Attack = unit.Attack;
        computerUnit.Defense = unit.Defense;
        computerUnit.food = unit.food;
        computerUnit.lumber = unit.lumber;
        game.physics.arcade.enable(computerUnit);
        computerUnit.enableBody = true;
        enemyUnitCount += 1;
        computerUnit.gather = unit.gather;
        computerUnit.resourceType = unit.resourceType;
    }

    function loadMapGroup(tile) {
        var newTile = mapGroup.create(tile.position.x, tile.position.y, tile.key);
        newTile.type = tile.type;
        newTile.width = tile.width;
        newTile.height = tile.height;
        newTile.anchor.setTo(0, 0);
        mapGroup.add(newTile);
        newTile.inputEnabled = true;
        game.physics.arcade.enable(newTile);
        newTile.collectFlag = true;
        newTile.count = tile.count;
    }

    function loadPlayerStructures(structure) {
        var newStructure = playerStructureGroup.create(structure.position.x, structure.position.y, structure.type);
        game.physics.arcade.enable(newStructure);
        newStructure.Attack = structure.Attack;
        newStructure.Defense = structure.Defense;
        newStructure.HP = structure.HP;
        newStructure.enableBody = true;
    }
    function loadEnemyStructures(structure) {
        var newStructure = enemyStructureGroup.create(structure.position.x, structure.position.y, structure.type);
        game.physics.arcade.enable(newStructure);
        newStructure.Attack = structure.Attack;
        newStructure.Defense = structure.Defense;
        newStructure.HP = structure.HP;
        newStructure.enableBody = true;
    }
};
