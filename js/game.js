window.onload = function() {

  var GAME_WIDTH = 1536;
  var GAME_HEIGHT = 768;
  var TILE_LENGTH = 64;
  var mapGroup;


  var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, '', { preload: preload, create: create });

  function preload () {

      loadMapTiles();
    
  }

  function create () {

      createGroups();
      loadMap();

  }

  function update () {
  }

  function createGroups () {
      mapGroup = game.add.group();
  }

  function loadMapTiles () {
      game.load.image('grass', 'assets/tiles/grass.png');
      game.load.image('tree', 'assets/tiles/tree.png');
      game.load.image('berry', 'assets/tiles/berry.png');
  }

  function loadMap () {
      var grass;
      var tree;
      var treeSparsityFactor = 10;
      var resourceSparsityFactor = 3;
      var treeFlag = true;

      for (var x = 0; x < game.world.width; x += TILE_LENGTH) {
          for (var y = 0; y < game.world.height; y += TILE_LENGTH) {
              if (Math.floor(Math.random() * treeSparsityFactor) != 0) {
                  grass = game.add.sprite(x, y, 'grass');
                  grass.anchor.setTo(0, 0);
                  mapGroup.add(grass);
              }
              else {
                  if (x < game.world.width/3 || x > game.world.width*2/3) {
                      if (treeFlag) {
                          tree = game.add.sprite(x, y, 'tree');
                          tree.anchor.setTo(0, 0);
                          mapGroup.add(tree);
                          treeFlag = false;
                      }
                      else {
                          berry = game.add.sprite(x, y, 'berry');
                          berry.anchor.setTo(0, 0);
                          mapGroup.add(berry);
                          treeFlag = true;
                      }
                  }
                  else {
                      if (Math.floor(Math.random() * resourceSparsityFactor) != 0) {
                          grass = game.add.sprite(x, y, 'grass');
                          grass.anchor.setTo(0, 0);
                          mapGroup.add(grass);
                      }
                      else if (Math.floor(Math.random() * 2) != 0) {
                          tree = game.add.sprite(x, y, 'tree');
                          tree.anchor.setTo(0, 0);
                          mapGroup.add(tree);
                      }
                      else {
                          berry = game.add.sprite(x, y, 'berry');
                          berry.anchor.setTo(0, 0);
                          mapGroup.add(berry);
                      }
                  }
              }
          }
      }
  }

};
