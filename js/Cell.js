define( function ( require ) {
	'use strict';

	var _     = require( 'underscore' );
	var THREE = require( 'THREE' );
	var TWEEN = require( 'TWEEN' );

	var Traits = require( 'Traits' );

	var Cell = function ( options ) {
		options = options || {};

		THREE.Mesh.call( this );

		this.traits     = _.extend( Traits.getRandom(), options.traits );
        this.geometry   = options.geometry || this.getGeometry();
        this.material   = options.material || this.getMaterial();
        this.position   = options.position || this.getRandomPoint();
        this.energy     = options.energy || 100;
        this.nextMating = options.nextMating || 100;
        this.canMate    = options.canMate || false;
        this.ecosystem  = options.ecosystem;

        this.rotation.y = 0.8;
	};

	Cell.prototype = Object.create( THREE.Mesh.prototype );

	Cell.prototype.getMaterial = function () {
		return new THREE.MeshBasicMaterial( { 'color' : this.traits.color } );
	};

	// Returns different geometry for the different genders
	Cell.prototype.getGeometry = function () {

		if ( this.traits.gender === 'female' ) {
			return new THREE.SphereGeometry( this.traits.size, 12, 12 );
		}

		return new THREE.TetrahedronGeometry( this.traits.size * 1.75, 0 );
	};

	Cell.prototype.update = function () {
		this.detectIntersects();
		this.resetColor();
		this.move();

		if ( this.ecosystem.tick > this.nextMating ) {
			this.canMate = true;
		}
	};

	Cell.prototype.reproduce = function ( mate ) {

		console.log( 'check mating' );

		if ( !this.canMate ) {
			return;
		}

		if ( !mate.canMate ) {
			return;
		}

		this.nextMating += 1000;
		mate.nextMating += 1000;

		this.canMate = false;
		mate.canMate = false;

		var cell = new Cell( {
			'position'   : this.position.clone(),
			'nextMating' : this.ecosystem.tick + 5000,
			'canMate'    : false,

			'traits' : {
				'color'    : this.traits.color,
				'sight'    : this.traits.sight,
				'strength' : this.traits.strength,
				'size'     : this.traits.size,
				'movement' : this.traits.movement,
				'speed'    : this.traits.speed,
				'gender'   : this.traits.gender
			}
		} );

		this.ecosystem.spawnCell( cell );
	};

	Cell.prototype.resetColor = function () {
		setTimeout( function () {
			this.setColor( this.traits.color );
		}.bind( this ), 500 );
	};

	Cell.prototype.setColor = function ( color ) {
		this.material.color.set( color );
	};

	Cell.prototype.move = function () {
		if ( !this.target ) {
			this.tween();
		} else if ( this.position.x === this.target.x && this.position.y === this.target.y ) {
			this.tween();
		}

		this.updatePath();
	};

	Cell.prototype.tween = function () {
		this.target = this.getRandomPoint();

		var distance = this.position.distanceTo( this.target );
		var time     = distance / this.traits.speed * this.ecosystem.viscosity;

		new TWEEN.Tween( this.position ).to( this.target, time )
			.easing( this.traits.movement )
			.start();
	};

	Cell.prototype.addPath = function () {
		var mat = new THREE.LineDashedMaterial( {
			'color'       : this.traits.color,
			'opacity'     : 0.05,
			'transparent' : true
		} );

		this.path = new THREE.Line( new THREE.Geometry(), mat );
		this.parent.add( this.path );
	};

	Cell.prototype.removePath = function () {
		this.parent.remove( this.path );
		this.path = null;
	};

	Cell.prototype.updatePath = function () {
		if ( !this.path ) {
			this.addPath();
		}

		this.path.geometry.vertices = [ this.position, this.target ];
		this.path.geometry.verticesNeedUpdate = true;
	};

	Cell.prototype.getRandomPoint = function () {
		var minX = 0 + this.traits.size + 1;
		var maxX = window.innerWidth - this.traits.size - 1;

		var minY = 0 + this.traits.size + 1;
		var maxY = window.innerHeight - this.traits.size - 1;

		var minZ = 0 + this.traits.size + 1;
		var maxZ = window.innerHeight - this.traits.size - 1;

		var x = Math.floor( Math.random() * ( maxX - minX ) + minX );
		var y = Math.floor( Math.random() * ( maxY - minY ) + minY );
		var z = 0.5 || Math.floor( Math.random() * ( maxZ - minZ ) + minZ );

		return new THREE.Vector3( x, y, z );
	};

	Cell.prototype.detectIntersects = function () {
		var i;

		var position   = this.position;
		var intersects = [];

		// Maximum distance from the origin before we consider collision
		var cells = this.ecosystem.octree.search( position, 5, true );
		if ( cells.length === 1 ) {
			return intersects;
		}

		// For each ray
		for ( i = 0; i < this.ecosystem.rays.length; i += 1 ) {

			// We reset the raycaster to this direction
			this.ecosystem.rayCaster.set( position, this.ecosystem.rays[ i ] );

			// Test if we intersect with any obstacle mesh
			intersects = this.ecosystem.rayCaster.intersectOctreeObjects( cells );

			if ( intersects.length > 0 ) {
				// TODO: Loop over intersections (only does one)
				this.handleIntersect( intersects[ 0 ] );
			}

		}
	};

	Cell.prototype.handleIntersect = function ( target ) {
		var intersectDistance = target.distance;
		if ( intersectDistance <= this.traits.size ) {
			// collision
			if (
				this.ecosystem.tick > this.nextMating &&
				this.ecosystem.tick > target.object.nextMating &&
				this.traits.color === target.object.traits.color &&
				this.traits.gender !== target.object.traits.gender &&
				this.traits.gender === 'female'
			) {
				this.reproduce( target.object );
			}
			this.setColor( 0xFF0000 );
		} else {
			// in sight
		}
	};

	return Cell;
} );