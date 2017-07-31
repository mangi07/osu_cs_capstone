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
}