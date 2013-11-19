define( function ( require ) {
	'use strict';

	var _     = require( 'underscore' );
	var TWEEN = require( 'TWEEN' );

	var min      = 1;
	var max      = 100;
	var minSpeed = 10;
	var colors   = [ 0xEFEFEF, 0xFF6348, 0xF2CB05, 0x49F09F, 0x52B0ED ];

	var movements = [
		TWEEN.Easing.Linear.None,
		TWEEN.Easing.Quadratic.In,
		TWEEN.Easing.Quadratic.Out,
		TWEEN.Easing.Quadratic.InOut,
		TWEEN.Easing.Quartic.In,
		TWEEN.Easing.Quartic.Out,
		TWEEN.Easing.Quartic.InOut,
		TWEEN.Easing.Quintic.In,
		TWEEN.Easing.Quintic.Out,
		TWEEN.Easing.Quintic.InOut,
		TWEEN.Easing.Cubic.In,
		TWEEN.Easing.Cubic.Out,
		TWEEN.Easing.Cubic.InOut,
		TWEEN.Easing.Exponential.In,
		TWEEN.Easing.Exponential.Out,
		TWEEN.Easing.Exponential.InOut,
		TWEEN.Easing.Circular.In,
		TWEEN.Easing.Circular.Out,
		TWEEN.Easing.Circular.InOut,
		TWEEN.Easing.Back.Out
	];

	var getRandom = function () {
		var color    = _.sample( colors );
		var sight    = _.random( min, max );
		var strength = _.random( min, max );
		var size     = _.random( 2, Math.min( strength / 10, 5 ) );
		var movement = _.sample( movements );
		var speed    = _.random( minSpeed, max );
		var gender   = _.sample( [ 'male', 'female' ] );

		return {
			'color'    : color,
			'sight'    : sight,
			'strength' : strength,
			'size'     : size,
			'movement' : movement,
			'speed'    : speed,
			'gender'   : gender
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