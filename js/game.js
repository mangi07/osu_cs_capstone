window.onload = function () {

    var CAMERA_WIDTH = 1536;
    var CAMERA_HEIGHT = 768;
    var WORLD_WIDTH = 2048;
    var WORLD_HEIGHT = 2048;
    var TILE_LENGTH = 64;
    var TILE_HEIGHT = 82
    var UI_HEIGHT = 2 * TILE_LENGTH;
    var mapGroup;
    var uiGroup;
    var gridCoordsGenerator = new GridCoordinatesGenerator(
      WORLD_WIDTH, WORLD_HEIGHT, TILE_LENGTH, TILE_HEIGHT
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
    var resources = {lumber:lumber, food:food};
    var gameOver;
    var bgm;
    var selectedUnit;
    var unitcount2 = 0;


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
        }
        checkGameOver();

        for (i = 0; i < playerUnits.children.length; i++) {
            game.physics.arcade.overlap(playerUnits.children[i], game['destPoint' + playerUnits.children[i].name], stopUnit, null, this);
            game.physics.arcade.overlap(playerUnits.children[i], playerBase, healUnit, null, this);
        }

        for (i = 0; i < computerUnits.children.length; i++) {
            game.physics.arcade.overlap(computerUnits.children[i], game['destPoint' + computerUnits.children[i].name], stopUnit, null, this);
        }

        for (var i = 0; i < playerUnits.children.length; i++) {
            for (var j = 0; j < computerUnits.children.length; j++) {
                game.physics.arcade.overlap(playerUnits.children[i], computerUnits.children[j], unitCombat, null, this);
            }
        }

        if (downKey.isDown) {
            spawnPlayerUnit();
        }


        if (upKey.isDown) {
            spawnEnemyUnit();
        }

        // when placing a resource and dragging over a sprite it should not overlap, tint the dragged resource red
        Structures.update(uiGroup, playerStructureGroup, enemyStructureGroup, mapGroup, game);
    }

    function moveUnit() {
        for (i = 0; i < playerUnits.children.length; i++) {
            if (Phaser.Rectangle.contains(playerUnits.children[i].body, this.game.input.activePointer.x + game.camera.x, this.game.input.activePointer.y + game.camera.y)) {
                console.log(playerUnits.children[i]);
                selectedUnit = playerUnits.children[i];
                console.log(selectedUnit, playerUnits.children[i]);
                return;
            }
        }
        for (i = 0; i < computerUnits.children.length; i++) {
            if (Phaser.Rectangle.contains(computerUnits.children[i].body, this.game.input.activePointer.x + game.camera.x, this.game.input.activePointer.y + game.camera.y)) {
                console.log(computerUnits.children[i]);
                selectedUnit = computerUnits.children[i];
                console.log(selectedUnit, computerUnits.children[i]);
                return;
            }
        }

        console.log(selectedUnit);
        if (game['destPoint' + selectedUnit.name]) {
            game['destPoint' + selectedUnit.name].kill();
        }
        game['destPoint' + selectedUnit.name] = game.add.sprite(this.game.input.activePointer.x + game.camera.x, this.game.input.activePointer.y + game.camera.y);

        game['destPoint' + selectedUnit.name].enableBody = true;
        game.physics.arcade.enable(game['destPoint' + selectedUnit.name]);
        game.physics.arcade.moveToObject(selectedUnit, game['destPoint' + selectedUnit.name], 60);

    }
    function render() {

        //game.debug.cameraInfo(game.camera, 32, 32);
        //game.debug.pointer(game.input.mousePointer);
    }

    function stopUnit(unit, destSprite) {
        unit.body.velocity.y = 0;
        unit.body.velocity.x = 0;
        destSprite.kill();
    }

    function healUnit(unit) {
        if (unit.HP < 1000000) {
            unit.HP += 50;
            console.log(unit.HP);
        }
        
    }
    function unitCombat(player, enemy) {
        stopUnit(player, game['destPoint' + player.name]);

        stopUnit(enemy, game['destPoint' + enemy.name]);
        var roll = Math.random();
        console.log(roll);
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
        resources.lumber = lumber;
        resources.food = food;
    }

    function updateCameraView() {
        var x;
        var y;
        if (game.input.activePointer.isUp) {
            x = game.input.activePointer.position.x;
            y = game.input.activePointer.position.y;

            if (x > CAMERA_WIDTH - TILE_LENGTH && y < CAMERA_HEIGHT - UI_HEIGHT) {
                game.camera.x += 10;
            }
            else if (x < TILE_LENGTH && y < CAMERA_HEIGHT - UI_HEIGHT) {
                game.camera.x -= 10;
            }

            if (y > CAMERA_HEIGHT - UI_HEIGHT - TILE_LENGTH / 4 && y < CAMERA_HEIGHT - UI_HEIGHT * .5) {
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
        game.load.image('berry', 'assets/tiles/berry.png');
        game.load.image('ui-background', 'assets/tiles/sky.png');
        game.load.image('sawmill', 'assets/structures/sawmill.png');
        game.load.image('dam', 'assets/structures/dam.png');
        game.load.image('destPoint', 'assets/units/tree.png');
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
                }
                else {
                    tile = game.add.sprite(x, y, 'berry');
                    tile.width = TILE_LENGTH / 2;
                    tile.height = TILE_LENGTH;
                    treeFlag = true;
                }
            }
            else {
                if (Math.floor(Math.random() * 2) != 0) {
                    tile = game.add.sprite(x, y, 'tree');
                }
                else {
                    tile = game.add.sprite(x, y, 'berry');
                    tile.width = TILE_LENGTH / 2;
                    tile.height = TILE_LENGTH;
                }
            }
            tile.anchor.setTo(0, 0);
            mapGroup.add(tile);
            tile.inputEnabled = true;
            game.physics.arcade.enable(tile);

            Structures.initStructures(
              gridCoordsGenerator,
              playerStructureGroup,
              enemyStructureGroup,
              game
            );
        }
    }


    function loadUserInterface() {
        var uiSprite;
        var uiResourceBar;
        var uiBackground = game.add.image(0, CAMERA_HEIGHT - UI_HEIGHT, 'ui-background');
        uiBackground.width = CAMERA_WIDTH;
        uiBackground.height = UI_HEIGHT;
        uiGroup.add(uiBackground);

        addingStructureGroup.inputEnableChildren = true;
        var structureSprites = ["sawmill", "structure", "structure", "structure", "structure"]
        var x;
        var y = CAMERA_HEIGHT - UI_HEIGHT + TILE_LENGTH + TILE_LENGTH / 2;
        for (var i = 1; i <= structureSprites.length; i++) {
            x = i * TILE_LENGTH + TILE_LENGTH / 2;
            uiSprite = game.add.sprite(x, y, structureSprites[i-1]);
            uiSprite.anchor.setTo(0.5, 0.5);
            uiGroup.add(uiSprite);

            Structures.enableStructureCreation(
              uiGroup,
              uiSprite, 
              playerStructureGroup,
              enemyStructureGroup,
              mapGroup, 
              resources,
              game
            );

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
        uiResourceText.setText("Lumber: " + resources.lumber + "   Food: " + resources.food);
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
        playerUnit1 = playerUnits.create(770, game.world.height - 1550, 'beaver');
        playerUnit2 = playerUnits.create(32, game.world.height - 1550, 'beaver');
        lumber1 = computerUnits.create(732, game.world.height - 1955, 'lumberjack');
        lumber2 = computerUnits.create(55, game.world.height - 1955, 'lumberjack');
        playerBase = playerStructureGroup.create(32, game.world.height - 1550, 'dam');
        enemyBase = enemyStructureGroup.create(55, game.world.height - 1955, 'sawmill');
        playerUnit1.HP = 1000000;
        playerUnit1.type = "Beaver"
        playerUnit1.name = "playerunit1";
        playerUnit2.HP = 1000000;
        playerUnit2.type = "Beaver"
        playerUnit2.name = "playerunit2";
        lumber1.type = "Lumber Jack";
        lumber2.type = "Lumber Jack";
        lumber1.name = "lumber1";
        lumber2.name = "lumber2";
        lumber1.HP = 1000000;
        lumber2.HP = 1000000;
        game.physics.arcade.enable(playerBase);
        game.physics.arcade.enable(enemyBase);
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
        selectedUnit = lumber2;
    }

    function spawnPlayerUnit() {
        playerUnit = playerUnits.create(330, game.world.height - (1550 + (unitCount * 50)), 'beaver');
        playerUnit.Name = "playerUnit" + unitCount;
        playerUnit.width = 40;
        playerUnit.height = 40;
        playerUnit.HP = 1000000;
        game.physics.arcade.enable(playerUnit);
        playerUnit.enableBody = true;
        unitCount += 1;
        console.log("spawned unit");
    }

    function spawnEnemyUnit() {
        enemyUnit = computerUnits.create(530, game.world.height - (1550 + (unitcount2 * 50)), 'lumberjack');
        enemyUnit.Name = "enemyUnit" + unitcount2;
        enemyUnit.width = 40;
        enemyUnit.height = 40;
        game.physics.arcade.enable(enemyUnit);
        enemyUnit.enableBody = true;
        enemyUnit.HP = 1000000;
        unitcount2++;
    }
};
