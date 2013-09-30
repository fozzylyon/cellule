define( function ( require ) {
	'use strict';

	var bean  = require( 'bean' );
	var Paper = require( 'paper' );

	var Cell = function ( options ) {
		options = options || {};

		var minSpeed            = 1000;
		var maxSpeed            = 2000;
		var maxStrength         = 100;
		var sizeToStrengthRatio = 4 / maxStrength;
		var minSight            = 10;
		var maxSight            = 300;
		var colors              = [ '#EFEFEF', '#FF6348', '#F2CB05', '#49F09F', '#52B0ED' ];
		var minSize             = 2;

		// Non-inherited attributes
		this.id         = this._generateUid();
		this.age        = 0;
		this.energy     = options.energy || 100;

		this.gender     = Math.random() < 0.5 ? 'male' : 'female';
		this.offspring  = 0;
		this.nextMating = 50 || options.nextMating;

		this.isMating   = false;
		this.isHunting  = false;

		// Inherited attributes
		// TODO: Move into a new Trait class
		this.speed         = options.speed         || Math.random() * ( maxSpeed - minSpeed ) + minSpeed;
		this.strength      = options.strength      || Math.random() * maxStrength;
		this.sight         = options.sight         || Math.floor( Math.random() * ( maxSight - minSight ) + minSight );
		this.metabolicRate = options.metabolicRate || Math.random() * 100;
		this.color         = options.color         || colors[ Math.floor( Math.random() * colors.length ) ];

		this.size = Math.max( minSize, Math.ceil( this.strength * sizeToStrengthRatio ) );

		if ( options.x && options.y ) {
			this.start = new Point( options.x, options.y );
		}

		this._createGraphic();

		this.destination = this._getRandomPoint();
	};

	Cell.prototype.step = function () {
		this._move();

		this.age += 1;
	};

	// Attack from `this` (or defend if `cell`)
	Cell.prototype.attack = function ( cell ) {
		if ( this.strength >= cell.strength ) {
			this._addEnergy( cell.energy);

			cell.energy -= this.strength;
		} else {
			cell._addEnergy( this.energy );

			this.energy -= cell.strength;
		}
	};

	// Attempt to reproduce
	Cell.prototype.reproduce = function ( cell ) {
		var reproductionEnergyCost = [
			this.metabolicRate * 0.1,
			cell.metabolicRate * 0.1
		];

		var ageCheck     = this.age > this.nextMating && cell.age > this.nextMating;
		var energyCheck  = this.energy > reproductionEnergyCost[ 0 ] && cell.energy > reproductionEnergyCost[ 1 ];
		var genderCheck  = this.gender !== cell.gender;
		var chasingCheck = !this.isHunting && !cell.isHunting;

		if ( ageCheck && energyCheck && genderCheck && chasingCheck ) {
			this.energy     -= reproductionEnergyCost[ 0 ];
			cell.energy -= reproductionEnergyCost[ 1 ];

			this.nextMating     = this.age + 50;
			cell.nextMating = cell.age + 50;

			this.offspring     += 1;
			cell.offspring += 1;

			var options        = this._mutateTraits( this._mergeTraits( cell ) );
			options.x          = this.graphic.position._x;
			options.y          = this.graphic.position._y;
			options.color      = this.color;
			options.energy     = 50;
			options.nextMating = 100;

			var child = new Cell( options );
			bean.fire( window, 'Cell:new', child );
		}
	};

	// Add `energy`, but do not exceed `100`
	Cell.prototype._addEnergy = function ( energy ) {
		this.energy = Math.min( this.energy + energy, 100);
	};

	// Average the traits between `this` cell and `cell`
	Cell.prototype._mergeTraits = function ( cell ) {
		return {
			'speed'         : ( this.speed + cell.speed ) / 2,
			'strength'      : ( this.strength + cell.strength ) / 2,
			'sight'         : ( this.sight + cell.sight ) / 2,
			'metabolicRate' : ( this.metabolicRate + cell.metabolicRate ) / 2
		};
	};

	// Returns new `traits` that are randomly mutated slightly
	Cell.prototype._mutateTraits = function ( options ) {

		var plusOrMinus = function () {
			return Math.random() < 0.5 ? -1 : 1;
		};

		return {
			'speed'         : options.speed + ( Math.random() * 10 * plusOrMinus() ),
			'strength'      : options.strength + ( Math.random() * 10 * plusOrMinus() ),
			'sight'         : options.sight + ( Math.random() * 10 * plusOrMinus() ),
			'metabolicRate' : options.metabolicRate + ( Math.random() * 10 * plusOrMinus() )
		};
	};

	// Move the cell
	Cell.prototype._move = function () {
		var vector, position;

		// Only move if there is energy
		if ( this.energy > 0 ) {

			// Different algorithm if the cell is chasing
			if ( this.isHunting || this.isMating ) {
				vector   = this.destination.subtract( this.graphic.position );
				position = this.graphic.position.add( vector.divide( this.speed / 20 ) );

				this._setPosition( position );
			}

			// Not chasing
			else {
				vector   = this.destination.subtract( this.graphic.position );
				position = this.graphic.position.add( vector.divide( this.speed ) );

				// Create a new destination
				if ( vector.length < 25 ) {
					this.destination = this._getRandomPoint();
				}

				this._setPosition( position );
			}

			this._detectCollision();
			this._detectBySight();
		}

		// The cell ran out of energy
		else {
			this.graphic.remove();
		}

		// Use energy based upon standard rate multiplied by their metabolic rate
		this.energy = this.energy - ( 0.0005 * this.metabolicRate * 0.10 );
	};

	Cell.prototype._setPosition = function ( position ) {
		this.graphic.position = position;
		this.position         = this.graphic.position;
	};

	Cell.prototype._detectCollision = function () {
		this._hitTest( 5, function ( cell ) {

			// Same species
			if ( this.color === cell.color ) {
				this.reproduce( cell );
			}

			// Different species
			else {
				this.attack( cell );
			}

		} );
	};

	Cell.prototype._detectBySight = function () {
		this._hitTest( this.sight, function ( cell ) {
			var colorCheck  = this.color === cell.color;
			var genderCheck = this.gender !== cell.gender;

			// Chase to mate
			if ( colorCheck && genderCheck && this.energy > 30 ) {
				this.isMating    = true;
				this.isHunting   = false;
				this.destination = cell.graphic.position;
			}

			// Chase to hunt
			else if ( !colorCheck && this.size >= cell.size && this.energy < 30 ) {
				this.isMating    = false;
				this.isHunting   = true;
				this.destination = cell.graphic.position;
			}

			// No mating or hunting
			else {
				this.isHunting = false;
				this.isHunting = false;
			}

		} );
	};

	Cell.prototype._hitTest = function ( tolerance, callback ) {
		tolerance = tolerance || 5;

		var options = {
			'segments'  : true,
			'stroke'    : true,
			'fill'      : false,
			'tolerance' : tolerance
		};

		var point     = new Point( this.graphic.position._x, this.graphic.position._y );
		var collision = paper.project.activeLayer.hitTest( point, options );

		if ( collision ) {
			var cell = collision.item.cell;

			callback.call( this, cell );
		}
	};

	Cell.prototype._animate = function () {
		this.graphic.fillColor.hue += this.strength;
	};

	// Create the initial graphic
	Cell.prototype._createGraphic = function () {
		var start = this.start || this._getRandomPoint();

		if ( this.gender === 'male' ) {
			var size      = new Size( this.size * 1.5, this.size * 1.5 );
			var rectangle = new Rectangle( start, size );
			this.graphic  = new Path.Rectangle( rectangle );
		} else {
			this.graphic = new Path.Circle( start , this.size );
		}

		this.graphic.fillColor = this.color;
		this.graphic.cell  = this;
		this._originalDrawing  = this.graphic;
	};

	// Generate a random point
	Cell.prototype._getRandomPoint = function () {
		var minX = 0 + this.size + 1;
		var maxX = view.size._width - this.size - 1;

		var minY = 0 + this.size + 1;
		var maxY = view.size._height - this.size - 1;

		var x = Math.floor( Math.random() * ( maxX - minX ) + minX );
		var y = Math.floor( Math.random() * ( maxY - minY ) + minY );

		return new Point( x, y );
	};

	// Generate a random unique ID
	// From `http://stackoverflow.com/questions/12223529/create-globally-unique-id-in-javascript`
	Cell.prototype._generateUid = function () {
		var separator = '-';

		var S4 = function () {
			return ( ( ( 1 + Math.random() ) * 0x10000 ) | 0 ).toString( 16 ).substring( 1 );
		};

		return ( S4() + S4() + separator + S4() + separator + S4() + separator + S4() + separator + S4() + S4() + S4() );
	};

	return Cell;
} );