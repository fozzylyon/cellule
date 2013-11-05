define( function ( require ) {
	'use strict';

	var _     = require( 'underscore' );
	var THREE = require( 'THREE' );


	var defaults = function () {

		var colors = [ 0xEFEFEF, 0xFF6348, 0xF2CB05, 0x49F09F, 0x52B0ED ];
		return {
			'color'    : colors[ Math.floor( Math.random() * colors.length ) ],
			'size'     : 25,
			'energy'   : 100,
			'strength' : 100,
			'gender'   : Math.random() < 0.5 ? 'male' : 'female',
			'sight'    : 100
		};
	};

	var Cell = function ( traits, options ) {
		this.traits = _.extend( defaults(), traits );

		this.scene = options.scene;
		this.graphic;
	};



	Cell.prototype.step = function () {
		if ( !this.graphic ) {
			this.draw();
		}
		this.move();
	};


	Cell.prototype.draw = function () {
		var graphicMaterial = new THREE.MeshBasicMaterial(
		{
			color: this.traits.color
		});

		// set up the sphere vars
		var segments = 12;
		var rings = 12;

		// create a new mesh with
		// sphere geometry - we will cover
		// the sphereMaterial next!
		this.graphic = new THREE.Mesh( new THREE.SphereGeometry(
			this.traits.size,
			segments,
			rings),
		graphicMaterial);

		// add the sphere to the scene
		this.scene.add( this.graphic );
	}

	Cell.prototype.move = function () {
		this.graphic.position.x+= Math.random() < 0.5 ? -0.25 : 0.25;
		this.graphic.position.y+= Math.random() < 0.5 ? -0.25 : 0.25;
	}


	return Cell;
} );