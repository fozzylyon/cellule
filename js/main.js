define( function ( require ) {
	'use strict';

	var _       = require( 'underscore' );
	var PIXI    = require( 'PIXI' );
	var Physics = require( 'Physics' );

	var Cell = require( 'Cell' );
	var Traits = require( 'Traits' );

	var textures = [ '_yellow', '_orange', '_red', '_violet', '_blue', '_green' ];
	var cells = [];
	var initialCount = 30;

	var createCell = function ( options ) {
		options = options || {};
		options = _.defaults( options, Traits.getRandom(), {
			'x'  : _.random( 10, world.width ),
			'y'  : _.random( 10, world.height ),
			'vx' : Math.random() / 4,
			'vy' : Math.random() / 4
		} );
		var cell = Physics.body( 'cell', options );
		return cell;
	};

	var spawnCell = function ( cell ) {
		world.add( cell );
		cells.push( cell );
	};

	var world = Physics( {
		'timestep' : 4,
		'maxIPF' : 4,
		'integrator' : 'improved-euler'
	} );

	// gravity...
	// world.add( Physics.behavior('constant-acceleration', {
	// 	acc: { x : 0, y: 0 } // this is the default
	// } );

	var renderer = Physics.renderer('pixi', {
		'color': 0x222222,
		// 'debug'  : true,
		'el'     : 'container',
		'width'  : 500,
		'height' : 500,
		// 'meta'   : true,
		// 'metaEl' : 'stats',
	} );
	world.add( renderer );
	renderer.stage.setBackgroundColor( 0x222222 );
	// world._renderer.stage.filters = [ new PIXI.PixelateFilter()];

	Physics.util.ticker.on( function ( time ) {
		world.step( time );
		world.render();
	} ).start();

	// physics
	world.add( Physics.behavior( 'edge-collision-detection', {
		'aabb'        : Physics.aabb( 0, 0, 500, 500 ),
		'restitution' : 1
	} ) );
	world.add( Physics.behavior('body-impulse-response') );
	world.add( Physics.behavior('body-collision-detection') );
	world.add( Physics.behavior('sweep-prune') );



	while ( cells.length < initialCount ) {
		spawnCell( createCell() );
	}


	world.on( 'collisions:detected', function ( data ) {
		if ( data.collisions.length === 1 ) {
			var collision = data.collisions[ 0 ];
			var bodyA = collision.bodyA;
			var bodyB = collision.bodyB;
			if ( bodyA.color === bodyB.color ) {
				// console.log('same color');
				if ( bodyA.gender !== bodyB.gender ) {
					// console.log('mating', collision );
					// console.log(bodyA);
					// console.log(bodyB);
					spawnCell( createCell( _.extend( Traits.mergeTraits( bodyA, bodyB ),
					{
						'x'  : 0,
						'y'  : _.random( 10, world.height ),
						'vx' : Math.random() / 4,
						'vy' : Math.random() / 4
					} ) ) );
				}
			}
		}
	} );
} );
