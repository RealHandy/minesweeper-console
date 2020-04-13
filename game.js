let rl = require('readline-sync');

let board = require('./board');

console.log("");
console.log("\x1B[4mMinesweeper\x1B[0m");
console.log("");
console.log("WASD or OKL; or 8456 to move the cursor");
console.log("[SPACE] to reveal a location");
console.log("B to mark/unmark a location as having bomb");
console.log("Q to quit\n");

function runGame() {

	let defaultWidth = 30, defaultHeight = 16;
	let minSize = 5, maxSize = 99;
	let boardWidth = 0, boardHeight = 0;
	let bombCount = 0;
	let initialLoc = true;
	let gameStartTime = null;

	let errorMsg = `Provide a width and height X,Y (from ${minSize} to ${maxSize} for each)`;
	

	while ( boardWidth === 0 ) {
		let input = rl.question(`What width and height of game board do you want? [${defaultWidth},${defaultHeight}]:`);
		if ( input.length === 0 ) {
			boardWidth = defaultWidth;
			boardHeight = defaultHeight;
		}
		else if ( input.toLowerCase() === 'q' ) {
			return;
		}
		else if ( ! /^[0-9]+,[0-9]+$/.test(input)) {
			console.log( errorMsg );			
		}
		else {
  		let values = input.split(',');
  		if ( ( values[0] < minSize ) || ( values[0] > maxSize ) ||
    		 ( values[1] < minSize ) || ( values[1] > maxSize ) ) {
  			console.log( errorMsg );
  			continue;
  		}
  		// If I don't explicitly convert values to Number, it moves the cursor
  		// to the top of the console window???.
  		boardWidth = Number( values[0] );
  		boardHeight = Number( values[1] ); 		
  	}	
  }

  let defaultBombCount = Math.floor((boardWidth * boardHeight)/10);
  let minBombs = 1;
  let maxBombs = (boardWidth * boardHeight) - 1;
	errorMsg = `Provide a number from ${minBombs} to ${maxBombs}`;
	while ( bombCount === 0 ) {
		let input = rl.question(`How many bombs do you want on the board? [${defaultBombCount}]:`);
		if ( input.length === 0 ) {
			bombCount = defaultBombCount;
  	}
		else if ( input.toLowerCase() === 'q' ) {
			return;
		}
		else if ( ! /^[0-9]+$/.test(input)) {
			console.log( errorMsg );
		}
		else {
  		if ( ( input < minBombs ) || ( input > maxBombs ) ) {
  			console.log( errorMsg );
  			continue;
  		}
  		bombCount = Number(input);
  	}	
  }

  console.log('');

	board.setBoardSize( boardWidth, boardHeight );
	board.setBombCount( bombCount );
	board.display();

	gameStartTime = Date.now();
				
	while ( true ) {

		let input = rl.keyIn( '',{hideEchoBack: true, mask: null});

		board.clearMessage();

		if ( input.toLowerCase() === 'q') {
			board.displayMessage("Are you sure you want to quit? (Y/N)");
			let isAnswered = false;
			while ( !isAnswered ) {
				input = rl.keyIn( '',{hideEchoBack: true, mask: null}).toLowerCase();
				isAnswered = ( input === 'y' ) || ( input === 'n' );
			}
			if ( input === 'y' )
				break;
			board.clearMessage();
		}	

		// Move the cursor. Returns false if the input is not a cursor move key.
		else if ( board.moveCursor(input) )
			continue;

		// Mark a loc as having a bomb in it.
		else if ( input.toLowerCase() === 'b' ) {
	  	if ( board.isLocRevealed() ) {
	  		board.displayMessage("You can only mark unrevealed locations. Try something else.");
	  		continue;
	  	}

	  	board.toggleMark();	
		}

		// Reveal a loc.
		else if ( input === ' ') {

	  	if ( board.isLocRevealed() ) {
	  		board.displayMessage("You already selected that location. Try a different one.");
	  		continue;
	  	}	
	
	  	// The user's location is valid, so play it.
	  	if ( initialLoc ) {
	  		initialLoc = false;
	  		board.generate();
	  	}

		  board.revealLoc();

	  	if ( board.isLoser() ) {
	  		board.displayMessage("KABOOM!!!!! You found a bomb, and unfortunately, are now dead.");
	  		break;
	  	}
	  }		

  	if ( board.isWinner() ) {
  		board.displayMessage(`You won!! Your time was ${Math.floor((Date.now() - gameStartTime)/1000)} seconds.`);
  		break;
  	}
	}
	board.finalMessage("Thanks for playing!");
}

runGame();