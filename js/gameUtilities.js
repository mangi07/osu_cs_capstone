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

};

/**
* @param {Number} gameWidth - The width of the game map
* @param {Number} gameHeight - The height of the game map
* @param {Number} tileWidth - The width that a map sprite must fit in
* @param {Number} tileHeight - The width that a map sprite must fit in
*
* This helper class provides a unique pair of coordinates for each sprite placed
* on the map so they will not collide, as long as the sprite is within
* the dimensions of tileWidth x tileHeight.
* 
* It divides the game map into a grid to avoid collisions.
* 
* An object must be created from this class and getCoordinates must be 
* called on the object in order to return a unique pair of coordinates
* each time.
*/
function GridCoordinatesGenerator(gameWidth, gameHeight, tileWidth, tileHeight){

	var tilesAcross = Math.floor(gameWidth / tileWidth);
	var tilesDown = Math.floor(gameHeight / tileHeight);

	var arrayLength = tilesAcross * tilesDown;

	var tileArray = [];
	for (var x = 0; x < arrayLength; x++) {
		tileArray.push(x);
	}

	var index;
	var leftIndex = Math.floor( arrayLength / 3 );
	var rightIndex = Math.floor( arrayLength * 2/3 );
	var xCoord, yCoord;
	var tileNumber;

	var PLAYER_SIDE = 1;
	var ENEMY_SIDE = 2;
	var WHOLE_MAP = 3;

	var _useRandomIndex = function(area) {
		if( area == PLAYER_SIDE ) {
			index = Math.floor( Math.random() * leftIndex );
			leftIndex--;
			rightIndex--;

		} else if( area == ENEMY_SIDE ) {
			index = Math.floor( Math.random() * (tileArray.length - rightIndex) + rightIndex );

		} else if( area == WHOLE_MAP ) {
			index = Math.floor(Math.random() * tileArray.length);
			rightIndex--;
			//console.log(index);
		}
	}

	this.getCoords = function(mapArea) {
		if( tileArray.length < 1 ) return;
		_useRandomIndex(mapArea);
		tileNumber = tileArray[index];
		xCoord = Math.floor(tileNumber / tilesDown) * tileWidth;
		yCoord = (tileNumber % tilesDown) * tileHeight;
		tileArray.splice( index, 1 );
		return [xCoord, yCoord];
	}

/*
	this.getCoordinatesLeftThird = function() {
		if( tileArray.length < 1 ) return;
		_useRandomIndex( PLAYER_SIDE );
		tileNumber = tileArray[index];
		return _getCoords();
	}

	this.getCoordinatesRightThird = function() {
		if( tileArray.length < 1 ) return;
		_useRandomIndex(ENEMY_SIDE);
		tileNumber = tileArray[index];
		return _getCoords();
	}
*/
	this.getTileArray = function() {
		return tileArray;
	}

	this.tilesRemainingLeftThird = function() {
		if (tileArray.length < 1) return 0;
		return leftIndex + 1;
	}

	this.tilesRemainingRightThird = function() {
		if (tileArray.length < 1) return 0;
		return tileArray.length - rightIndex + 1;
	}

}


/* UNUSED - MAY BECOME OBSOLETE */
function separateOverlappingTreesBerryBushes(newSprite, mapGroup){

	mapGroup.enableBody = true;
	mapGroup.physicsBodyType = Phaser.Physics.ARCADE;

	var oldX = newSprite.position.x;
	var oldY = newSprite.position.y;
	game.physics.arcade.collide(newSprite, mapGroup);
	//game.physics.arcade.overlap(newSprite, mapGroup, collisionHandler);

	// TODO: test with above variables
	if (oldX != newSprite.position.x || oldY != newSprite.position.y){
		console.log("*********************************");
		console.log("THEY ARE DIFFERENT: ");
		console.log("old x, y:" + oldX + ", " + oldY);
		console.log("new x, y:" + newSprite.position.x + ", " + newSprite.position.y);
		console.log("*********************************");
	} else {
		console.log("*********************************");
		console.log("THEY ARE THE SAME: ");
		console.log("old x, y:" + oldX + ", " + oldY);
		console.log("new x, y:" + newSprite.position.x + ", " + newSprite.position.y);
		console.log("*********************************");
	}


	function collisionHandler(newSprite, mapGroupSprite){
		//newSprite.kill();
		//mapGroupSprite.kill();
		console.log("collision detected");
		// TODO: test with moving the sprite to the middle of the map
		newSprite.position.x = 0;
		newSprite.position.y = 0;
		//game.add.sprite(0,0,'sawmill');
		return true;
	}

}
