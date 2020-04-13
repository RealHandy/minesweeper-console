
// There's only one cursorLoc, so I didn't bother to make it a class.
let cursorLoc = {
	loc: {x: 0, y: 0},
	boardWidth: 0, // These need to be initialized before use.
	boardHeight: 0,
	locWidth: 0,

	setBoardSize( w, h ) {
		this.boardWidth = w;
		this.boardHeight = h;
	},

	setLocWidth( w ) {
		this.locWidth = w;
	},

	current() {
		return( {...this.loc} );
	},

	// Jump moves the cursor without updating the x,y position.
	// Should be a private function, except that displayMessage()
	// needs it, and I didn't move message display logic
	// into cursorLoc.
	jumpX( n ) {
		if ( n === 0 )
			return;
		if ( n > 0 )
			process.stdout.write('\x1B[' + n + 'C');
		else
			process.stdout.write('\x1B[' + -n + 'D');
	},
	jumpY( n ) {
		if ( n === 0 ) 
			return;
		if ( n > 0 )
			process.stdout.write('\x1B[' + n + 'B');
		else
			process.stdout.write('\x1B[' + -n + 'A');
	},

	moveTo( loc ) {
		if ( (loc.x !== this.loc.x) || (loc.y !== this.loc.y) ) {
			this.jumpX( this.locWidth*(loc.x - this.loc.x) );
			this.jumpY( loc.y - this.loc.y );
			this.loc = {...loc};
		}	
	},

	move( input ) {
		let moved = false;
		switch ( input.toLowerCase() ) {
			// up
			case '8':
			case 'w':
			case 'o':
					if ( this.loc.y > 0 ) {
						this.loc.y--;
						this.jumpY( -1 );
					}
					moved = true;
					break;
			//left
			case '4':
			case 'a':
			case 'k':
					if ( this.loc.x > 0 ) {
						this.loc.x--;
						this.jumpX( -this.locWidth );
					}	
					moved = true;
					break;
			// down
			case '2':
			case '5':
			case 's':
			case 'l':
					if ( this.loc.y < this.boardHeight-1 ) {
						this.loc.y++;
						this.jumpY( 1 );
					}	
					moved = true;
					break;
			// right
			case '6':
			case ';':
			case 'd':
					if ( this.loc.x < this.boardWidth-1 ) {
						this.loc.x++;
						this.jumpX( this.locWidth );
					}	
					moved = true;
					break;
		}
		return moved;
	}
}

module.exports = cursorLoc;