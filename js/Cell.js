define( function ( require ) {
	'use strict';

	var _     = require( 'underscore' );
	var THREE = require( 'THREE' );

	var defaults = function () {
		var colors = [ 0xEFEFEF, 0xFF6348, 0xF2CB05, 0x49F09F, 0x52B0ED ];

		return {
			'color'    : colors[ Math.floor( Math.random() * colors.length ) ],
			'size'     : 5,
			'energy'   : 100,
			'strength' : 100,
			'gender'   : Math.random() < 0.5 ? 'male' : 'female',
			'sight'    : 100
		};
	};

	var Cell = function ( traits, options ) {
		this.traits = _.extend( defaults(), traits );

		this.scene = options.scene;
	};

	Cell.prototype.step = function () {
		if ( !this.graphic ) {
			this.draw();
		}

		this.move();
	};

	Cell.prototype.draw = function () {
		var graphicMaterial = new THREE.MeshBasicMaterial( {
			'color' : this.traits.color
		} );

		var segments = 12;
		var rings    = 12;
		var sphere   = new THREE.SphereGeometry( this.traits.size, segments, rings );
		this.graphic = new THREE.Mesh( sphere, graphicMaterial);

		this.scene.add( this.graphic );
	};

	Cell.prototype.move = function () {
		this.graphic.position.x += Math.random() < 0.5 ? -1 : 1;
		this.graphic.position.y += Math.random() < 0.5 ? -1 : 1;
	};

	return Cell;
} );