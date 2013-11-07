define( function ( require ) {
	'use strict';

	var Cell  = require( 'Cell' );
	var THREE = require( 'THREE' );

	var Ecosystem = function ( options, step ) {
		this.scene = options.scene;
		this.cells = [];

		this.caster = new THREE.Raycaster();
		this.caster.near = 0;
		this.caster.far = 10;

		for ( var i = 0; i < 100; i++ ) {
			this.cells.push( new Cell( null, { 'scene' : this.scene, 'ecosystem' : this, 'caster' : this.caster } ) );
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

		return cells;
	};

	return Ecosystem;
} );