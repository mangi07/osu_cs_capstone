window.onload = function() {

  var CAMERA_WIDTH = 1280;
  var CAMERA_HEIGHT = 640;
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
  var uiResourceText;
  var lumber;
  var food;

  var game = new Phaser.Game(CAMERA_WIDTH, CAMERA_HEIGHT, Phaser.AUTO, '',
    { preload: preload, create: create, update: update, render: render });

  function preload () {

      loadMapTiles();
  }

  function create () {

      game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      initResourceCount();
      createGroups();
      loadMap();
      loadUserInterface();
  }

  function update () {
    updateCameraView();
    updateResourceText();
  }

  function render() {

    //game.debug.cameraInfo(game.camera, 32, 32);
    //game.debug.pointer(game.input.mousePointer);
  }

  function initResourceCount () {
      lumber = 100;
      food = 100;
  }

  function updateCameraView () {
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
         
          if (y > CAMERA_HEIGHT - UI_HEIGHT - TILE_LENGTH/4 && y < CAMERA_HEIGHT - UI_HEIGHT * .5) {
              game.camera.y += 10;
          }
          else if (y < TILE_LENGTH) {
              game.camera.y -= 10;
          }
      } 
  }

  function updateResourceText () {
      uiResourceText.setText("Lumber: " + lumber + "   Food: " + food);
  }

  function createGroups () {
      mapGroup = game.add.group();
      playerStructureGroup = game.add.group();
      enemyStructureGroup = game.add.group();
      uiGroup = game.add.group();
  }

  function loadMapTiles () {
      game.load.image('structure', 'assets/tiles/grass.png');
      game.load.image('tree', 'assets/tiles/tree.png');
      game.load.image('berry', 'assets/tiles/berry.png');
      game.load.image('ui-background', 'assets/tiles/sky.png');
      game.load.image('sawmill', 'assets/structures/sawmill.png');
      game.load.image('dam', 'assets/structures/dam.png');
  }
  
  function loadMap () {
      var tile;
      var treeSparsityFactor = 10;
      var resourceSparsityFactor = 3;
      var treeFlag = true;

      game.stage.backgroundColor = 0x7a4a0f;
      for (var j = 0; j < 100; j++) {
          var coords = gridCoordsGenerator.getCoords(3);
          x = coords[0];
          y = coords[1];
          //x = Math.floor(Math.random() * game.world.width);
          //y = Math.floor(Math.random() * game.world.height);
          if (x < game.world.width/3 || x > game.world.width*2/3) {
              if (treeFlag) {
                  tile = game.add.sprite(x, y, 'tree');
                  treeFlag = false;
              }
              else {
                  tile = game.add.sprite(x, y, 'berry');
                  tile.width = TILE_LENGTH/2;
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
                  tile.width = TILE_LENGTH/2;
                  tile.height = TILE_LENGTH;
              }
          }
          tile.anchor.setTo(0, 0);
          mapGroup.add(tile);
          tile.inputEnabled = true;

          Structures.initStructures(
            gridCoordsGenerator, 
            playerStructureGroup, 
            enemyStructureGroup, 
            game
          );
      }
  }


  function loadUserInterface () {
      var uiSprite;
      var uiResourceBar;
      var uiBackground = game.add.image(0, CAMERA_HEIGHT - UI_HEIGHT, 'ui-background');
      uiBackground.width = CAMERA_WIDTH;
      uiBackground.height = UI_HEIGHT;
      uiGroup.add(uiBackground);
      
      for (var i = 1; i <= 5; i++) {
          uiSprite = game.add.image(i * TILE_LENGTH + TILE_LENGTH/2, CAMERA_HEIGHT - UI_HEIGHT + TILE_LENGTH + TILE_LENGTH/2, 'structure');
          uiSprite.anchor.setTo(0.5, 0.5);
          uiGroup.add(uiSprite);
      }
      uiResourceText = game.add.text(TILE_LENGTH + 5, CAMERA_HEIGHT - UI_HEIGHT + 5, "Lumber: " + lumber + "   Food: " + food);
      uiResourceText.fill = "white";
      uiResourceText.anchor.setTo(0, 0);
      uiGroup.add(uiResourceText);
      uiGroup.fixedToCamera = true;
  }
};
