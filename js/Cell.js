define( function ( require ) {
	'use strict';

	var _     = require( 'underscore' );
	var THREE = require( 'THREE' );
	var TWEEN = require( 'TWEEN' );

	var Traits = require( 'Traits' );

	var Cell = function ( options ) {
		options = options || {};

		THREE.Mesh.call( this );

		this.ecosystem  = options.ecosystem;
		this.traits     = _.extend( Traits.getRandom(), options.traits );
		this.geometry   = options.geometry || this.getGeometry();
		this.material   = options.material || this.getMaterial();
		this.position   = options.position || this.getStartingPoint();
		this.energy     = options.energy || 100;
		this.nextMating = options.nextMating || 100;
		this.canMate    = options.canMate || false;
		this.canMove    = options.canMove || true;

		// this.scale = new THREE.Vector3( 0.5, 0.5, 0.5 );
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
		if ( this.checkMating ) {
			return;
		}
		this.checkMating = true;

		if ( !this.canMate ) {
			return;
		}

		if ( !mate.canMate ) {
			return;
		}

		mate.nextMating = this.ecosystem.tick + 1000;

		this.canMate = false;
		mate.canMate = false;

		this.stop();


		setTimeout( function () {
			this.nextMating = this.ecosystem.tick + 1000;

			var cell = new Cell( {
				'ecosystem'  : this.ecosystem,
				'position'   : this.position.clone(),
				'nextMating' : this.ecosystem.tick + 5000,
				'canMate'    : false,
				'traits'     : Traits.mergeTraits( this.traits, mate.traits )
			} );

			console.log( 'spawning a new cell', cell.traits );

			this.ecosystem.spawnCell( cell );

			this.start();
		}.bind( this ), 5000 );

		this.checkMating = false;
	};

	Cell.prototype.stop = function () {
		this.canMove = false;
		this.target  = null;
		this.tween.stop();
		this.removePath();
	};

	Cell.prototype.start = function () {
		this.canMove = true;
		this.target  = null;
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
		if ( !this.canMove ) {
			return;
		}

		if ( !this.target ) {
			return this.startTween();
		} else if ( this.position.distanceTo( this.target ) < this.ecosystem.targetTolerance ) {
			return this.startTween();
		}

		// this.updatePath();
	};

	Cell.prototype.startTween = function () {
		this.target = this.getRandomPoint();

		var distance = this.position.distanceTo( this.target );
		var time     = distance / this.traits.speed * this.ecosystem.viscosity;

		this.tween = new TWEEN.Tween( this.position ).to( this.target, time )
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

	Cell.prototype.getStartingPoint = function ( entire ) {
		return this.ecosystem.getRandomPosition();
	};

	Cell.prototype.getRandomPoint = function () {
		var min      = this.traits.size * 5;
		var max      = this.traits.sight * 10;
		var distanceVector = new THREE.Vector3( _.random( min, max ), _.random( min, max ), _.random( min, max ) ).normalize();

		var randomVector = this.ecosystem.getRandomPosition();
		return new THREE.Vector3().subVectors( distanceVector, randomVector ).negate();
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