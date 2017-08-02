// structure.js should be available at this point


// damage: function(game, structureGroup, structure)

function testDestroySprite (game) {

	beaver = game.add.sprite(100, 100, 'beaver');
	beaver.width = 40;
	beaver.height = 40;
	sawmillOne = game.add.sprite(500, 600, 'sawmill');
	sawmillTwo = game.add.sprite(500, 500, 'sawmill');
	sawmillThree = game.add.sprite(550, 550, 'sawmill');

	sawmillGroup = game.add.group();
	sawmillGroup.add(sawmillOne);
	sawmillGroup.add(sawmillTwo);
	sawmillGroup.add(sawmillThree);


	var sawmillCount = 0;

	sawmillGroup.forEach(function(sm){
		sawmillCount++;
	});
	console.log("Expected: There should be 3 sawmills.");
	console.log("Actual: " + sawmillCount + " sawmills counted.");

	Structures.damage(game, sawmillOne);

	// view test results
	//HIT_POINTS: 100,
	//HIT_DEDUCTION: 5,
	console.log("Structures.HIT_POINTS: " + Structures.HIT_POINTS);
	console.log("Structures.HIT_DEDUCTION: " + Structures.HIT_DEDUCTION);

	console.log("structure.HP: " + sawmillOne.HP + " should be " + 
		Structures.HIT_DEDUCTION + " less than " + Structures.HIT_POINTS);


	sawmillCount = 0;
	sawmillGroup.forEach(function(sm){
		sawmillCount++;
	});
	console.log("Expected: There should be 2 sawmills.");
	console.log("Actual: " + sawmillCount + " sawmills counted.");

	// clean up test setup
	//game.world.removeAll();
}

function testAddEnemyStructure (game, camWidth, camHeight, count) {
	// setup test environment with map objects
	var x = 0;
	var y = 0;
	var spriteWidth = 70;
	var sprite;
	var enemyLumber;
    var enemyFood;
    var STARTINGLUMBER = 100;
    var STARTINGFOOD = 100;
    var enemyResources = { enemyLumber: STARTINGLUMBER, enemyFood: STARTINGFOOD };

	var groupOne = game.add.group();
	var groupTwo = game.add.group();

	for (var i = 0; i < 10; i++) {
		sprite = game.add.sprite(i*spriteWidth, i*spriteWidth, 'dam');
		game.physics.arcade.enable(sprite);
		//groupOne.add(sprite);
	}

	for (var x = 2, y = 0; x < 12; x++, y++) {
		sprite = game.add.sprite(x*spriteWidth, y*spriteWidth, 'sawmill');
		game.physics.arcade.enable(sprite);
		//groupTwo.add(sprite);
	}

	

	//console.log("**TEST: Structures.addEnemyStructure**");

	//console.log("game state before call...");
	//console.log("groupOne count:");
	//console.log(groupOne.countLiving());
	//console.log("groupTwo count:");
	//console.log(groupTwo.countLiving());
	//console.log(game.world.countLiving());

	// call function
	for (var i = 0; i < count; i++){
		Structures.addEnemyStructure(game, game.world, enemyResources);	
	}

	//console.log("game state after call...");
	//console.log("groupOne count:");
	//console.log(groupOne.countLiving());
	//console.log("groupTwo");
	//console.log(groupTwo.countLiving());
	//console.log(game.world.countLiving());

	// clean up
	//game.world.removeAll();
}