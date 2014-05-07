define( function ( require ) {
	'use strict';

	var _     = require( 'underscore' );
	var TWEEN = require( 'TWEEN' );

	var min      = 1;
	var max      = 100;
	var minSpeed = 10;
	var colors   = [ 0xFF6348, 0x52b22f, 0x459dc9, 0x7d4ccd, 0xded74f ];

	var hexToMatrix = function ( rgb, alpha ) {
			var matrix = [];
			matrix = matrix.concat([((rgb & 0x00FF0000) >>> 16)/255, 0, 0, 0, 0]); // red
			matrix = matrix.concat([0, ((rgb & 0x0000FF00) >>> 8)/255, 0, 0, 0]); // green
			matrix = matrix.concat([0, 0, (rgb & 0x000000FF)/255, 0, 0]); // blue
			matrix = matrix.concat([0, 0, 0, alpha/100, 0]); // alpha
			return matrix;
		}

	var movements = [
		TWEEN.Easing.Linear.None
	];

	var getRandom = function () {
		var color         = _.sample( colors );
		var sight         = _.random( 25, max );
		var strength      = _.random( min, max );
		var size          = _.random( 2, Math.min( strength / 10, 5 ) );
		var movement      = _.sample( movements );
		var speed         = _.random( minSpeed, max * 2 / size ) ;
		var gender        = _.sample( [ 'male', 'female' ] );
		var metabolicRate = _.random( 0, size / 2, true );

		return {
			'color'         : color,
			'sight'         : sight,
			'strength'      : strength,
			'size'          : size,
			'movement'      : movement,
			'speed'         : speed,
			'gender'        : gender,
			'metabolicRate' : metabolicRate
		};
	};

	// Returns new `traits` that are randomly mutated slightly
	var mergeTraits = function ( traits1, traits2  ) {
		return {
			'color'    : traits1.color,
			'sight'    : _.random.apply( null, [ traits1.sight, traits2.sight ].sort() ),
			'strength' : _.random.apply( null, [ traits1.strength, traits2.strength ].sort() ),
			'size'     : _.sample( [ traits1.size, traits2.size ] ),
			'movement' : _.sample( [ traits1.movement, traits2.movement ] ),
			'speed'    : _.random.apply( null, [ traits1.speed, traits2.speed ].sort() ),
			'gender'   : _.sample( [ traits1.gender, traits2.gender ] )
		};
	};

	var Traits = {
		'getRandom'   : getRandom,
		'movements'   : movements,
		'colors'      : colors,
		'mergeTraits' : mergeTraits
	};

	return Traits;
} );
