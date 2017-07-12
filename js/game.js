window.onload = function() {

  var CAMERA_WIDTH = 1024;
  var CAMERA_HEIGHT = 512;
  var WORLD_WIDTH = 2048;
  var WORLD_HEIGHT = 2048;
  var TILE_LENGTH = 64;
  var UI_HEIGHT = 3 * TILE_LENGTH;
  var mapGroup;
  var uiGroup;
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

      // TODO: swap with a call like "loadStructures"
      Structure(game).logGame();
      console.log(mapGroup);
      Structures.initStructures(mapGroup);

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

          if (x > CAMERA_WIDTH - TILE_LENGTH) {
              game.camera.x += 10;
          }
          else if (x < TILE_LENGTH) {
              game.camera.x -= 10;
          }
         
          if (y > CAMERA_HEIGHT - TILE_LENGTH) {
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
      uiGroup = game.add.group();
  }

  function loadMapTiles () {
      game.load.image('grass', 'assets/tiles/grass.png');
      game.load.image('tree', 'assets/tiles/tree.png');
      game.load.image('berry', 'assets/tiles/berry.png');
      game.load.image('sawmill', 'assets/structures/sawmill.png');
      game.load.image('dam', 'assets/structures/dam.png');
  }
  
  function loadMap () {
      var tile;
      var treeSparsityFactor = 10;
      var resourceSparsityFactor = 3;
      var treeFlag = true;

      for (var x = 0; x < game.world.width; x += TILE_LENGTH) {
          for (var y = TILE_LENGTH/2; y < game.world.height - UI_HEIGHT; y += TILE_LENGTH) {
              if (Math.floor(Math.random() * treeSparsityFactor) != 0) {
                  tile = game.add.sprite(x, y, 'grass');
              }
              else {
                  if (x < game.world.width/3 || x > game.world.width*2/3) {
                      if (treeFlag) {
                          tile = game.add.sprite(x, y, 'tree');
                          treeFlag = false;
                      }
                      else {
                          tile = game.add.sprite(x, y, 'berry');
                          treeFlag = true;
                      }
                  }
                  else {
                      if (Math.floor(Math.random() * resourceSparsityFactor) != 0) {
                          tile = game.add.sprite(x, y, 'grass');
                      }
                      else if (Math.floor(Math.random() * 2) != 0) {
                          tile = game.add.sprite(x, y, 'tree');
                      }
                      else {
                          tile = game.add.sprite(x, y, 'berry');
                      }
                  }
              }
              tile.anchor.setTo(0, 0);
              mapGroup.add(tile);
              tile.inputEnabled = true;
              tile.events.onInputUp.add(function (t) {
              }, this);
          }
      }
  }

  function loadUserInterface () {
      var uiSprite;
      var uiResourceBar;
      for (var i = 1; i <= 5; i++) {
          uiSprite = game.add.sprite(i * TILE_LENGTH, CAMERA_HEIGHT - 2 * TILE_LENGTH, 'tree');
          uiSprite.anchor.setTo(0, 0);
          uiGroup.add(uiSprite);
      }
      uiResourceText = game.add.text(5, 5, "Lumber: " + lumber + "   Food: " + food);
      uiResourceText.fill = "white";
      uiResourceText.anchor.setTo(0, 0);
      uiGroup.add(uiResourceText);
      uiGroup.fixedToCamera = true;
  }
};
