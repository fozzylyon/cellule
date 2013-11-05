define( function ( require ) {
	'use strict';

	var Cell = require( 'Cell' );

	var Ecosystem = function ( options, step ) {
		this.scene = options.scene;
		this.cells = [];

		for ( var i = 0; i < 20; i++ ) {
			this.cells.push( new Cell( null, { 'scene' : this.scene } ) );
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

	return Ecosystem;
} );