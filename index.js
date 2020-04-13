let rl = require('readline-sync');
console.log("");
console.log("\x1B[4mMinesweeper\x1B[0m");
console.log("");
console.log("WASD or OKL; or 8456 to move the cursor");
console.log("[SPACE] to reveal a location");
console.log("B to mark a location as having a bomb");
console.log("Q to quit");

let boardWidth = 30, boardHeight = 16;
let bombCount = 50;
let bombLocs = [];
let board = [];
let displayBoard = [];
const BOMB = 'B';
const EMPTY = ' ';
const UNSELECTED = '_';
let selectedX, selectedY;
let initialLoc = true;

let cursorLoc = {x:0, y:0};

function runGame() {

	printBoard();
	process.stdout.write('\033[4C\033[16A');
				
	while ( true ) {

		//let input = rl.question('Enter a location to reveal as X,Y:');
		let input = rl.keyIn( '',{hideEchoBack: true, mask: null});
		if ( moveCursor(input) )
			continue;
		switch (input.toLowerCase()) {
			case 'b':
				continue;
		}
		if ( input === 'q')
			break;
		if ( ! /^[0-9]+,[0-9]+$/.test(input)) {
			console.log("Provide a location as X,Y");
			continue;
		}
	  let values = input.split(',');
	  if ( ( values[0] <= 0 ) || ( values[0] > boardWidth ) ||
	    	 ( values[1] <= 0 ) || ( values[1] > boardHeight ) ) {
	  	console.log( `Your location must be between 1,1 and ${boardWidth},${boardHeight}` );
	  	continue;
	  }
	  selectedX = values[0] - 1;
	  selectedY = values[1] - 1;
	  if ( displayBoard[selectedX][selectedY] !== UNSELECTED ) {
	  	console.log("You already selected that location. Try a different one.");
	  	continue;
	  }
	
	  // The user's location is valid, so play it.
	  if ( initialLoc ) {
	  	initialLoc = false;
	  	generateBoard(selectedX,selectedY);
	  }


	  if ( board[selectedX][selectedY] === BOMB ) {
	  	console.log("KABOOM!!!!! You found a bomb, and unfortunately, are now dead.");
	  	break;
	  }
	
	  displayLoc( selectedX, selectedY );
		printBoard();
	
	}
	console.log("Thanks for playing!");
}

function moveCursor( input ) {
	let moved = false;
	switch ( input.toLowerCase() ) {
		// up
		case '8':
		case 'w':
		case 'o':
				if ( cursorLoc.y > 0 ) {
					cursorLoc.y--;
					process.stdout.write('\033[A');
				}
				moved = true;
				break;
		//left
		case '4':
		case 'a':
		case 'k':
				if ( cursorLoc.x > 0 ) {
					cursorLoc.x--;
					process.stdout.write('\033[3D');
				}	
				moved = true;
				break;
		// down
		case '2':
		case '5':
		case 's':
		case 'l':
				if ( cursorLoc.y < boardHeight-1 ) {
					cursorLoc.y++;
					process.stdout.write('\033[B');
				}	
				moved = true;
				break;
		// right
		case '6':
		case ';':
		case 'd':
				if ( cursorLoc.x < boardWidth-1 ) {
					cursorLoc.x++;
					process.stdout.write('\033[3C');
				}	
				moved = true;
				break;
	}
	return moved;
}

function displayLoc( xLoc, yLoc ){
	displayBoard[xLoc][yLoc] = board[xLoc][yLoc];
	if ( displayBoard[xLoc][yLoc] === EMPTY ) {

		for ( let x = xLoc-1; x<=xLoc+1; x++ ) {
			if (( x<0 ) || ( x>=boardWidth) )
				continue;
			for ( let y = yLoc-1; y<=yLoc+1; y++ ) {
				if (( y<0 ) || (y>=boardHeight))
					continue;
				if ( ( displayBoard[x][y] === UNSELECTED ) && ( board[x][y] === EMPTY ) ) {
					displayLoc( x, y );
				} 
			}	
		}
	}
}

function printBoard() {
	for ( let y = -1; y<boardHeight; y++ ) {
		let boardRow = '';
		for ( let x = -1; x<boardWidth; x++ ) {
			if ( y === -1 ) {
				if ( x === -1 )
					boardRow += '   ';
				else
					boardRow += ( x < 9 ) ? ` ${x+1} ` : `${x+1} `;
			}
			else {
				if ( x === -1 ) 
					boardRow += ( y < 9 ) ? ` ${y+1} ` : `${y+1} `;
				else
					boardRow += ` ${displayBoard[x][y]} `;
			}
		}	
		console.log( boardRow );
	}
}


function generateBoard( initialX, initialY ) {

	// Randomize bomb locations.
	for ( let i=0; i<bombCount; i++ ) {
		let bombLocX = initialX;
		let bombLocY = initialY;

		while ( ( bombLocX === initialX ) && ( bombLocY === initialY ) ) {
			bombLocX = Math.floor(Math.random() * Math.floor(boardWidth));
			bombLocY = Math.floor(Math.random() * Math.floor(boardHeight));
		}
		bombLocs.push( { x:bombLocX, y:bombLocY} );
	}

	// Generate an empty board.
	for ( let x = 0; x<boardWidth; x++ ) {
		board.push([]);
		displayBoard.push([]);
		for ( let y = 0; y<boardHeight; y++ ) {
			board[x].push(EMPTY);	
			displayBoard[x].push(UNSELECTED);
		}	
	}

	// Put the bombs in it.
	for ( let i=0; i<bombCount; i++ ) {
		board[bombLocs[i].x][bombLocs[i].y] = BOMB;
	}

	// Fill the board.
	for ( x = 0; x<boardWidth; x++ ) {
		for ( y = 0; y<boardHeight; y++ ) {
			board[x][y] = determineLocContents( x, y );
		}	
	}

}


function determineLocContents( xLoc, yLoc ) {
	if ( board[xLoc][yLoc] === BOMB )
		return BOMB;

	let count = 0;
	for ( let x = xLoc-1; x<=xLoc+1; x++ ) {
		if (( x<0 ) || ( x>=boardWidth) )
			continue;
		for ( let y = yLoc-1; y<=yLoc+1; y++ ) {
			if (( y<0 ) || (y>=boardHeight))
				continue;
			if ( board[x][y] === BOMB )
				count++;

		}	
	}
	return count === 0 ? EMPTY : count.toString();
}

generateBoard();
runGame();