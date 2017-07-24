
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
	* @param {Number} mapArea - number passed to coordsGenerator.getCoords indicating
	*   an area of the map that coordinates are restricted to
	* @param {Number} spriteCount - the number of sprites to place on map and add to group
	* @param {Object} group - the sprite group that represents the team's structures
	* @param (String) key - the image resource with which to create the sprites
	* @param {Object} game - Phaser game object
	* 
	*/
	initStructures: function(coordsGenerator, mapArea, spriteCount, group, key, game){
		// load sawmills and dams in different parts of the map

		//GameUtilities.randomReplaceTilesWithKey(mapGroup, "grass", "sawmill", 1.2, 0); // tile map version
		//GameUtilities.randomReplaceTilesWithKey(mapGroup, "grass", "dam", 1.2, 1); // tile map version
/*
		for ( var i = 0; i < 10; i++ ) {
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
*/	

		for ( var i = 0; i < spriteCount; i++ ) {
			var coords = coordsGenerator.getCoords(mapArea);
			var x = coords[0];
			var y = coords[1];
			var structure = group.create(x, y, key);
			structure.Name = "Structure" + i;
			structure.HP = 1000000;
			structure.anchor.setTo(0, 0);
			group.add(structure);
			structure.inputEnabled = true;
      		game.physics.arcade.enable(structure);
			structure.HP = 10000;

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
		playerUnits,
		unitCount,
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

//		    console.log(sprite.key + " dropped at x:" + pointer.x + " y: " + pointer.y);

		    if (!game.physics.arcade.overlap(selectedStructure, playerStructureGroup) &&
		    	!game.physics.arcade.overlap(selectedStructure, enemyStructureGroup) &&
		    	!game.physics.arcade.overlap(selectedStructure, mapGroup)) 
		    // the structure will stay on the map, 
		    // resource points get deducted, and replacement sprite will pop up in the ui at the bottom.
		    {
//		        console.log('input disabled on', sprite.key);
		        sprite.input.disableDrag();
		        sprite.sendToBack();  // We want this for the game map, I think - if it's not sending behind everything and then not visible

		        uiGroup.remove(selectedStructure); // to remove from ui group so dragging is not checked on this sprite
		        playerStructureGroup.add(selectedStructure);
            selectedStructure.secondClick = false;
            selectedStructure.events.onInputDown.add(function(itemBeingClicked) {
                var spawnX;
                var spawnY;
                var TILE_LENGTH = 64;
                if (!selectedStructure.secondClick) { 
                    selectedStructure.secondClick = true;
                    game.time.events.add(300, function(){
                        selectedStructure.secondClick = false;
                    }, this);
                }
                else {
                        selectedStructure.secondClick = false;
                    if (game.resources.lumber > 10 && game.resources.food > 10) {
                        game.resources.lumber -= 10;
                        game.resources.food -= 10;
                        if (selectedStructure.position.x - TILE_LENGTH > 0)
                            spawnX = selectedStructure.position.x - TILE_LENGTH;
                        else
                            spawnX = selectedStructure.position.x + 2*TILE_LENGTH;
                        if (selectedStructure.position.y - TILE_LENGTH > 0)
                            spawnY = selectedStructure.position.y - TILE_LENGTH;
                        else
                            spawnY = selectedStructure.position.y + 2*TILE_LENGTH;
        var playerUnit = playerUnits.create(spawnX, spawnY, 'lumberjack');
        playerUnit.Name = "playerUnit" + unitCount;
        playerUnit.width = 40;
        playerUnit.height = 40;
        playerUnit.anchor.setTo(0, 0);

        playerUnit.Name = "playerUnit" + unitCount;
        playerUnit.HP = 100000;
        game.physics.arcade.enable(playerUnit);
        playerUnit.enableBody = true;
        unitCount += 1;
                    }
                }
	    }, this);
		        // need to compensate for any camera displacement
		        sprite.position.x += sprite.game.camera.x;
		        sprite.position.y += sprite.game.camera.y;

		        game.resources.lumber -= 5;

		        // replace resource tile
		        replacementSprite = game.add.sprite(originX, originY, sprite.key);
	            replacementSprite.anchor.setTo(0, 0);
	            uiGroup.add(replacementSprite);
	            this.enableStructureCreation(
					uiGroup,
					replacementSprite, 
					playerStructureGroup, 
					enemyStructureGroup,
					mapGroup, // trees and berry bushes
					resourcePoints,
                                        playerUnits,
                                        unitCount,
					game
				);

		    }
		    else
		        // end up back in the ui at the bottom (not get placed on map)
		    {
//		        console.log("NOT PLACING NEW STRUCTURE");

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
//			console.log(game);
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
	},

	// can be called from game.js to stop drag-and-drop feature when game ends
	disableStructureCreation: function(uiGroup){
		for(var i = 0; i < uiGroup.children.length; i++) {
		    uiGroup.children[i].input.enabled = false;
		}
	}
}
