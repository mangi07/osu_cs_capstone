
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

		for ( var i = 200; i < coordsGenerator.tilesRemainingLeftThird(); i++ ) {
			var coords = coordsGenerator.getCoords(1);
			var x = coords[0];
			var y = coords[1];
	
			playerStructure = game.add.sprite(x, y, 'sawmill');
			playerStructure.anchor.setTo(0, 0);
			playerGroup.add(playerStructure);
			playerStructure.inputEnabled = true;
			game.physics.arcade.enable(playerStructure);

		}
		

		for ( var i = 200; i < coordsGenerator.tilesRemainingRightThird(); i++ ) {
			var coords = coordsGenerator.getCoords(2);
			var x = coords[0];
			var y = coords[1];
	
			enemyStructure = game.add.sprite(x, y, 'dam');
			enemyStructure.anchor.setTo(0, 0);
			enemyGroup.add(enemyStructure);
			enemyStructure.inputEnabled = true;
			game.physics.arcade.enable(enemyStructure);

		}



	},

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

	/**
	* may be used after tile map is loaded
	* @param {Object} selectedStructure - the sprite to add drag-drop functionality to
	* @param {Object} playerStructureGroup - the player's group of structures
	* @param {Object} enemyStructureGroup - the enemy's group of structures
	* @param {Object} resourcePoints - deducted when a structure sprite is placed on the map
	*   Note: In order to modify points, this parameter must be passes as an object, eg: as  
	* @param {Object} game - The main game object
	* 
	*/
	enableStructureCreation: function(
		uiGroup,
		selectedStructure, 
		playerStructureGroup, 
		enemyStructureGroup,
		mapGroup, // trees and berry bushes
		resourcePoints,
		game){

	    selectedStructure.inputEnabled = true;
	    selectedStructure.input.enableDrag();
	    selectedStructure.events.onDragStart.add(onDragStart, this);
	    selectedStructure.events.onDragStop.add(onDragStop, this);

		var originX = selectedStructure.position.x;
		var originY = selectedStructure.position.y;


		function onDragStart(sprite, pointer) {

			//sprite.body.enable = true;
		    game.physics.arcade.enable(sprite);

		}

		function onDragStop(sprite, pointer) {

		    console.log(sprite.key + " dropped at x:" + pointer.x + " y: " + pointer.y);

		    if (!game.physics.arcade.overlap(selectedStructure, playerStructureGroup) &&
		    	!game.physics.arcade.overlap(selectedStructure, enemyStructureGroup) &&
		    	!game.physics.arcade.overlap(selectedStructure, mapGroup)) 
		    // the structure will stay on the map, 
		    // resource points get deducted, and replacement sprite will pop up in the ui at the bottom.
		    {
		        console.log('input disabled on', sprite.key);
		        sprite.inputEnabled = false;

		        sprite.sendToBack();  // We want this for the game map, I think - if it's not sending behind everything and then not visible

		        uiGroup.remove(selectedStructure); // to remove from ui group so dragging is not checked on this sprite
		        playerStructureGroup.add(selectedStructure);

		        // need to compensate for any camera displacement
		        sprite.position.x += sprite.game.camera.x;
		        sprite.position.y += sprite.game.camera.y;

		        resourcePoints.lumber -= 5;

		        // replace resource tile
		        replacementSprite = game.add.sprite(originX, originY, sprite.key);
	            replacementSprite.anchor.setTo(0.5, 0.5);
	            uiGroup.add(replacementSprite);
	            this.enableStructureCreation(
					uiGroup,
					replacementSprite, 
					playerStructureGroup, 
					enemyStructureGroup,
					mapGroup, // trees and berry bushes
					resourcePoints,
					game
				);

		    }
		    else
		        // end up back in the ui at the bottom (not get placed on map)
		    {
		        console.log("NOT PLACING NEW STRUCTURE");

		        sprite.position.x = originX;
		        sprite.position.y = originY;
		        //sprite.body.enable = false;

		    }

		}

	},

	// This should be called from the update function of the main game file.
	update: function(addingStructureGroup, playerStructureGroup, enemyStructureGroup, mapGroup, game){
	    // test collision with object
	    var addingStructure;

	    for (var i = 0; i < addingStructureGroup.length; i++){
	    	addingStructure = addingStructureGroup.children[i];
	    	if ( ! game.physics.arcade.overlap(addingStructure, playerStructureGroup, overlapCallback) &&
	    		! game.physics.arcade.overlap(addingStructure, enemyStructureGroup, overlapCallback) &&
	    		! game.physics.arcade.overlap(addingStructure, mapGroup, overlapCallback))
		        addingStructure.tint = 0xFFFFFF;
		    };

	    function overlapCallback(draggedStructure, mapStructure){
		    draggedStructure.tint = 0xFF0000; // red tint
		    // 0xFFFFFF removes any tint
		}
	}
}