let cursorLoc = require('./cursorLoc');

// There's only one board, so I didn't bother to make it a class.
let board = {

	width: 0, // These need to be initialized before use.
	height: 0,
	bombCount: 0,

	bombLocs: {},
	markLocs: {},
	markedBombLocs: {},
	revealedLocCount: 0,
	theBoard: [],
	displayBoard: [],
	BOMB: 'ó',
	BOMB_MARKER: 'ó',
	EMPTY: ' ',
	UNSELECTED: '_',
	LOC_WIDTH: 3,
	messageLoc: {},


	setBoardSize( w, h ) {
		this.width = w;
		this.height = h;
		cursorLoc.setBoardSize( w, h );
		cursorLoc.setLocWidth( this.LOC_WIDTH );
		this.messageLoc = { x: -1, y: h + 1 };
	},

	setBombCount( n ) {
		this.bombCount = n;
	},

	keyFor( loc = cursorLoc.current() ) {
		return `${loc.x},${loc.y}`;
	},

	generateDisplayBoard() {
		// Generate an empty display board.
		for ( let x = 0; x<this.width; x++ ) {
			this.displayBoard.push([]);
			for ( let y = 0; y<this.height; y++ ) {
				this.displayBoard[x].push(this.UNSELECTED);
			}	
		}
	},
		
	generate( initialInputLoc = cursorLoc.current() ) {
	
		// Randomize bomb locations.
		for ( let i=0; i<this.bombCount; i++ ) {
			let bombLoc = { x: initialInputLoc.x, y: initialInputLoc.y };
	
			while ( (( bombLoc.x === initialInputLoc.x ) && ( bombLoc.y === initialInputLoc.y )) 
		  		||	( this.keyFor(bombLoc) in this.bombLocs ) ) {
				bombLoc.x = Math.floor(Math.random() * Math.floor(this.width));
				bombLoc.y = Math.floor(Math.random() * Math.floor(this.height));
			}
			this.bombLocs[this.keyFor(bombLoc)] = bombLoc;
		}
	
		// Generate an empty board.
		for ( let x = 0; x<this.width; x++ ) {
			this.theBoard.push([]);
			this.displayBoard.push([]);
			for ( let y = 0; y<this.height; y++ ) {
				this.theBoard[x].push(this.EMPTY);	
				this.displayBoard[x].push(this.UNSELECTED);
			}	
		}
	
		// Put the bombs in it.
		for ( let key in this.bombLocs ) {
			this.theBoard[this.bombLocs[key].x][this.bombLocs[key].y] = this.BOMB;
		}
	
		// Fill the board.
		for ( x = 0; x<this.width; x++ ) {
			for ( y = 0; y<this.height; y++ ) {
				this.theBoard[x][y] = this.determineLocContents( {x: x, y: y} );
			}	
		}
	},

	display() {
		if ( this.displayBoard.length === 0 )
			this.generateDisplayBoard();
		for ( let y = -1; y<this.height; y++ ) {
			let boardRow = '';
			for ( let x = -1; x<this.width; x++ ) {
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
						boardRow += ` ${this.displayBoard[x][y]} `;
				}
			}	
			console.log( boardRow );
		}
		console.log('\n'); // Two rows for messages..
		process.stdout.write('\x1B[4C');
		cursorLoc.loc.x = 0;
		cursorLoc.loc.y = this.height + 2;
		cursorLoc.moveTo( {x:0, y:0});
	},

	determineLocContents( loc ) {
		if ( this.theBoard[loc.x][loc.y] === this.BOMB )
			return this.BOMB;

		let count = 0;
		for ( let x = loc.x-1; x<=loc.x+1; x++ ) {
			if (( x<0 ) || ( x>=this.width) )
				continue;
			for ( let y = loc.y-1; y<=loc.y+1; y++ ) {
				if (( y<0 ) || (y>=this.height))
					continue;
				if ( this.theBoard[x][y] === this.BOMB )
					count++;

			}	
		}
		return count === 0 ? this.EMPTY : count.toString();
	},

	getLocContents( loc =cursorLoc.current() ) {
		return( this.theBoard[loc.x][loc.y] );
	},

	displayLoc( loc = cursorLoc.current() ) {
		let holdLoc = {...loc};
		cursorLoc.moveTo( loc );
		process.stdout.write( this.displayBoard[loc.x][loc.y] );
		cursorLoc.jumpX( -1 );
		cursorLoc.moveTo( holdLoc );
	},

	revealLoc( loc = cursorLoc.current() ){
		let holdLoc = {...loc};
		this.displayBoard[loc.x][loc.y] = this.theBoard[loc.x][loc.y];
		this.displayLoc( loc );
		this.revealedLocCount++;
		if ( this.displayBoard[loc.x][loc.y] === this.EMPTY ) {

			for ( let x = loc.x-1; x<=loc.x+1; x++ ) {
				if (( x<0 ) || ( x>=this.width) )
					continue;
				for ( let y = loc.y-1; y<=loc.y+1; y++ ) {
					if (( y<0 ) || (y>=this.height))
						continue;
					if ( !this.isLocRevealed( {x:x, y:y} ) ) {
						this.revealLoc( {x:x, y:y} );
					} 
				}	
			}
		}
		cursorLoc.moveTo( holdLoc );
	},

	isLocRevealed( loc = cursorLoc.current() ) {
		return ( ( this.displayBoard[loc.x][loc.y] !== this.UNSELECTED ) &&
						 ( this.displayBoard[loc.x][loc.y] !== this.BOMB_MARKER ) );
	},

	toggleMark( loc = cursorLoc.current() ) {
		// Mark the loc.
		if ( this.displayBoard[loc.x][loc.y] === this.UNSELECTED ) {
			this.displayBoard[loc.x][loc.y] = this.BOMB_MARKER;
			this.markLocs[this.keyFor(loc)] = {...loc};
			if ( this.theBoard[loc.x][loc.y] === this.BOMB ) {
				// This is a correctly marked bomb.
				this.markedBombLocs[this.keyFor(loc)] = {...loc};
			}
		}
		// Unmark the loc.
		else {
			this.displayBoard[loc.x][loc.y] = this.UNSELECTED;
			delete this.markLocs[this.keyFor(loc)];
			delete this.markedBombLocs[this.keyFor(loc)]; // delete is still okay if this was wrongly marked.
		}
		this.displayLoc( loc );
	},

	displayMessage( msg, msgLoc ) {
		// Move the cursor to the message location,
		// print the message, then return the cursor
		// to where it was.
		let holdLoc = cursorLoc.current();
		cursorLoc.moveTo( msgLoc || this.messageLoc );
		process.stdout.write( msg );
		cursorLoc.jumpX( -msg.length );
		cursorLoc.moveTo( holdLoc );
	},

	clearMessage() {
		this.displayMessage( ' '.repeat(this.LOC_WIDTH * (this.width - 1)) );
	},

	finalMessage( msg ) {
		this.displayMessage("Thanks for playing!", {x: this.messageLoc.x, y: this.messageLoc.y + 1});
		cursorLoc.moveTo( { x: this.messageLoc.x, y: this.messageLoc.y + 1 } )
	},

	moveCursor( input ) {
		return cursorLoc.move( input );
	},

	isWinner() {
		let markedBombCount = Object.keys(this.markedBombLocs).length;
		if ( ( this.bombCount === markedBombCount ) &&
				 ( (this.revealedLocCount + this.bombCount) === (this.width * this.height) ) ) {
			return true;
		}
		return false;
	},

	isLoser() {
	  return ( this.getLocContents() === this.BOMB ); 
	},
}


module.exports = board;