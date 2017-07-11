README

Data about Structures:

There are two types of structures in the simple version of the game:
(1) Enemy structure: Beaver's Dam
(2) Player's structure: Lumberjack's Sawmill

Each structure must be built on an open space.

The game will provide a user interface for the player to select a structure type and place a new
structure onto a target map location. Building a new structure will require a certain amount of
Wood resource points.

************
Enhanced game structures:

Team Beaver Structures:
Dam - Store Wood/Produce Beavers (Must be placed on River tiles, preferably near Tree tiles)
Lodge - Store Food/Produce Bears (Should be placed near Berry Bush tiles)
Treehouse - Produce Porcupines

Team Lumberjack Structures:
Sawmill - Store Wood/Produce Lumberjacks (Should be placed near Tree tiles)
Cabin - Store Food/Produce Woodcutters (Should be placed near some Berry Bush tiles)
Tent - Produce Axe Throwers

************
JSON data files:

structures: an array of structures and their types
structure:
	type: Dam or Sawmill (or Lodge, Treehouse, Cabin, or Tent)
	coord: {x, y}
	damage: a number between 0 and 10, 10 being completely damaged
	cost: the number of Wood resource point needed to produce this structure
