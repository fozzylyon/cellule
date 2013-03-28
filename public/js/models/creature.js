define( function ( require ) {
	'use strict';

	var Paper = require( 'paper' );
	var Path  = Paper.Path;
	var Point = Paper.Point;

	var Creature = function ( options ) {
		options = options || {};

		var minSpeed            = 1000;
		var maxSpeed            = 2000;
		var maxStrength         = 100;
		var sizeToStrengthRatio = 4 / maxStrength;
		var minSize             = 2;
		var colors              = [ '#E8007A', '#FF6348', '#F2CB05', '#D4FF00', '#49F09F' ];

		// Non-inherited attributes
		this.id         = this._generateUid();
		this.age        = 0;
		this.gender     = Math.random() < 0.5 ? 'male' : 'female';
		this.offspring  = 0;
		this.nextMating = 100;
		this.energy     = options.energy || 100;

		// Inherited attributes
		this.traits = {
			'metabolicRate' : options.metabolicRate || Math.random() * 100,
			'speed'         : options.speed         || Math.random() * ( maxSpeed - minSpeed ) + minSpeed,
			'strength'      : options.strength      || Math.random() * maxStrength,
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

	Creature.prototype.attack = function ( creature ) {
		if ( this.traits.strength >= creature.traits.strength ) {
			this._addEnergy( creature.energy);

			creature.energy -= this.traits.strength;
		} else {
			creature._addEnergy( this.energy );

			this.energy -= creature.traits.strength;
		}
	};

	Creature.prototype.reproduce = function ( creature ) {

		var reproductionEnergyCost = [
			this.traits.metabolicRate / 2,
			creature.traits.metabolicRate / 2
		];

		if (
			// check if they are ready to reproduce
			this.age > this.nextMating && creature.age > this.nextMating &&

			// Check if they have enough energy to reproduce
			this.energy > reproductionEnergyCost[ 0 ] && creature.energy > reproductionEnergyCost[ 1 ] &&

			// Must be different genders
			this.gender !== creature.gender
		) {
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

			console.log( 'new ' + child.gender + ' ' + child.traits.color );
		}

	};

	Creature.prototype._addEnergy = function ( energy ) {
		this.energy = Math.min( this.energy + energy, 100);
	};

	Creature.prototype._mergeTraits = function ( creature ) {
		return {
			'metabolicRate' : ( this.traits.metabolicRate + creature.traits.metabolicRate ) / 2,
			'speed'         : ( this.traits.speed + creature.traits.speed ) / 2,
			'strength'      : ( this.traits.strength + creature.traits.strength ) / 2
		};
	};

	// Returns new traits that are randomly mutated
	Creature.prototype._mutateTraits = function ( options ) {

		var plusOrMinus = function () {
			if ( Math.random() < 0.5 ) {
				return -1;
			} else {
				return 1;
			}
		};

		return {
			'metabolicRate' : options.metabolicRate + ( Math.random() * 0.01 * plusOrMinus() ),
			'speed'         : options.speed + ( Math.random() * 0.1 * plusOrMinus() ),
			'strength'      : options.strength + ( Math.random() * 0.01 * plusOrMinus() )
		};
	};

	// Move the creature. Super simple for now, but will include advance features
	// based upon "sight", ie: seeking out mates of the same color or hunting
	// other colors
	Creature.prototype._move = function () {

		// Only move if there is energy
		if ( this.energy > 0 ) {
			var vector = this.destination.subtract( this.drawing.position );

			// Create a new destination
			if ( vector.length < 100 ) {
				this.destination = this._getRandomPoint();
			}

			// Set the new position
			this.drawing.position = this.drawing.position.add( vector.divide( this.traits.speed ) );

			this._detectCollision();
		} else {
			this.drawing.remove();
		}

		// Use energy based upon standard rate multiplied by their metabolic rate
		this.energy = this.energy - ( 0.0005 * this.traits.metabolicRate / 2 );
	};

	Creature.prototype._detectCollision = function () {
		var options = {
			'segments'  : true,
			'stroke'    : true,
			'fill'      : false,
			'tolerance' : 5
		};

		var point     = new Point( this.drawing.position._x, this.drawing.position._y );
		var collision = paper.project.activeLayer.hitTest( point, options );

		if ( collision ) {
			var creature = collision.item.creature;

			// Same species
			if ( this.traits.color === creature.traits.color ) {
				this.reproduce( creature );
			}

			// Different species
			else {
				this.attack( creature );
			}
		}
	};

	Creature.prototype._animate = function () {
		this.drawing.fillColor.hue += this.traits.strength;
	};

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
	};

	Creature.prototype._getRandomPoint = function () {
		var minX = 0 + this.size + 1;
		var maxX = view.size._width - this.size - 1;

		var minY = 0 + this.size + 1;
		var maxY = view.size._height - this.size - 1;

		var x = Math.floor( Math.random() * ( maxX - minX ) + minX );
		var y = Math.floor( Math.random() * ( maxY - minY ) + minY );

		return new Point( x, y );
	};

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