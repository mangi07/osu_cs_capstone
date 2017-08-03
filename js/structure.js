
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

        TILE_LENGTH: 64,
        DISTANCE_LIMIT: 96,
	HIT_POINTS: 5000,
	HIT_DEDUCTION: 5,
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
			//structure.HP = 1000000;
			structure.anchor.setTo(0, 0);
			group.add(structure);
			structure.inputEnabled = true;
      		game.physics.arcade.enable(structure);
			structure.HP = 10000;
			structure.combat = false;

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
		computerUnits,
		unitCount,
		game)
	{

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
                        var nearbyUnit = false;
                        playerUnits.forEach(function (s) {
                            var dist = Phaser.Math.distance(s.x, s.y, game.camera.x+sprite.x, game.camera.y+sprite.y); 
                            if (dist < this.DISTANCE_LIMIT)
                                nearbyUnit = true;
                        }, this);
		    if (!game.physics.arcade.overlap(selectedStructure, playerStructureGroup) &&
		    	!game.physics.arcade.overlap(selectedStructure, enemyStructureGroup) &&
		    	!game.physics.arcade.overlap(selectedStructure, mapGroup) &&
		    	!game.physics.arcade.overlap(selectedStructure, playerUnits) &&
		    	!game.physics.arcade.overlap(selectedStructure, computerUnits) &&
           nearbyUnit) 
		    // the structure will stay on the map, 
		    // resource points get deducted, and replacement sprite will pop up in the ui at the bottom.
		    {
		        sprite.input.disableDrag();
		        sprite.sendToBack();  // We want this for the game map, I think - if it's not sending behind everything and then not visible

            selectedStructure.tint = 0x00FFFF;
            selectedStructure.HP = 10000;
            selectedStructure.combat = false;
            game.time.events.add(10000, function() {
                selectedStructure.tint = 0xFFFFFF;
            }, this);
          
		        // need to compensate for any camera displacement
		        sprite.position.x += sprite.game.camera.x;
		        sprite.position.y += sprite.game.camera.y;


		        game.resources.lumber -= 5;
		        // replace resource tile
		        replacementSprite = game.add.sprite(originX, originY, sprite.key);
	            replacementSprite.anchor.setTo(0, 0);

                    replacementSprite.type = 'structure';
                    replacementSprite.num = selectedStructure.num;
                    uiGroup.remove(selectedStructure);
		    playerStructureGroup.add(selectedStructure);
	            replacementSprite.HP = Structures.HIT_POINTS;
	            uiGroup.add(replacementSprite);
	            this.enableStructureCreation(
					uiGroup,
					replacementSprite, 
					playerStructureGroup, 
					enemyStructureGroup,
					mapGroup, // trees and berry bushes
					resourcePoints,
                    playerUnits,
                    computerUnits,
                    unitCount,
					game
				);
		    }
		    else
		        // end up back in the ui at the bottom (not get placed on map)
		    {
		        sprite.position.x = originX;
		        sprite.position.y = originY;
		        //sprite.body.enable = false;
		    }

		}

	},

	// This should be called from the update function of the main game file.

	update: function(game, addingStructureGroup, otherGroups){

	    // test collision with object
	    /*
	    var overlappingStructure;
//			console.log(game);
		var overlapping = false;

		for (var i = 0; i < otherGroups.length; i++){
			for (var j = 0; j < addingStructureGroup.length; j++){
				game.physics.arcade.overlap( addingStructureGroup.children[j], otherGroups[i], overlapCallback );
			}
			if ( (! overlapping) ) {
				overlappingStructure.tint = 0xFFFFFF; // removes any tint
			}
		}

		function overlapCallback(draggedStructure, mapStructure){
		    draggedStructure.tint = 0xFF0000; // red tint
		    overlappingStructure = draggedStructure;
		    overlapping = true;
		}
		*/
		
	    for (var i = 0; i < addingStructureGroup.length; i++){
	    	addingStructure = addingStructureGroup.children[i];
	    	if ( ! game.physics.arcade.overlap(addingStructure, otherGroups[0], overlapCallback) &&
	    		! game.physics.arcade.overlap(addingStructure, otherGroups[1], overlapCallback) &&
	    		! game.physics.arcade.overlap(addingStructure, otherGroups[2], overlapCallback) &&
	    		! game.physics.arcade.overlap(addingStructure, otherGroups[3], overlapCallback) &&
	    		! game.physics.arcade.overlap(addingStructure, otherGroups[4], overlapCallback))
		        addingStructure.tint = 0xFFFFFF; // removes any tint
        if (addingStructure.type == 'structure')
            {
                        var nearbyUnit = false;
                        otherGroups[3].forEach(function (s) {
                            var dist = Phaser.Math.distance(s.x, s.y, game.camera.x+addingStructure.x, game.camera.y+addingStructure.y); 
                            if (dist < this.DISTANCE_LIMIT)
                                nearbyUnit = true;
                        }, this);
                if (!nearbyUnit)
	            addingStructure.tint = 0xFF0000;
            }
		    }

	    function overlapCallback(draggedStructure, mapStructure){
		    draggedStructure.tint = 0xFF0000; // red tint
		}
		
	},

	// can be called from game.js to stop drag-and-drop feature when game ends
	disableStructureCreation: function(uiGroup){
		for(var i = 0; i < uiGroup.children.length; i++) {
			if ( uiGroup.children[i].input )
		    	uiGroup.children[i].input.enabled = false;
		}
	},

	/* Called in update to damage the structure.
		When structure.HP reaches 0, the structure will be destroyed. */
	damage: function(game, structure){
		
		if (!structure.HP) {
			structure.HP = this.HIT_POINTS;
		}

		if (structure.HP && structure.HP > 0){
			structure.HP -= 5;
		}

		if ( (structure.HP < this.HIT_POINTS / 2) && (structure.halfDamaged == undefined) ) {
			// swap out original structure image for half destroyed equivalent
			structure.loadTexture('structure', 0, false);
			structure.halfDamaged = true;

			// show explosion?
			//game.load.spritesheet('explosion', 'assets/structures/exp2.png', 64, 64, 16);
			structure.explosion = game.add.sprite(structure.position.x, structure.position.y, 'explosion');
			structure.explosion.animations.add('explode', [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]);
			structure.explosion.animations.play('explode', 10, true);

		}
                if (structure.halfDamaged == undefined) {
                    if (!structure.combat) {
                    var slash = game.add.sprite(structure.x, structure.y, 'structure-attack');
                    slash.width = this.TILE_LENGTH;
                    slash.height = this.TILE_LENGTH;
                    structure.combat = true;
                    game.time.events.add(500, function() {
                        slash.destroy();
                        game.time.events.add(500, function() {
                            structure.combat = false;
                        });
                    });
                    }
                }

		if (structure.HP <= 0){
			if (structure.explosion) {
				structure.explosion.animations.stop(null, true);
			}
			structure.explosion.destroy();
			// remove structure from game
			structure.destroy();
		}

	}
}
