var GameUtilities = {
	
	/**
	* @param {object} tileGroup - The Phaser.Group to filter
	* @param {String} key - Only tiles with this key will be returned
	* @param {Array} upperLeft - Upper left bounds in the form of [x,y]
	* @param {Array} lowerRight - Lower right bounds in the form of [x,y]
	* @returns {object} - a Phaser Group object with the given key string and bounds
	*/ 
	getTilesWithKey: function(tileGroup, key, upperLeft, lowerRight){

		var tiles = tileGroup.filter(function(child, index, children) {
			var inBounds = true;
			if (!(child.position.x >= upperLeft[0])) return false;
			if (!(child.position.y >= upperLeft[1])) return false;
			if (!(child.position.x <= lowerRight[0])) return false;
			if (!(child.position.x <= lowerRight[1])) return false;
		    return child.key == key;
		}, true);

		return tiles;

	},


	/**
	* @param {object} tileGroup - The Phaser.Group containing Sprite tiles
	* @param {String} oldKey - String referring to image resource
	* @param {String} newKey - String referring to new image resource
	* @param {Number} randomDensity - A higher density increases the chances
	* @param {Number} area - 0 for right third of map, 1 for left third of map
	* 	of more sprites being replaced.  This works well with a number 
	* 	between 1 and 2, eg: 1.2 or 1.5
	*
	* assume each new sprite has same length and width as each old sprite
	* assume each key exists
	*
	* @returns {object} - the tileGroup
	*/
	randomReplaceTilesWithKey: function(tileGroup, oldKey, newKey, randomDensity, area){

		// get game
		var game = null;
		if (tileGroup.length > 0) {
			game = tileGroup.game;
		}

		var topPadding = 32; // as laid out in game.js loadMap() inner for loop

		var upperLeft, lowerRight;
		if (area == 0) {
			upperLeft = [0, topPadding];
			lowerRight = [game.world.width/3, game.world.height];
		} else if (area == 1) {
			upperLeft = [game.world.width * 2/3, topPadding];
			lowerRight = [game.world.width, game.world.height];
		} else {
			upperLeft = [0, topPadding];
			lowerRight = [game.world.width, game.world.height];
		}
		oldTiles = this.getTilesWithKey(tileGroup, oldKey, upperLeft, lowerRight);
		

		for ( var i = 0; i < oldTiles.list.length; i++ ) {

			if (Math.floor(Math.random() * randomDensity) != 0) {
				var oldSprite = oldTiles.list[i];
				var x = oldSprite.position.x + 2;
				var y = oldSprite.position.y + 2;
				var key = oldSprite.key;

				// new sprite displayed over same location as old sprite
				var newSprite = game.add.sprite(x, y, newKey);

				tileGroup.replace(oldSprite, newSprite);
				oldSprite.destroy();	
			}	

		}

	}



}