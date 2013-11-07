define( function ( require ) {
	'use strict';

	var Cell = require( 'Cell' );

	var Ecosystem = function ( options, step ) {
		this.scene = options.scene;
		this.cells = [];

		for ( var i = 0; i < 200; i++ ) {
			this.cells.push( new Cell( null, { 'scene' : this.scene, 'ecosystem' : this } ) );
		}

		this.cells.forEach( function ( cell, index ) {
			cell.step();
		} );
	};

	Ecosystem.prototype.step = function () {
		this.cells.forEach( function ( cell, index ) {
			cell.step();
		} );
	};

	Ecosystem.prototype.getCells = function( cell ) {
		if ( !cell || !cell.position ) {
			return [];
		}
		var position = cell.position;
		var cells = [];

		this.quadrant

		return cells;
	};

	return Ecosystem;
} );