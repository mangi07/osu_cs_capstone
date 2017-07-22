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
    var resources = {lumber:STARTINGLUMBER, food:STARTINGFOOD};
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
    var stop = true;
    var units = {};
    var beaverData;
    var lumberjackData;
    var type = "beaver";
    loadJSON(type, (function(response) {
  // Parse JSON string into object
    units[type] = JSON.parse(response);
 }));

    var type = "lumberjack";
    loadJSON(type, (function(response) {
  // Parse JSON string into object
    units[type] = JSON.parse(response);
 }));

console.log(units);
   
//     console.log(beaverData);
// var xmlhttp = new XMLHttpRequest();
// xmlhttp.onreadystatechange = function() {
//     if (this.readyState == 4 && this.status == 200) {
//         console.log(this.responseText)
//         beaverData = JSON.parse(this.responseText);
//         console.log(beaverData);
//     }
// };
// xmlhttp.open("GET", "assets/units/beaver.json", true);
// xmlhttp.send(); 


//     var unitsLoaded = false;
//     while (!unitsLoaded){
//         console.log
//         if (beaverData && lumberjackData)
//         {
//             unitsLoaded = true;
//         }
// }
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
        
        createUnits();
        initEnemyAI();
        game.input.mousePointer.leftButton.onDown.add(selectUnit, this);

this.game.input.mousePointer.rightButton.onDown.add(moveUnit, this)
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
        // when placing a resource and dragging over a sprite it should not overlap, tint the dragged resource red
        Structures.update(uiGroup, playerStructureGroup, enemyStructureGroup, mapGroup, game);
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
            Structures.disableStructureCreation(uiGroup);
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

function selectUnit(){
            console.log(selectedUnit);
            console.log(selectedStructure);
            for (i = 0; i < playerUnits.children.length; i++) {
                playerUnits.children[i].tint = 0xFFFFFF;
            if (Phaser.Rectangle.contains(playerUnits.children[i].body, this.game.input.activePointer.x + game.camera.x, this.game.input.activePointer.y + game.camera.y)) {
                playerUnits.children[i].tint = 0xFF0000;
                selectedUnit = playerUnits.children[i];
                console.log(playerUnits.children[i]);
                selectedStructure = null;
            }
            }
            for (i = 0; i < playerStructureGroup.children.length; i++) {
                console.log(playerStructureGroup);
            if (Phaser.Rectangle.contains(playerStructureGroup.children[i].body, this.game.input.activePointer.x + game.camera.x, this.game.input.activePointer.y + game.camera.y)) {
                selectedStructure = playerStructureGroup.children[i];
                if (selectedUnit){
                    selectedUnit.alpha = 1;
                }
                selectedUnit = null;
                return;
            }
        }
}

    function moveUnit() {
    if (selectedStructure != null){
        return;
    }
    console.log(game.input);
      if (!gameOver) {
        if (this.game.input.activePointer.y > CAMERA_HEIGHT - UI_HEIGHT)
            return;





        //console.log(selectedUnit);

        if (game['destPoint' + selectedUnit.name]) {
            game['destPoint' + selectedUnit.name].kill();
        }
        game['destPoint' + selectedUnit.name] = game.add.sprite(this.game.input.activePointer.x + game.camera.x, this.game.input.activePointer.y + game.camera.y);

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
        unit.body.velocity.y = 0;
        unit.body.velocity.x = 0;
        if (destSprite != undefined) {
            if (playerUnits.getIndex(destSprite) == -1 &&
                computerUnits.getIndex(destSprite) == -1) {
                destSprite.kill();
            }
            else {
                if (destSprite.body.velocity.x == 0 &&
                    destSprite.body.velocity.y == 0) {
                    if (unit.body.position.y < destSprite.body.position.y) {
                        unit.body.position.y -= TILE_LENGTH/8;
                        destSprite.body.position.y += TILE_LENGTH/8;
                    }
                    else {
                        unit.body.position.y += TILE_LENGTH/8;
                        destSprite.body.position.y -= TILE_LENGTH/8;
                    }
                }
            }
        }
    }

    function healUnit(unit) {
        unit.body.velocity.x = 0;
        unit.body.velocity.y = 0;
        if (unit.HP < 100000) {
            unit.HP += 50;
        }
            //console.log(unit.HP);
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
        
        game.resources = {lumber:STARTINGLUMBER, food:STARTINGFOOD};
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
	/*
	borrowed from: http://www.andy-howard.com/how-to-double-click-in-phaser/index.html on 7/12/17
*/
        playerStructureGroup.forEach(function(structure) {
            structure.HP = 100000;
            structure.events.onInputDown.add(function(itemBeingClicked) {
                if (!secondClick) { 
                    secondClick = true;
                    game.time.events.add(300, function(){
                        secondClick = false;
                    }, this);
                }
                else {
                    if (game.resources.lumber > 0 && game.resources.food > 0) {
                        game.resources.lumber -= 10;
                        game.resources.food -= 10;
                        spawnX = structure.position.x - TILE_LENGTH;
                        spawnY = structure.position.y - TILE_LENGTH;
                        spawnPlayerUnit(spawnX, spawnY);
                    }
                }
	    }, this);
        playerStructureGroup.enableBody = true;
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
        if (selectedUnit){
            uiUnitText.setText("Selected Unit: " + (selectedUnit && selectedUnit.type ? selectedUnit.type : "None") + "\nHitPoints: " + selectedUnit.HP);
             uiSelectedUnit.loadTexture(selectedUnit.key, 0, false);
    }
        else if (selectedStructure){
            uiUnitText.setText("HitPoints: " + selectedStructure.HP);
                     uiSelectedUnit.loadTexture(selectedStructure.key, 0, false);}
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
        console.log(beaverData);
        console.log(lumberjackData);
        var playerUnitX = playerStructureGroup.getTop().position.x;
        var playerUnitY = playerStructureGroup.getTop().position.y;
        var computerUnitX = enemyStructureGroup.getTop().position.x;
        var computerUnitY = enemyStructureGroup.getTop().position.y;
        if (playerUnitY + 2 * TILE_LENGTH < WORLD_HEIGHT - UI_HEIGHT) {
            playerUnit1 = playerUnits.create(playerUnitX, playerUnitY+2*TILE_LENGTH, 'lumberjack');
        }
        else if (playerUnitX + 2 * TILE_LENGTH < WORLD_WIDTH) {
            playerUnit1 = playerUnits.create(playerUnitX+2*TILE_LENGTH, playerUnitY, 'lumberjack');
        }
        else if (playerUnitX - 2 * TILE_LENGTH > 0) {
            playerUnit1 = playerUnits.create(playerUnitX-2*TILE_LENGTH, playerUnitY, 'lumberjack');
        }
        if (playerUnitY - 2 * TILE_LENGTH > 0) {
            playerUnit2 = playerUnits.create(playerUnitX, playerUnitY-2*TILE_LENGTH, 'lumberjack');
        }
        else if (playerUnitX - 2 * TILE_LENGTH > 0) {
            playerUnit2 = playerUnits.create(playerUnitX-2*TILE_LENGTH, playerUnitY, 'lumberjack');
        }
        else if (playerUnitX + 2 * TILE_LENGTH > WORLD_WIDTH) {
            playerUnit2 = playerUnits.create(playerUnitX+2*TILE_LENGTH, playerUnitY, 'lumberjack');
        }
        lumber1 = computerUnits.create(computerUnitX, computerUnitY+2*TILE_LENGTH, 'beaver');
        lumber2 = computerUnits.create(computerUnitX, computerUnitY-2*TILE_LENGTH, 'beaver');
        playerUnit1.HP = 100000;
        playerUnit1.type = "Lumber Jack";
        playerUnit1.name = "playerunit1";
        playerUnit2.HP = 100000;
        playerUnit2.type = "Lumber Jack";
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
        
        selectedUnit = playerUnit1;
    }

    function spawnPlayerUnit(x, y, type) {
        
        var playerUnit = playerUnits.create(x, y, 'lumberjack');
        playerUnit.Name = "playerUnit" + playerUnitCount;
        playerUnit.width = 40;
        playerUnit.height = 40;
        playerUnit.anchor.setTo(0, 0);

        playerUnit.HP = 100000;
        game.physics.arcade.enable(playerUnit);
        playerUnit.enableBody = true;
        playerUnitCount += 1;
        console.log("spawned unit");
    }

    function spawnEnemyUnit(x, y) {
        var enemyUnit = computerUnits.create(x, y, 'beaver');
        enemyUnit.Name = "enemyUnit" + enemyUnitCount;
        enemyUnit.width = 40;
        enemyUnit.height = 40;
        game.physics.arcade.enable(enemyUnit);
        enemyUnit.enableBody = true;
        enemyUnit.HP = 100000;
        enemyUnitCount++;
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
                if (tempDistance < minDistance &&
                    resource.body.position.x > compUnit1.body.position.x &&
                    resource.type == 'tree') {
                    minDistance = tempDistance;
                    closestResource = resource;
                }
            });
        moveCompUnit(compUnit2, closestResource.body.position.x, closestResource.body.position.y);
        minDistance = 1000000;
            mapGroup.forEach(function(resource) {
                tempDistance = Phaser.Math.distance(compUnit2.body.position.x,
                               compUnit2.body.position.y,
                               resource.body.position.x,
                               resource.body.position.y);
                if (tempDistance < minDistance &&
                    resource.body.position.x < compUnit2.body.position.x &&
                    resource.type == 'berry') {
                    minDistance = tempDistance;
                    closestResource = resource;
                }
            });
        moveCompUnit(compUnit1, closestResource.body.position.x, closestResource.body.position.y);
        var compStruct1 = enemyStructureGroup.getTop();
        spawnEnemyUnit(compStruct1.position.x - TILE_LENGTH, compStruct1.position.y - TILE_LENGTH);
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
