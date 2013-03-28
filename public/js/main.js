var creatures = [];

define( function ( require ) {
	'use strict';

	var $        = require( 'jquery' );
	var toastr   = require( 'toastr' );
	var Creature = require( 'Creature' );

	paper.install( window );

	$( function () {
		paper.setup( document.getElementById( 'ecosystem' ) );
		paper.project.view.draw();

		for ( var i = 0; i < 200; i++ ) {
			creatures.push( new Creature() );
		}

		view.draw();

		view.onFrame = function ( event ) {
			creatures.forEach( function ( creature, index ) {
				if ( creature.energy < -1 ) {
					// toastr.error( 'a ' + creature.traits.color + ' (' + creature.id + ') died at the age of ' + creature.age + ' and had ' + creature.offspring + ' offspring' );

					creatures.splice( index, 1);
				}

				creature.step();
			} );
		};

		tool.onMouseDrag = function ( event ) {
			creatures.push( new Creature( {
				'x' : event.event.x,
				'y' : event.event.y
			} ) );
		};

	} );

} );