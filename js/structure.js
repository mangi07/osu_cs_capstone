
function Structure(game) {
	if (!(this instanceof Structure)) {
		// the constructor was called without "new".
		return new Structure(game);
	}

	this.width = game.width;
	this.height = game.height;

}

// may be called after tile map is loaded
// requires gameUtilities.js
var Structures = {

	initStructures: function(mapGroup){

		// load sawmills and dams in different parts of the map
		GameUtilities.randomReplaceTilesWithKey(mapGroup, "grass", "sawmill", 1.2, 0);
		GameUtilities.randomReplaceTilesWithKey(mapGroup, "grass", "dam", 1.2, 1);

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