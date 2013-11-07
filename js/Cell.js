define( function ( require ) {
	'use strict';

	var _     = require( 'underscore' );
	var THREE = require( 'THREE' );
	var TWEEN = require( 'TWEEN' );


	var viscosity = 1000;
	var colors    = [ 0xEFEFEF, 0xFF6348, 0xF2CB05, 0x49F09F, 0x52B0ED ];
	var min       = 1;
	var max       = 100;
	var minSpeed  = 10;

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

	var defaults = function () {
		var color    = colors[ Math.floor( Math.random() * colors.length ) ];
		var strength = Math.round( Math.random() * ( max - min ) + min, 0 );
		var size     = Math.round( Math.max( 2, Math.min( strength / 10, 5 ) ), 0 );
		var movement = movements[ Math.floor( Math.random() * movements.length ) ];
		var speed    = Math.floor( Math.random() * ( max - minSpeed ) + minSpeed );
		var gender   = Math.random() < 0.5 ? 'male' : 'female';

		return {
			'color'    : color,
			'strength' : strength,
			'size'     : size,
			'movement' : movement,
			'speed'    : speed,
			'gender'   : gender,
			'energy'   : 100
		};
	};

	var Cell = function ( traits, options ) {
		var self = this;

		this.traits    = _.extend( defaults(), traits );
		this.scene     = options.scene;
		this.ecosystem = options.ecosystem;
		this.caster    = options.caster;
		this.position  = this._getRandomPoint();

		this._tween();
	};

	Cell.prototype.step = function () {
		if ( !this.graphic ) {
			this.draw();
		}

		this.move();
		this.detectRange();
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
		var self = this;

		if ( this.position.x === this.target.x && this.position.y === this.target.y ) {
			this._tween();
		}
	};

	Cell.prototype._tween = function () {
		this.target  = this._getRandomPoint();
		var position = new THREE.Vector2( this.position.x, this.position.y );
		var target   = new THREE.Vector2( this.target.x, this.target.y );
		var distance = position.distanceTo( target );
		var time     = distance / this.traits.speed * viscosity;
		this.tween   = new TWEEN.Tween( this.position ).to( this.target, time );

		this.tween.easing( this.traits.movement );

		this.tween.onUpdate( function() {
			this.graphic.position.x = this.position.x;
			this.graphic.position.y = this.position.y;
		}.bind( this ) );

		this.tween.start();
	};

	Cell.prototype._getRandomPoint = function () {
		var minX = 0 + this.traits.size + 1;
		var maxX = window.innerWidth - this.traits.size - 1;

		var minY = 0 + this.traits.size + 1;
		var maxY = window.innerHeight - this.traits.size - 1;

		var x = Math.floor( Math.random() * ( maxX - minX ) + minX );
		var y = Math.floor( Math.random() * ( maxY - minY ) + minY );

		return { 'x' : x, 'y' : y };
	};

	Cell.prototype.detectRange = function () {

		if ( !this.rays ) {
			this.rays = [
				new THREE.Vector3( 0, 0, 1 ),
				new THREE.Vector3( 0, 1, 0 ),
				new THREE.Vector3( 1, 0, 0 )
			];
		}

		var position = this.graphic.position;
		var collisions;
		var i;
		// Maximum distance from the origin before we consider collision

		var cells = this.getCells( this );

		// For each ray
		for ( i = 0; i < this.rays.length; i += 1 ) {
			// We reset the raycaster to this direction
			this.caster.set( position, this.rays[ i ] );
			if ( !cells.length ) {
				break;
			}

			// Test if we intersect with any obstacle mesh
			collisions = this.caster.intersectObjects( cells );
			// // And disable that direction if we do
			if ( collisions.length > 0 && collisions[ 0 ].distance <= 10 ) {
				// do stuff if it collides with anything else
				this.graphic.material.color += this.traits.color;
			}
		}
	};

	Cell.prototype.getCells = function ( cell ) {
		// Get the obstacles array from our world
		var cells = this.ecosystem.cells.map( function ( cell ) {
			return cell.graphic;
		} );


		var position = cell.graphic.position;

		// filter out cells that aren't nearby
		var x1 = position.x;
		var y1 = position.y;
		var z1 = position.z;
		var x2;
		var y2;
		var z2;
		cells = _.filter( cells, function ( cell ){
			if ( !cell || cell === cell.graphic ) {
				return false;
			}
			x2 = cell.position.x;
			y2 = cell.position.y;
			z2 = cell.position.z;
			var isClose = ( Math.pow( x1 - x2, 2 ) + Math.pow( y1 - y2, 2 ) + Math.pow( z1 - z2, 2 ) <= Math.pow( max / 10, 2 ) );
			return isClose;
		}.bind( this ) );

		return cells;
	};


	return Cell;
} );