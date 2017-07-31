// testRunner.js
window.onload = function () {

	var CAMERA_WIDTH = 1280;
	var CAMERA_HEIGHT = 768;

	var game = new Phaser.Game(CAMERA_WIDTH, CAMERA_HEIGHT, Phaser.AUTO, '',
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
		testDestroySprite(game);
	}
	function update() {}
	function render() {}

}

