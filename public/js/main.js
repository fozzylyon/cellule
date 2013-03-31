google.load( 'visualization', '1', { 'packages' : [ 'corechart' ] } );

define( function ( require ) {
	'use strict';

	var paper     = require( 'paper' );
	var Ecosystem = require( 'ecosystem' );

	paper.install( window );

	$( function() {
		var ecosystem = new Ecosystem( 'ecosystem' );
	} );

	tool.onMouseUp = function ( event ) {
		var options = {
			'segments'  : true,
			'stroke'    : true,
			'fill'      : true,
			'tolerance' : 2
		};

		var point     = new Point( event.event.x, event.event.y );
		var collision = paper.project.activeLayer.hitTest( point, options );

		if ( collision ) {
			var creature = collision.item.creature;

			console.log( "click:", creature );
		}
	};

} );