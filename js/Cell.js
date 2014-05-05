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

		this.rotation.y = 0.8;
		this.scale = new THREE.Vector3( this.ecosystem.cellScale, this.ecosystem.cellScale, this.ecosystem.cellScale );
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
		if ( !this.canMove ) {
			return;
		}
		if ( !this.targetCell ) {
			this.detectIntersects();
		}
		this.move();

		if ( !this.sight ) {
			// this.sight = new THREE.Mesh( new THREE.SphereGeometry( 100, 12, 12 ), new THREE.MeshBasicMaterial( { 'color' : this.traits.color, 'transparent' : true, 'opacity' : 0.05 } ) );
			// this.parent.add( this.sight );
		}

		if ( this.ecosystem.tick > this.nextMating ) {
			this.canMate = true;
		}
		this.metabolize();
	};

	Cell.prototype.metabolize = function () {
		this.energy -= ( this.traits.metabolicRate / this.ecosystem.viscosity );
		if ( this.energy <= 0 ) {
			this.expire();
		}
	};

	Cell.prototype.expire = function () {
		this.setColor( 0x333333 );
		this.scale = new THREE.Vector3( 10, 10, 10 );
		this.stop();
		this.ecosystem.removeCell( this );
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

	Cell.prototype.setColor = function ( color ) {
		this.material.color.set( color );
	};

	Cell.prototype.move = function () {
		if ( !this.canMove ) {
			return;
		}

		if ( !this.target ) {
			return this.startTween();
		} else if ( this.position.distanceTo( this.target ) < this.traits.size ) {
			this.targetCell = undefined;
			return this.startTween();
		}

		this.updatePath();
	};

	Cell.prototype.startTween = function ( destination ) {
		this.target = destination || this.getRandomPoint();

		var distance = this.position.distanceTo( this.target );
		var time     = distance / this.traits.speed * this.ecosystem.viscosity;

		this.tween = new TWEEN.Tween( this.position ).to( this.target, time )
			.easing( this.traits.movement )
			.onUpdate( function () {
				// this.sight.position = this.position;
			}.bind( this ) )
			.start();
	};

	Cell.prototype.addPath = function () {
		return;
		var mat = new THREE.LineDashedMaterial( {
			'color'       : this.traits.color,
			'opacity'     : 0.25,
			'transparent' : true
		} );

		this.path = new THREE.Line( new THREE.Geometry(), mat );
		this.parent.add( this.path );
	};

	Cell.prototype.removePath = function () {
		return;
		this.parent.remove( this.path );
		this.path = null;
	};

	Cell.prototype.updatePath = function () {
		return;
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
		var min      = this.traits.size;
		var max      = this.traits.sight;
		var distanceVector = new THREE.Vector3( _.random( min, max ), _.random( min, max ), _.random( min, max ) ).normalize();

		// console.log(distanceVector.x,distanceVector.y,distanceVector.z);
		var randomVector = this.ecosystem.getRandomPosition();
		return new THREE.Vector3().subVectors( distanceVector, randomVector ).negate();
	};

	Cell.prototype.detectIntersects = function () {
		var intersects = [];

		// Maximum distance from the origin before we consider collision
		var cells = this.ecosystem.octree.search( this.position, 200, true, this.target, 0.25 );
		// console.log( "cells.length:", cells.length );
		if ( cells.length === 1 ) {
			return intersects;
		}

		// For each ray
		this.ecosystem.rays.forEach( function ( ray, index ) {
			// We reset the raycaster to this direction
			this.ecosystem.rayCaster.set( this.position, ray, 0, 1000 );

			// Test if we intersect with any obstacle mesh
			intersects = this.ecosystem.rayCaster.intersectOctreeObjects( cells );
			if ( intersects.length ) {
				// console.log( "intersects:", intersects );
				this.handleIntersect( intersects[ 0 ] );
			}

		}.bind( this ) );

	};

	Cell.prototype.handleIntersect = function ( target ) {
			var intersectDistance = target.distance;
			var canTargetMate = this.canTargetMate( target.object );
			var collision = intersectDistance <= this.traits.size;

			// target is now the target cell
			target = target.object;

			// friend
			// console.log( "intersectDistance:", intersectDistance );
			if ( this.traits.color === target.traits.color ) {
				// console.log( '    :friendly' );
				if ( canTargetMate ) {
					this.targetCell = target;
					// mate
					// console.log( '    :canTargetmate' );
					if ( collision && this.traits.gender === 'female' ) {
						// console.log( 'collision' );
						this.reproduce( target );
					}
					// chase potential mate
					else {
						// console.log( 'chase' );
						this.changeTarget( target.position );
					}
				}
			}
			// enemy
			// if ( collision ) {
			// 	// collision
			// 	if ( canTargetMate && this.traits.gender === 'female' ) {

			// 	}
			// }
	};

	Cell.prototype.changeTarget = function ( vector ) {
		this.tween.stop();
		this.startTween( this.targetCell.position );
	};

	Cell.prototype.canTargetMate = function ( target ) {
		return (
			this.traits.color === target.traits.color &&
			this.traits.gender !== target.traits.gender &&
			this.canMate &&
			target.canMate
		);
	};

	Cell.prototype.choose = function () {
		// body...
	};

	return Cell;
} );
