// testRunner.js
window.onload = function () {

	var WORLD_WIDTH = 1280;
	var WORLD_HEIGHT = 768;

	var game = new Phaser.Game(WORLD_WIDTH, WORLD_HEIGHT, Phaser.AUTO, '',
	      { preload: preload, create: create, update: update, render: render });

	

	function preload() {
		game.load.image('structure', '../../assets/tiles/grass.png');
		game.load.image('tree', '../../assets/tiles/tree.png');
		game.load.image('cut-tree', '../../assets/tiles/cut-tree.png');
		game.load.image('berry', '../../assets/tiles/berry-bush.png');
		game.load.image('cut-berry', '../../assets/tiles/cut-berry-bush.png');
		game.load.image('ui-background', '../../assets/tiles/sky.png');
		game.load.image('sawmill', '../../assets/structures/sawmill.png');
		game.load.image('dam', '../../assets/structures/dam.png');
		game.load.image('beaver', '../../assets/units/beaver.png');
		game.load.image('lumberjack', '../../assets/units/lumberjack.png');
		game.load.image('bear', '../../assets/units/bear.png');
		game.load.image('woodsman', '../../assets/units/woodsman.png');
	}

	function create() {
		game.physics.startSystem(Phaser.Physics.ARCADE);
    	game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

		//testDestroySprite(game);
		//testAddEnemyStructure(game, WORLD_WIDTH, WORLD_HEIGHT, 100);
	}
	function update() {
	}
	function render() {
	}

}

