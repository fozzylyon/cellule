define( function ( require ) {
	'use strict';

	var Paper  = require( 'paper' );
	var toastr = require( 'toastr' );

	var Creature = function ( options ) {
		options = options || {};

		var minSpeed            = 1000;
		var maxSpeed            = 2000;
		var maxStrength         = 100;
		var sizeToStrengthRatio = 4 / maxStrength;
		var minSight            = 10;
		var maxSight            = 150;
		var colors              = [ '#EFEFEF', '#FF6348', '#F2CB05', '#49F09F', '#52B0ED' ];
		var minSize             = 2;

		// Non-inherited attributes
		this.id         = this._generateUid();
		this.age        = 0;
		this.gender     = Math.random() < 0.5 ? 'male' : 'female';
		this.offspring  = 0;
		this.nextMating = 100;
		this.energy     = options.energy || 100;
		this.isHunting  = false;
		this.isMating   = false;

		// Inherited attributes
		this.traits = {
			'speed'         : options.speed         || Math.random() * ( maxSpeed - minSpeed ) + minSpeed,
			'strength'      : options.strength      || Math.random() * maxStrength,
			'sight'         : options.sight         || Math.floor( Math.random() * ( maxSight - minSight ) + minSight ),
			'metabolicRate' : options.metabolicRate || Math.random() * 100,
			'color'         : options.color         || colors[ Math.floor( Math.random() * colors.length ) ]
		};

		this.size = Math.max( minSize, Math.ceil( this.traits.strength * sizeToStrengthRatio ) );

		if ( options.x && options.y ) {
			this.start = new Point( options.x, options.y );
		}

		this._createDrawing();

		this.destination = this._getRandomPoint();
	};

	Creature.prototype.step = function () {
		this._move();

		this.age += 1;
	};

	// Attack from `this` (or defend if `creature`)
	Creature.prototype.attack = function ( creature ) {
		if ( this.traits.strength >= creature.traits.strength ) {
			this._addEnergy( creature.energy);

			creature.energy -= this.traits.strength;
		} else {
			creature._addEnergy( this.energy );

			this.energy -= creature.traits.strength;
		}
	};

	// Attempt to reproduce
	Creature.prototype.reproduce = function ( creature ) {
		var reproductionEnergyCost = [
			this.traits.metabolicRate / 2,
			creature.traits.metabolicRate / 2
		];

		var ageCheck     = this.age > this.nextMating && creature.age > this.nextMating;
		var energyCheck  = this.energy > reproductionEnergyCost[ 0 ] && creature.energy > reproductionEnergyCost[ 1 ];
		var genderCheck  = this.gender !== creature.gender;
		var chasingCheck = !this.isHunting && !creature.isHunting;

		if ( ageCheck && energyCheck && genderCheck && chasingCheck ) {
			this.energy     -= reproductionEnergyCost[ 0 ];
			creature.energy -= reproductionEnergyCost[ 1 ];

			this.nextMating     = this.age + 100;
			creature.nextMating = creature.age + 100;

			this.offspring     += 1;
			creature.offspring += 1;

			var options    = this._mutateTraits( this._mergeTraits( creature ) );
			options.x      = this.drawing.position._x;
			options.y      = this.drawing.position._y;
			options.color  = this.traits.color;
			options.energy = 25;

			var child = new Creature( options );
			creatures.push( child );

			toastr.info( '<span style="color:' + child.traits.color + '">' + child.id + ' was born as a ' + child.traits.color + '</span>' );
		}
	};

	// Add `energy`, but do not exceed `100`
	Creature.prototype._addEnergy = function ( energy ) {
		this.energy = Math.min( this.energy + energy, 100);
	};

	// Average the traits between `this` creature and `creature`
	Creature.prototype._mergeTraits = function ( creature ) {
		return {
			'speed'         : ( this.traits.speed + creature.traits.speed ) / 2,
			'strength'      : ( this.traits.strength + creature.traits.strength ) / 2,
			'sight'         : ( this.traits.sight + creature.traits.sight ) / 2,
			'metabolicRate' : ( this.traits.metabolicRate + creature.traits.metabolicRate ) / 2
		};
	};

	// Returns new `traits` that are randomly mutated slightly
	Creature.prototype._mutateTraits = function ( options ) {

		var plusOrMinus = function () {
			if ( Math.random() < 0.5 ) {
				return -1;
			} else {
				return 1;
			}
		};

		return {
			'speed'         : options.speed + ( Math.random() * 0.1 * plusOrMinus() ),
			'strength'      : options.strength + ( Math.random() * 0.1 * plusOrMinus() ),
			'sight'         : options.sight + ( Math.random() * 0.1 * plusOrMinus() ),
			'metabolicRate' : options.metabolicRate + ( Math.random() * 0.1 * plusOrMinus() )
		};
	};

	// Move the creature
	// TODO: Seek out mates
	Creature.prototype._move = function () {
		var vector;

		// Only move if there is energy
		if ( this.energy > 0 ) {

			// Different algorithm if the creature is chasing
			if ( this.isHunting || this.isMating ) {
				vector = this.destination.subtract( this.drawing.position );

				this.drawing.position = this.drawing.position.add( vector.divide( this.traits.speed / 20 ) );
			}

			// Not chasing
			else {
				vector = this.destination.subtract( this.drawing.position );

				// Create a new destination
				if ( vector.length < 100 ) {
					this.destination = this._getRandomPoint();
				}

				// Set the new position
				this.drawing.position = this.drawing.position.add( vector.divide( this.traits.speed ) );
			}

			this._detectCollision();
			this._detectBySight();
		}

		// The creature ran out of energy
		else {
			this.drawing.remove();
		}

		// Use energy based upon standard rate multiplied by their metabolic rate
		this.energy = this.energy - ( 0.0005 * this.traits.metabolicRate / 2 );
	};

	Creature.prototype._detectCollision = function () {
		this._hitTest( 5, function ( creature ) {

			// Same species
			if ( this.traits.color === creature.traits.color ) {
				this.reproduce( creature );
			}

			// Different species
			else {
				this.attack( creature );
			}

		} );
	};

	Creature.prototype._detectBySight = function () {
		this._hitTest( this.traits.sight, function ( creature ) {
			var colorCheck  = this.traits.color === creature.traits.color;
			var genderCheck = this.gender !== creature.gender;

			// Chase to mate
			if ( colorCheck && genderCheck && this.gender === 'male' && this.energy > 30 ) {
				this.isMating    = true;
				this.isHunting   = false;
				this.destination = creature.drawing.position;
			}

			// Chase to hunt
			else if ( !colorCheck && this.size >= creature.size && this.energy < 20 ) {
				this.isMating    = false;
				this.isHunting   = true;
				this.destination = creature.drawing.position;
			}

			// No mating or hunting
			else {
				this.isHunting = false;
				this.isHunting = false;
			}

		} );
	};

	Creature.prototype._hitTest = function ( tolerance, callback ) {
		tolerance = tolerance || 5;

		var options = {
			'segments'  : true,
			'stroke'    : true,
			'fill'      : false,
			'tolerance' : tolerance
		};

		var point     = new Point( this.drawing.position._x, this.drawing.position._y );
		var collision = paper.project.activeLayer.hitTest( point, options );

		if ( collision ) {
			var creature = collision.item.creature;

			callback.call( this, creature );
		}
	};

	Creature.prototype._animate = function () {
		this.drawing.fillColor.hue += this.traits.strength;
	};

	// Create the initial drawing
	Creature.prototype._createDrawing = function () {
		var start = this.start || this._getRandomPoint();

		if ( this.gender === 'male' ) {
			var size      = new Size( this.size * 1.5, this.size * 1.5 );
			var rectangle = new Rectangle( start, size );
			this.drawing  = new Path.Rectangle( rectangle );
		} else {
			this.drawing = new Path.Circle( start , this.size );
		}

		this.drawing.fillColor = this.traits.color;
		this.drawing.creature  = this;
		this._originalDrawing  = this.drawing;
	};

	// Generate a random point
	Creature.prototype._getRandomPoint = function () {
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
	Creature.prototype._generateUid = function () {
		var separator = '-';

		var S4 = function () {
			return ( ( ( 1 + Math.random() ) * 0x10000 ) | 0 ).toString( 16 ).substring( 1 );
		};

		return ( S4() + S4() + separator + S4() + separator + S4() + separator + S4() + separator + S4() + S4() + S4() );
	};

	return Creature;
} );