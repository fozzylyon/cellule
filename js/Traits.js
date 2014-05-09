define( function ( require ) {
	'use strict';

	var _     = require( 'underscore' );

	var min      = 1;
	var max      = 100;
	var minSpeed = 10;
	var colors   = [ 0xFF6348, 0xa3b730, 0x00bee4, 0xcc11ff ];

	var getRandom = function () {
		var color         = _.sample( colors );
		var sight         = _.random( 25, max );
		var strength      = _.random( min, max );
		var size          = _.random( 10, Math.min( strength / 10, 30 ) );
		var speed         = _.random( minSpeed, max * 2 / size ) ;
		var gender        = _.sample( [ 'male', 'female' ] );
		var metabolicRate = _.random( 0, size / 2, true );

		return {
			// size aliases
			'size'          : size,
			'width'         : size,
			'height'        : size,
			'radius'        : size,

			// color aliases
			'color'         : color,
			'styles'        : {
				'fillStyle' : color
			},

			'sight'         : sight,
			'strength'      : strength,

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
			'speed'    : _.random.apply( null, [ traits1.speed, traits2.speed ].sort() ),
			'gender'   : _.sample( [ traits1.gender, traits2.gender ] )
		};
	};

	var Traits = {
		'getRandom'   : getRandom,
		'colors'      : colors,
		'mergeTraits' : mergeTraits
	};

	return Traits;
} );
