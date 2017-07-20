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

    var UI_HEIGHT = 2 * TILE_LENGTH + TILE_LENGTH / 4;
    var mapGroup;
    var uiGroup;
    var gridCoordsGenerator = new GridCoordinatesGenerator(
      WORLD_WIDTH, WORLD_HEIGHT, TILE_LENGTH, TILE_HEIGHT
    );
    var playerStructureGroup;
    var enemyStructureGroup;
    var playerUnits;
    var computerUnits;
    var uiResourceText;
    var uiUnitText;
    var uiSelectedUnit;
    var lumber;
    var food;
    var gameOver;
    var bgm;
    var selectedUnit;
    var unitcount2 = 0;
    var enemyLumber;
    var enemyFood;
    var spawnX;
    var spawnY;

    var game = new Phaser.Game(CAMERA_WIDTH, CAMERA_HEIGHT, Phaser.AUTO, '',
      { preload: preload, create: create, update: update, render: render });

    function preload() {
        loadSounds();
        loadSprites();
    }

    function create() {
        bgm = game.add.audio('bgm');
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        initResourceCount();
        createGroups();
        loadMap();
        createUnits();
        initEnemyAI();

        game.input.onDown.add(moveUnit, this);
        loadUserInterface();
        gameOver = false;

        game.sound.setDecodedCallback([bgm], start, this);

        downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);

        upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    }

    function start() {
        bgm.loopFull(0.6);
    }

    function update() {
        if (!gameOver) {
            updateCameraView();
            updateUIText();
        for (var j = 0; j < mapGroup.children.length; j++) {
            if (game.physics.arcade.overlap(playerUnits, mapGroup.children[j], collectResource, null, this) == false) {
                mapGroup.children[j].alpha = 1;
            }
            game.physics.arcade.overlap(computerUnits, mapGroup.children[j], collectResource, null, this);
        }
        for (i = 0; i < playerUnits.children.length; i++) {
            game.physics.arcade.overlap(playerUnits.children[i], game['destPoint' + playerUnits.children[i].name], stopUnit, null, this);
            for (var j = 0; j < playerUnits.children.length; j++) {
                game.physics.arcade.overlap(playerUnits.children[i], playerUnits.children[j], stopUnit, null, this);
            }
            game.physics.arcade.overlap(playerUnits.children[i], playerStructureGroup, healUnit, null, this);
            game.physics.arcade.overlap(playerUnits.children[i], enemyStructureGroup, unitCombat, null, this);
        }

        for (i = 0; i < computerUnits.children.length; i++) {
            game.physics.arcade.overlap(computerUnits.children[i], game['destPoint' + computerUnits.children[i].name], stopUnit, null, this);
            for (var j = 0; j < computerUnits.children.length; j++) {
                game.physics.arcade.overlap(computerUnits.children[i], computerUnits.children[j], stopUnit, null, this);
            }
            game.physics.arcade.overlap(playerUnits.children[i], enemyStructureGroup, healUnit, null, this);
            game.physics.arcade.overlap(computerUnits.children[i], playerStructureGroup, unitCombat, null, this);
        }

        for (var i = 0; i < playerUnits.children.length; i++) {
            for (var j = 0; j < computerUnits.children.length; j++) {
                game.physics.arcade.overlap(playerUnits.children[i], computerUnits.children[j], unitCombat, null, this);
            }
        }

        }
        else {
            playerUnits.forEach(function (unit) {
                unit.body.velocity.x = 0;
                unit.body.velocity.y = 0;
            });
            computerUnits.forEach(function (unit) {
                unit.body.velocity.x = 0;
                unit.body.velocity.y = 0;
            });
        }
        checkGameOver();
    }

    function collectResource(resource, unit) {
            if (playerUnits.getIndex(unit) > -1)
                resource.alpha = 0.6;
            if (resource.collectFlag == true) {
                //console.log(enemyLumber + " " + enemyFood);
                game.time.events.add(5000, function(){
                    if (resource.type == 'tree') {
                        if (playerUnits.getIndex(unit) > -1)
                            lumber += 10;
                        else
                            enemyLumber += 10;
                    }
                    else {
                        if (playerUnits.getIndex(unit) > -1)
                            food += 10;
                        else
                            enemyFood += 10;
                    }
                    resource.collectFlag = true;
                }, this);
                resource.collectFlag = false;
            }
    }

    function moveUnit() {
      if (!gameOver) {
        if (this.game.input.activePointer.y > CAMERA_HEIGHT - UI_HEIGHT)
            return;

        for (i = 0; i < playerUnits.children.length; i++) {
            if (Phaser.Rectangle.contains(playerUnits.children[i].body, this.game.input.activePointer.x + game.camera.x, this.game.input.activePointer.y + game.camera.y)) {
                //console.log(playerUnits.children[i]);
                selectedUnit = playerUnits.children[i];
                //console.log(selectedUnit, playerUnits.children[i]);
                return;
            }
        }
/*
        for (i = 0; i < computerUnits.children.length; i++) {
            if (Phaser.Rectangle.contains(computerUnits.children[i].body, this.game.input.activePointer.x + game.camera.x, this.game.input.activePointer.y + game.camera.y)) {
                //console.log(computerUnits.children[i]);
                selectedUnit = computerUnits.children[i];
                //console.log(selectedUnit, computerUnits.children[i]);
                return;
            }
        }
*/
        //console.log(selectedUnit);
/*
        if (game['destPoint' + selectedUnit.name]) {
            game['destPoint' + selectedUnit.name].kill();
        }
*/
        game['destPoint' + selectedUnit.name] = game.add.sprite(this.game.input.activePointer.x + game.camera.x, this.game.input.activePointer.y + game.camera.y);

        game['destPoint' + selectedUnit.name].enableBody = true;
        game.physics.arcade.enable(game['destPoint' + selectedUnit.name]);
        game.physics.arcade.moveToObject(selectedUnit, game['destPoint' + selectedUnit.name], VELOCITY);
      }
    }

    function moveCompUnit() {
      if (!gameOver) {
        if (game['destPoint' + selectedUnit.name]) {
            game['destPoint' + selectedUnit.name].kill();
        }
        game['destPoint' + selectedUnit.name] = game.add.sprite(this.game.input.activePointer.x + game.camera.x, this.game.input.activePointer.y + game.camera.y);

        game['destPoint' + selectedUnit.name].enableBody = true;
        game.physics.arcade.enable(game['destPoint' + selectedUnit.name]);
        game.physics.arcade.moveToObject(selectedUnit, game['destPoint' + selectedUnit.name], VELOCITY);
      }
    }

    function render() {

        //game.debug.cameraInfo(game.camera, 32, 32);
        //game.debug.pointer(game.input.mousePointer);
    }

    function stopUnit(unit, destSprite) {
        unit.body.velocity.y = 0;
        unit.body.velocity.x = 0;
        if (destSprite != undefined && playerUnits.getIndex(destSprite) == -1
            && computerUnits.getIndex(destSprite) == -1)
            destSprite.kill();
    }

    function healUnit(unit) {
        unit.body.velocity.x = 0;
        unit.body.velocity.y = 0;
        if (unit.HP < 100000) {
            unit.HP += 50;
            console.log(unit.HP);
        }
        
    }
    function unitCombat(player, enemy) {
        stopUnit(player, game['destPoint' + player.name]);
        if (computerUnits.getIndex(enemy) > -1) {
            stopUnit(enemy, game['destPoint' + enemy.name]);
        }
        var roll = Math.random();
        //console.log(roll);
        if (roll > .5)
            player.HP = player.HP - 1000;
        else
            enemy.HP = enemy.HP - 1000;
        console.log(player.HP, enemy.HP);
        if (player.HP < 0)
            player.kill();
        if (enemy.HP < 0)
            enemy.kill();
    }

    function initResourceCount() {
        lumber = 100;
        food = 100;
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
        playerUnits = game.add.group();
        computerUnits = game.add.group();
        uiGroup = game.add.group();
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
            Structures.initStructures(
              gridCoordsGenerator,
              playerStructureGroup,
              enemyStructureGroup,
              game
            );
	/*
	borrowed from: http://www.andy-howard.com/how-to-double-click-in-phaser/index.html on 7/12/17
*/
        playerStructureGroup.forEach(function(structure) {
            structure.events.onInputDown.add(function(itemBeingClicked) {
                if (!secondClick) { 
                    secondClick = true;
                    game.time.events.add(300, function(){
                        secondClick = false;
                    }, this);
                }
                else {
                    if (lumber > 0 && food > 0) {
                        lumber -= 10;
                        food -= 10;
                        spawnX = structure.position.x - TILE_LENGTH;
                        spawnY = structure.position.y - TILE_LENGTH;
                        spawnPlayerUnit(spawnX, spawnY);
                    }
                }
	    }, this);
        });
    }


    function loadUserInterface() {
        var uiSprite;
        var uiResourceBar;
        var uiBackground = game.add.image(0, CAMERA_HEIGHT - UI_HEIGHT, 'ui-background');
        uiBackground.width = CAMERA_WIDTH;
        uiBackground.height = UI_HEIGHT;
        uiGroup.add(uiBackground);

        for (var i = 1; i <= 5; i++) {
            uiSprite = game.add.image(i * TILE_LENGTH + TILE_LENGTH / 2, CAMERA_HEIGHT - UI_HEIGHT + TILE_LENGTH + TILE_LENGTH / 2, 'structure');
            uiSprite.anchor.setTo(0.5, 0.5);
            uiGroup.add(uiSprite);
        }
        uiResourceText = game.add.text(TILE_LENGTH + 5, CAMERA_HEIGHT - UI_HEIGHT + 5, "Lumber: " + lumber + "   Food: " + food);
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
        uiResourceText.setText("Lumber: " + lumber + "   Food: " + food);
        uiUnitText.setText("Selected Unit: " + (selectedUnit && selectedUnit.type ? selectedUnit.type : "None") + "\nHitPoints: " + selectedUnit.HP);
        uiSelectedUnit.loadTexture(selectedUnit.key, 0, false);
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
        playerUnit1 = playerUnits.create(playerUnitX, playerUnitY+TILE_LENGTH, 'lumberjack');
        playerUnit2 = playerUnits.create(playerUnitX, playerUnitY-TILE_LENGTH, 'lumberjack');
        lumber1 = computerUnits.create(computerUnitX, computerUnitY+TILE_LENGTH, 'beaver');
        lumber2 = computerUnits.create(computerUnitX, computerUnitY-TILE_LENGTH, 'beaver');
        playerUnit1.HP = 100000;
        playerUnit1.type = "Lumber Jack"
        playerUnit1.name = "playerunit1";
        playerUnit2.HP = 100000;
        playerUnit2.type = "Lumber Jack"
        playerUnit2.name = "playerunit2";
        lumber1.type = "Beaver";
        lumber2.type = "Beaver";
        lumber1.name = "lumber1";
        lumber2.name = "lumber2";
        lumber1.HP = 100000;
        lumber2.HP = 100000;
        playerUnit1.width = 40;
        playerUnit1.height = 40;
        playerUnit2.width = 40;
        playerUnit2.height = 40;
        lumber1.width = 40;
        lumber1.height = 40;
        lumber2.width = 40;
        lumber2.height = 40;
        game.physics.arcade.enable(playerUnit1);
        game.physics.arcade.enable(playerUnit2);
        playerUnits.enableBody = true;
        game.physics.arcade.enable(lumber1);
        game.physics.arcade.enable(lumber2);
        unitCount = 2;
        selectedUnit = playerUnit1;
    }

    function spawnPlayerUnit(x, y) {
        var playerUnit = playerUnits.create(x, y, 'lumberjack');
        playerUnit.width = 40;
        playerUnit.height = 40;
        playerUnit.anchor.setTo(0, 0);

        playerUnit.Name = "playerUnit" + unitCount;
        playerUnit.HP = 100000;
        game.physics.arcade.enable(playerUnit);
        playerUnit.enableBody = true;
        unitCount += 1;
        console.log("spawned unit");
    }

    function spawnEnemyUnit() {
        enemyUnit = computerUnits.create(530, game.world.height - (1550 + (unitcount2 * 50)), 'beaver');
        enemyUnit.Name = "enemyUnit" + unitcount2;
        enemyUnit.width = 40;
        enemyUnit.height = 40;
        game.physics.arcade.enable(enemyUnit);
        enemyUnit.enableBody = true;
        enemyUnit.HP = 100000;
        unitcount2++;
    }

    function initEnemyAI() {
        var minDistance = 1000000;
        var tempDistance;
        var closestResource;
        var compUnit1 = computerUnits.getTop();
        var compUnit2 = computerUnits.getBottom();
            mapGroup.forEach(function(resource) {
                tempDistance = Phaser.Math.distance(compUnit1.body.position.x,
                               compUnit1.body.position.y,
                               resource.body.position.x,
                               resource.body.position.y);
                if (tempDistance < minDistance && resource.type == 'tree') {
                    minDistance = tempDistance;
                    closestResource = resource;
                }
            });
        minDistance = 1000000;
        //game.physics.arcade.moveToObject(compUnit2, closestResource, VELOCITY);
            mapGroup.forEach(function(resource) {
                tempDistance = Phaser.Math.distance(compUnit2.body.position.x,
                               compUnit2.body.position.y,
                               resource.body.position.x,
                               resource.body.position.y);
                if (tempDistance < minDistance && resource.type == 'berry') {
                    minDistance = tempDistance;
                    closestResource = resource;
                }
            });
        //game.physics.arcade.moveToObject(compUnit1, closestResource, VELOCITY);
    }
};
