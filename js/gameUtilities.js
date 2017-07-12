var GameUtilities = {
	
	// return a Phaser Group object with the given key string
	getTilesWithKey: function(tileGroup, key){

		var tiles = tileGroup.filter(function(child, index, children) {
		    return child.key == key;
		}, true);

		return tiles;

	},


	/**
	* @param {object} tileGroup - The Phaser.Group containing Sprite tiles
	* @param {String} oldKey - String referring to image resource
	* @param {String} newKey - String referring to new image resource
	* @param {Number} randomDensity - A higher density increases the chances 
	* 	of more sprites being replaced.  This works well with a number 
	* 	between 1 and 2, eg: 1.2 or 1.5
	*
	* assume each new sprite has same length and width as each old sprite
	* assume each key exists
	*
	* @returns {object} - the tileGroup
	*/
	randomReplaceTilesWithKey: function(tileGroup, oldKey, newKey, randomDensity){

		var oldTiles = this.getTilesWithKey(tileGroup, oldKey);

		// get game
		var game = null;
		if (oldTiles.list.length > 0) {
			game = oldTiles.list[0].game;
		}

		for ( var i = 0; i < oldTiles.list.length; i++ ) {

			if (Math.floor(Math.random() * randomDensity) != 0) {
				var oldSprite = oldTiles.list[i];
				var x = oldSprite.position.x;
				var y = oldSprite.position.y;
				var key = oldSprite.key;

				// new sprite displayed over same location as old sprite
				var newSprite = game.add.sprite(x, y, newKey);

				tileGroup.replace(oldSprite, newSprite);
				oldSprite.destroy();	
			}	

		}

	}



}