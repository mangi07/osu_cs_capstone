window.onload = function() {

  var GAME_WIDTH = 1536;
  var GAME_HEIGHT = 768;
  var TILE_LENGTH = 64;
  var mapGroup;
  var playerUnits;
  var computerUnits;
  var destinationPoints;
  var unit;
  var unitCount; 
  var selectedUnit;
  var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, '', { preload: preload, create: create, update: update });
  var destPoints = [];
  function preload () {
    loadMapTiles();
    loadSprites();
  }

  function create () {
      game.physics.startSystem(Phaser.Physics.ARCADE);
      createGroups();
      loadMap();
      createUnits();
      game.input.onDown.add(moveUnit, this);
      downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);

      upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
  }

  function moveUnit(){
    console.log(playerUnits);
    for (i = 0; i < playerUnits.children.length; i++){
        if( Phaser.Rectangle.contains(playerUnits.children[i].body, this.game.input.x, this.game.input.y) ){
            console.log(playerUnits.children[i]);
            selectedUnit = playerUnits.children[i];
            console.log(selectedUnit, playerUnits.children[i]);
        break;
    }
        }
        if (game['destPoint'+selectedUnit.name])
            game['destPoint'+selectedUnit.name].kill();
        game['destPoint'+selectedUnit.name] = game.add.sprite(game.input.x, game.input.y, 'destPoint');
        
    game['destPoint'+selectedUnit.name].enableBody = true;
        game.physics.arcade.enable(game['destPoint'+selectedUnit.name]);
        game.physics.arcade.moveToObject(selectedUnit, game['destPoint'+selectedUnit.name], 60);

    }
  

  function stopUnit(unit, destSprite){
    unit.body.velocity.y = 0;
    unit.body.velocity.x = 0;
    destSprite.kill();
  }
  
  function unitCombat(player, enemy){
      stopUnit(player, game['destPoint'+player.name]);

      stopUnit(enemy, game['destPoint'+enemy.name]);
    var roll = Math.random();
    console.log(roll);
    if  (roll > .5)
        player.HP = player.HP - 1000;
    else
        enemy.HP = enemy.HP - 1000;
    console.log(player.HP, enemy.HP);
    if (player.HP < 0) 
        player.kill();
    if (enemy.HP < 0) 
        enemy.kill();
  }
  function update () {
    for (i = 0; i < playerUnits.children.length; i++){
    game.physics.arcade.overlap(playerUnits.children[i], game['destPoint'+playerUnits.children[i].name], stopUnit, null, this);

}

    for (var i = 0; i < playerUnits.children.length; i++){
        for (var j = 0; j < computerUnits.children.length; j++){
    game.physics.arcade.overlap(playerUnits.children[i], computerUnits.children[j], unitCombat, null, this);
        }
}

if (downKey.isDown)
    {
        spawnPlayerUnit();
    }
  

if (upKey.isDown)
{
    spawnEnemyUnit();
}
  }
  function createGroups () {
      mapGroup = game.add.group();
      playerUnits = game.add.group();
      computerUnits = game.add.group();
      destinationPoints = game.add.group();
      playerStructures = game.add.group();
      enemyStructures = game.add.group();
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

  function loadSprites () {
    game.load.image('destPoint', 'assets/units/tree.png');
    game.load.image('beaver', 'assets/units/beaver.png');
	game.load.image('lumberjack', 'assets/units/lumberjack.png');
    game.load.image('beaverdam', 'assets/structures/house.png');
  }

  function createUnits(){
    
    playerUnit1 = playerUnits.create(770, game.world.height - 150, 'beaver');
	playerUnit2 =  playerUnits.create(32, game.world.height - 150, 'beaver');
	lumber = computerUnits.create(732, game.world.height - 555, 'lumberjack');
	lumber2 = computerUnits.create(55, game.world.height - 555, 'lumberjack');
    playerBase = playerStructures.create(700, game.world.height - 100, 'beaverdam');
    enemyBase = enemyStructures.create(700, game.world.height - 780, 'beaverdam');
    playerUnit1.HP = 1000000;
    playerUnit2.HP = 1000000;
    lumber.HP = 1000000;
    lumber2.HP = 1000000;
    game.physics.arcade.enable(playerBase);
    game.physics.arcade.enable(enemyBase);
    playerUnit1.width=40;
	playerUnit1.height=40;
	playerUnit2.width=40;
	playerUnit2.height=40;
	lumber.width=40;
	lumber.height=40;
	lumber2.width=40;
	lumber2.height=40;
    game.physics.arcade.enable(playerUnit1);
	
    game.physics.arcade.enable(playerUnit2);
    playerUnits.enableBody = true;
	game.physics.arcade.enable(lumber);
    game.physics.arcade.enable(lumber2);
    unitCount = 2;
  }

  function spawnPlayerUnit(){
    playerUnit = playerUnits.create(770 + (unitCount * 15), game.world.height - 150 + (unitCount*15), 'beaver');
    playerUnit.Name = "playerUnit" + unitCount;
    playerUnit.width=40;
	playerUnit.height=40;
    playerUnit.HP = 10000;

    game.physics.arcade.enable(playerUnit);
    playerUnit.enableBody = true;
    unitCount += 1;
    console.log("spawned unit");
  }

    function spawnEnemyUnit(){
    enemyUnit = computerUnits.create(770 + (unitCount * 15), game.world.height - 150 + (unitCount*15), 'lumberjack');
    enemyUnit.Name = "enemyUnit" + unitCount;
    enemyUnit.width=40;
	enemyUnit.height=40;

    game.physics.arcade.enable(enemyUnit);
    enemyUnit.enableBody = true;
    enemyUnit.HP = 10000;
    unitCount++;
  }
};
