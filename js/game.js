window.onload = function() {

  var CAMERA_WIDTH = 1024;
  var CAMERA_HEIGHT = 512;
  var WORLD_WIDTH = 2048;
  var WORLD_HEIGHT = 2048;
  var TILE_LENGTH = 64;
  var UI_HEIGHT = 200;
  var mapGroup;
  var uiGroup;

  var game = new Phaser.Game(CAMERA_WIDTH, CAMERA_HEIGHT, Phaser.AUTO, '',
    { preload: preload, create: create, update: update, render: render });

  function preload () {

      loadMapTiles();
  }

  function create () {

      game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      createGroups();
      loadMap();
      loadUserInterface();
  }

  function update () {
    updateCameraView();
  }

  function render() {

    //game.debug.cameraInfo(game.camera, 32, 32);
    //game.debug.pointer(game.input.mousePointer);
  }

  function updateCameraView() {
      var x;
      var y;
      if (game.input.activePointer.isUp) {
          x = game.input.activePointer.position.x;
          y = game.input.activePointer.position.y;

          if (x > CAMERA_WIDTH - 50) {
              game.camera.x += 10;
          }
          else if (x < 50) {
              game.camera.x -= 10;
          }
          else if (x > CAMERA_WIDTH - 100) {
              game.camera.x += 5;
          }
          else if (x < 100) {
              game.camera.x -= 5;
          }
         
          if (y > CAMERA_HEIGHT - 50) {
              game.camera.y += 10;
          }
          else if (y < 50) {
              game.camera.y -= 10;
          }
          else if (y > CAMERA_HEIGHT - 100) {
              game.camera.y += 5;
          }
          else if (y < 100) {
              game.camera.y -= 5;
          }
      } 
  }

  function createGroups () {
      mapGroup = game.add.group();
      uiGroup = game.add.group();
  }

  function loadMapTiles () {
      game.load.image('grass', 'assets/tiles/grass.png');
      game.load.image('tree', 'assets/tiles/tree.png');
      game.load.image('berry', 'assets/tiles/berry.png');
  }
  
  function loadMap () {
      var tile;
      var treeSparsityFactor = 10;
      var resourceSparsityFactor = 3;
      var treeFlag = true;

      for (var x = 0; x < game.world.width; x += TILE_LENGTH) {
          for (var y = 0; y < game.world.height - UI_HEIGHT; y += TILE_LENGTH) {
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
      for (var i = 0; i < 5; i++) {
          uiSprite = game.add.sprite(i * TILE_LENGTH, 0, 'tree');
          uiSprite.anchor.setTo(0, 0);
          uiGroup.add(uiSprite);
      }
      uiGroup.fixedToCamera = true;
      uiGroup.cameraOffset.setTo(25, CAMERA_HEIGHT - TILE_LENGTH - 25);
  }

};
