define( function ( require ) {
	'use strict';

	var Paper  = require( 'paper' );
	var bean   = require( 'bean' );
	var toastr = require( 'toastr' );

	var Creature = function ( options ) {
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

	Creature.prototype.step = function () {
		this._move();

		this.age += 1;
	};

	// Attack from `this` (or defend if `creature`)
	Creature.prototype.attack = function ( creature ) {
		if ( this.strength >= creature.strength ) {
			this._addEnergy( creature.energy);

			creature.energy -= this.strength;
		} else {
			creature._addEnergy( this.energy );

			this.energy -= creature.strength;
		}
	};

	// Attempt to reproduce
	Creature.prototype.reproduce = function ( creature ) {
		var reproductionEnergyCost = [
			this.metabolicRate * 0.1,
			creature.metabolicRate * 0.1
		];

		var ageCheck     = this.age > this.nextMating && creature.age > this.nextMating;
		var energyCheck  = this.energy > reproductionEnergyCost[ 0 ] && creature.energy > reproductionEnergyCost[ 1 ];
		var genderCheck  = this.gender !== creature.gender;
		var chasingCheck = !this.isHunting && !creature.isHunting;

		if ( ageCheck && energyCheck && genderCheck && chasingCheck ) {
			this.energy     -= reproductionEnergyCost[ 0 ];
			creature.energy -= reproductionEnergyCost[ 1 ];

			this.nextMating     = this.age + 50;
			creature.nextMating = creature.age + 50;

			this.offspring     += 1;
			creature.offspring += 1;

			var options        = this._mutateTraits( this._mergeTraits( creature ) );
			options.x          = this.graphic.position._x;
			options.y          = this.graphic.position._y;
			options.color      = this.color;
			options.energy     = 50;
			options.nextMating = 100;

			var child = new Creature( options );
			bean.fire( window, 'Creature:new', child );
		}
	};

	// Add `energy`, but do not exceed `100`
	Creature.prototype._addEnergy = function ( energy ) {
		this.energy = Math.min( this.energy + energy, 100);
	};

	// Average the traits between `this` creature and `creature`
	Creature.prototype._mergeTraits = function ( creature ) {
		return {
			'speed'         : ( this.speed + creature.speed ) / 2,
			'strength'      : ( this.strength + creature.strength ) / 2,
			'sight'         : ( this.sight + creature.sight ) / 2,
			'metabolicRate' : ( this.metabolicRate + creature.metabolicRate ) / 2
		};
	};

	// Returns new `traits` that are randomly mutated slightly
	Creature.prototype._mutateTraits = function ( options ) {

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

	// Move the creature
	Creature.prototype._move = function () {
		var vector, position;

		// Only move if there is energy
		if ( this.energy > 0 ) {

			// Different algorithm if the creature is chasing
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

		// The creature ran out of energy
		else {
			this.graphic.remove();
		}

		// Use energy based upon standard rate multiplied by their metabolic rate
		this.energy = this.energy - ( 0.0005 * this.metabolicRate * 0.10 );
	};

	Creature.prototype._setPosition = function ( position ) {
		this.graphic.position = position;
		this.position         = this.graphic.position;
	};

	Creature.prototype._detectCollision = function () {
		this._hitTest( 5, function ( creature ) {

			// Same species
			if ( this.color === creature.color ) {
				this.reproduce( creature );
			}

			// Different species
			else {
				this.attack( creature );
			}

		} );
	};

	Creature.prototype._detectBySight = function () {
		this._hitTest( this.sight, function ( creature ) {
			var colorCheck  = this.color === creature.color;
			var genderCheck = this.gender !== creature.gender;

			// Chase to mate
			if ( colorCheck && genderCheck && this.energy > 30 ) {
				this.isMating    = true;
				this.isHunting   = false;
				this.destination = creature.graphic.position;
			}

			// Chase to hunt
			else if ( !colorCheck && this.size >= creature.size && this.energy < 30 ) {
				this.isMating    = false;
				this.isHunting   = true;
				this.destination = creature.graphic.position;
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

		var point     = new Point( this.graphic.position._x, this.graphic.position._y );
		var collision = paper.project.activeLayer.hitTest( point, options );

		if ( collision ) {
			var creature = collision.item.creature;

			callback.call( this, creature );
		}
	};

	Creature.prototype._animate = function () {
		this.graphic.fillColor.hue += this.strength;
	};

	// Create the initial graphic
	Creature.prototype._createGraphic = function () {
		var start = this.start || this._getRandomPoint();

		if ( this.gender === 'male' ) {
			var size      = new Size( this.size * 1.5, this.size * 1.5 );
			var rectangle = new Rectangle( start, size );
			this.graphic  = new Path.Rectangle( rectangle );
		} else {
			this.graphic = new Path.Circle( start , this.size );
		}

		this.graphic.fillColor = this.color;
		this.graphic.creature  = this;
		this._originalDrawing  = this.graphic;
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