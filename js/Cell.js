define( function ( require ) {
	'use strict';

	var _     = require( 'underscore' );
	var THREE = require( 'THREE' );
	var TWEEN = require( 'TWEEN' );

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

	var viscosity = 1000;
	var colors    = [ 0xEFEFEF, 0xFF6348, 0xF2CB05, 0x49F09F, 0x52B0ED ];
	var min       = 1;
	var max       = 100;
	var minSpeed  = 10;

	// default cell traits
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

	var Cell = function ( geometry, material, traits ) {

		THREE.Mesh.call( this );

		this.traits = _.extend( defaults(), traits );
        this.geometry = geometry !== undefined ? geometry : this._getGeometry();
        this.material = material !== undefined ? material : this._getMaterial();

        this.position = this._getRandomPoint();
	};

	Cell.prototype = Object.create( THREE.Mesh.prototype );

	Cell.prototype._getMaterial = function () {
		return new THREE.MeshBasicMaterial( { 'color' : this.traits.color } );
	};

	Cell.prototype._getGeometry = function () {
		return new THREE.SphereGeometry( this.traits.size, 12, 12 );
	};

	Cell.prototype.update = function () {
		this._move();
	};

	Cell.prototype._move = function () {
		if ( !this.target ) {
			this._tween();
		} else if ( this.position.x === this.target.x && this.position.y === this.target.y && this.position.z === this.target.z ) {
			this._tween();
		}
		this._showPath();
	};

	Cell.prototype._tween = function () {
		this.target = this._getRandomPoint();

		var distance = this.position.distanceTo( this.target );
		var time     = distance / this.traits.speed * viscosity;

		this.tween = new TWEEN.Tween( this.position ).to( this.target, time );
		this.tween.easing( this.traits.movement );
		this.tween.start();
	};

	Cell.prototype._showPath = function () {
		if ( !this.path ) {
			var mat = new THREE.LineDashedMaterial( {
				'color'    : this.traits.color,
				'opacity'  : 0.333334,
				'transparent' : true
			} );
			this.path = new THREE.Line( new THREE.Geometry(), mat );
			this.parent.add( this.path );
		}
		this.path.geometry.vertices = [ this.position, this.target ];
		this.path.geometry.verticesNeedUpdate = true;
		// this.path
	};

	Cell.prototype._getRandomPoint = function () {
		var point;
		var minX = 0 + this.traits.size + 1;
		var maxX = window.innerWidth - this.traits.size - 1;

		var minY = 0 + this.traits.size + 1;
		var maxY = window.innerHeight - this.traits.size - 1;

		// var minZ = 0 + this.traits.size + 1;
		// var maxZ = 20 - this.traits.size - 1;

		var x = Math.floor( Math.random() * ( maxX - minX ) + minX );
		var y = Math.floor( Math.random() * ( maxY - minY ) + minY );
		// var z = Math.floor( Math.random() * ( maxZ - minZ ) + minZ );

		return new THREE.Vector3( x, y, 0.5);
	};

	return Cell;
} );