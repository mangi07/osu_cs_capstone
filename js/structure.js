
function Structure(game) {
	if (!(this instanceof Structure)) {
		// the constructor was called without "new".
		return new Structure(game);
	}

	this.width = game.width;
	this.height = game.height;

	// TODO: get rid of this test function
	this.logGame = function(){
		console.log(game);
	}

}

// may be called after tile map is loaded
// requires gameUtilities.js
var Structures = {

	initStructures: function(mapGroup){

		// TODO: change key "tree" to the actual structure key once you get image for a structure
		// TODO: get graphics for sawmill and dam
		// TODO: load sawmills and dams in different parts of the map
		GameUtilities.randomReplaceTilesWithKey(mapGroup, "grass", "sawmill", 1.2);

	}

}