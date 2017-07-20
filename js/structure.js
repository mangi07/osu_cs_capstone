
/* THIS MAY BECOME OBSOLETE */
function Structure(game) {
	if (!(this instanceof Structure)) {
		// the constructor was called without "new".
		return new Structure(game);
	}

	this.width = game.width;
	this.height = game.height;

}

/* Performs various operations related to structures */
var Structures = {

	/**
	* may be used after tile map is loaded
	* requires gameUtilities.js
	* @param {Object} coordsGenerator - takes a GridCoordinatesGenerator object
	*   (see gameUtilities.js)
	* @param {Object} playerGroup - the sprite group that represents the player's structures
	* @param {Object} enemyGroup - the sprite group that represents the enemy's structures
	* @param {Object} game - Phaser game object
	* 
	*/
	initStructures: function(coordsGenerator, playerGroup, enemyGroup, game){

		// load sawmills and dams in different parts of the map

		//GameUtilities.randomReplaceTilesWithKey(mapGroup, "grass", "sawmill", 1.2, 0); // tile map version
		//GameUtilities.randomReplaceTilesWithKey(mapGroup, "grass", "dam", 1.2, 1); // tile map version

		for ( var i = 0; i < 1; i++ ) {
			var coords = coordsGenerator.getCoords(1);
			var x = coords[0];
			var y = coords[1];
	
			playerStructure = game.add.sprite(x, y, 'sawmill');
			playerStructure.anchor.setTo(0, 0);
			playerGroup.add(playerStructure);
			playerStructure.inputEnabled = true;
                        game.physics.arcade.enable(playerStructure);
			playerStructure.HP = 10000;

		}
		

		for ( var i = 0; i < 1; i++ ) {
			var coords = coordsGenerator.getCoords(2);
			var x = coords[0];
			var y = coords[1];
	
			enemyStructure = game.add.sprite(x, y, 'dam');
			enemyStructure.anchor.setTo(0, 0);
			enemyGroup.add(enemyStructure);
			enemyStructure.inputEnabled = true;
                        game.physics.arcade.enable(enemyStructure);
			enemyStructure.HP = 10000;

		}



	}

	// TODO: make grass tiles double-clickable for (pop-up?) choice of structure
	// TODO: replace grass tile with chosen structure
	/*
	borrowed from: http://www.andy-howard.com/how-to-double-click-in-phaser/index.html on 7/12/17

	this.yourButton.events.onInputDown.add(this.confirmDoubleClick, this);

	confirmDoubleClick: function(itemBeingClicked) {
	if (!this.secondClick) { 
	this.secondClick = true;
	this.time.events.add(300, function(){
	this.secondClick = false;
	},this);
	return;
	} 

	console.log ("Then this code gets actioned as a result of your double click.");
	} 

	*/


}
