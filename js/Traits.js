define( function ( require ) {
	'use strict';

	var TWEEN = require( 'TWEEN' );


	var min = 1;
	var max = 100;
	var minSpeed = 10;
	var colors = [ 0xEFEFEF, 0xFF6348, 0xF2CB05, 0x49F09F, 0x52B0ED ];

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
		var color    = colors[ Math.floor( Math.random() * colors.length ) ];
		var sight    = Math.round( Math.random() * ( max - min ) + min, 0 );
		var strength = Math.round( Math.random() * ( max - min ) + min, 0 );
		var size     = Math.round( Math.max( 2, Math.min( strength / 10, 5 ) ), 0 );
		var movement = movements[ Math.floor( Math.random() * movements.length ) ];
		var speed    = Math.floor( Math.random() * ( max - minSpeed ) + minSpeed );
		var gender   = Math.random() < 0.5 ? 'male' : 'female';

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

	var Traits = {
		'getRandom' : getRandom,
		'movements' : movements,
		'colors'    : colors
	};

	return Traits;
} );