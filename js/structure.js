
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
    UI_HEIGHT: 144,
    DISTANCE_LIMIT: 96,
    HIT_POINTS: 20000,
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

		for ( var i = 0; i < spriteCount; i++ ) {
			var coords = coordsGenerator.getCoords(mapArea);
			var x = coords[0];
			var y = coords[1];
			var structure = group.create(x, y, key);
			structure.Name = "Structure" + i;
			structure.anchor.setTo(0, 0);
			group.add(structure);
			structure.inputEnabled = true;
      			game.physics.arcade.enable(structure);
			structure.HP = Structures.HIT_POINTS;
            structure.Attack = 15;
            structure.Defense = 20;
			structure.combat = false;
		}
	},

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
			game.physics.arcade.enable(sprite);
		}

		function onDragStop(sprite, pointer) {
                        var nearbyUnit = false;
                        playerUnits.forEach(function (s) {
				var dist = Phaser.Math.distance(s.x, s.y, game.camera.x+sprite.x, game.camera.y+sprite.y); 
				if (dist < this.DISTANCE_LIMIT)
					nearbyUnit = true;
			}, this);
			var onMap = false;
			if (sprite.x > 0 &&
			    sprite.x < game.width - this.TILE_LENGTH &&
			    sprite.y > 0 &&
			    sprite.y < game.height - this.UI_HEIGHT - this.TILE_LENGTH)
				onMap = true;
			if (!game.physics.arcade.overlap(selectedStructure, playerStructureGroup) &&
		    	!game.physics.arcade.overlap(selectedStructure, enemyStructureGroup) &&
		    	!game.physics.arcade.overlap(selectedStructure, mapGroup) &&
		    	!game.physics.arcade.overlap(selectedStructure, playerUnits) &&
		    	!game.physics.arcade.overlap(selectedStructure, computerUnits) &&
        		nearbyUnit && onMap && game.resources.lumber >= 50) 
		    // the structure will stay on the map, 
		    // resource points get deducted, and replacement sprite will pop up in the ui at the bottom.
		    {
		        sprite.input.disableDrag();
		        sprite.sendToBack();  // We want this for the game map, I think - if it's not sending behind everything and then not visible

	            selectedStructure.tint = 0x00FFFF;
	            selectedStructure.HP = Structures.HIT_POINTS;
	            selectedStructure.Attack = 15;
	            selectedStructure.Defense = 20;
	            selectedStructure.combat = false;
	            
	            game.time.events.add(30000, function() {
	                selectedStructure.tint = 0xFFFFFF;
	            }, this);
          
		        // need to compensate for any camera displacement
				sprite.position.x += sprite.game.camera.x;
				sprite.position.y += sprite.game.camera.y;

				game.resources.lumber -= 50;

				// replace resource tile
				replacementSprite = game.add.sprite(originX, originY, sprite.key);
				replacementSprite.anchor.setTo(0, 0);
				replacementSprite.type = 'structure';
				replacementSprite.num = selectedStructure.num;

				uiGroup.remove(selectedStructure);
				playerStructureGroup.add(selectedStructure);
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
			}
		}
	},

	// This should be called from the update function of the main game file.

	update: function(game, addingStructureGroup, otherGroups){
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
                        var onMap = false;
                        if (addingStructure.x > 0 &&
                            addingStructure.x < game.width - this.TILE_LENGTH &&
                            addingStructure.y > 0 &&
                            addingStructure.y < game.height - this.UI_HEIGHT - this.TILE_LENGTH)
                            onMap = true;
                if (!nearbyUnit || !onMap || game.resources.lumber < 50)
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
	damage: function(game, structure, player){
		if (!structure.HP) {
			structure.HP = this.HIT_POINTS;
		}

		if (structure.HP && structure.HP > 0){
			structure.HP -= Math.max(0,(player.Attack - structure.Defense));
		}

		if ( (structure.HP < this.HIT_POINTS / 2) && (structure.halfDamaged == undefined) ) {
			// swap out original structure image for half destroyed equivalent
			structure.loadTexture('structure', 0, false);
			structure.halfDamaged = true;

			// show explosion
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

	},

	/* currently not used */
	chooseDamBuilder: function(computerUnits){
		var damBuilder;
        if ( computerUnits.countLiving() > 0 ){
        	//computerUnits.forEachAlive(function(unit){
        	//	if(unit.key = "beaver" && (!unit.role || unit.role != "damBuilder") )
        	//		;
        	//});
            damBuilder = computerUnits.getTop();
            return damBuilder;
        } else {
            return null;
        }
	},

	/* This will find the closest tree that is not already designated for building a dam. */
	moveBeaverToClosestTree: function(damBuilder, mapGroup, moveCompUnit){
		var closestTree = mapGroup.getClosestTo(damBuilder, function(resource){
			return resource.key == "tree" && !resource.markedForDam;
		});
		if(closestTree == null) return;
		closestTree.markedForDam = true;
		damBuilder.tree = closestTree;
		//closestTree.tint = 0x0000FF; // TODO: remove - just for debugging purposes
		moveCompUnit(damBuilder, closestTree.body.position.x, closestTree.body.position.y);
		//game.physics.arcade.moveToObject(damBuilder, closestTree, velocity);
		//damBuilder.tint = 0xFF0000; // TODO: remove tint - just for debugging purposes
	},

	addEnemyStructure: function(game, tree, enemyStructureGroup){
		// swap out for half-depleted tree and set game event to continue from this point
		tree.loadTexture('cut-tree', 0, false);
		//tree.scale.setTo(60,60);

		// get x,y for tree
		var x = tree.body.position.x;
		var y = tree.body.position.y;
		
		game.time.events.add(15000, function(){
			// destroy tree and creat dam at this x,y
			tree.destroy();
			var dam = enemyStructureGroup.create(x, y, "dam");
			game.physics.arcade.enable(dam);
			dam.HP = this.HIT_POINTS;
			dam.Defense = 2;
		}, this);
		
	},


}
