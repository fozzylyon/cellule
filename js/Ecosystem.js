define( function ( require ) {
	'use strict';

	var _      = require( 'underscore' );
	var Cell   = require( 'Cell' );
	var THREE  = require( 'THREE' );
	var Octree = require( 'Octree' );

	var Ecosystem = function ( options ) {
		this.scene   = options.scene;
		this.camera  = options.camera;

		this.initialize();
	};

	Ecosystem.prototype.initialize = function () {

		// cell vars
		this.cells = [];
		this.cellCountMax = 5;
		this.spawning = true;
		this.intersections = [];

		// search vars
		this.radius = 10;
		this.radiusMax = this.radius * 1.5;
		this.radiusMaxHalf = this.radiusMax * 0.5;


		// create octree
		this.octree = new THREE.Octree( {
			'radius'           : this.radius,
			'overlapPct'       : 0.15,
			'scene'            : this.scene,
			'objectsThreshold' : 2
		} );

		this.rayCaster = new THREE.Raycaster();
		// this.rayCaster.far = this.radiusMax;
	};

	Ecosystem.prototype.spawnCell = function () {
		// create new object
		var cell = new Cell( null, { 'scene' : this.scene, 'octree' : this.octree, 'ecosystem' : this } );

		// add new object to octree and scene
		// this.octree.add( cell );
		// this.scene.add( cell );

		// store object for later
		this.cells.push( cell );
	};

	Ecosystem.prototype.update = function () {
		// if at max, stop this.spawning
		if ( this.cells.length === this.cellCountMax ) {
			this.spawning = false;
		}
		// else spawn another
		else if ( this.spawning === true ) {
			this.spawnCell();
		}

		_.each( this.cells, function ( cell ) {
			cell.update();

			// var intersects = this.getPossibleIntersects( cell );
			// if ( intersects.length > 1 ) {
			// 	cell.graphic.material.color.setRGB( cell.graphic.material.color.r * 1.5, cell.graphic.material.color.g * 1.5, cell.graphic.material.color.b * 1.5 );
			// }
		}.bind( this ) );
	};


	Ecosystem.prototype.updateOctree = function () {
		this.octree.update();
		this.octree.rebuild();
	};


	Ecosystem.prototype.getPossibleIntersects = function ( cell ) {

		if ( !this.rays ) {
			this.rays = [
				new THREE.Vector3( -1, 0, 0),
				new THREE.Vector3( -1, 1, 0),
				new THREE.Vector3( 0, 1, 0),
				new THREE.Vector3( 1, 1, 0),
				new THREE.Vector3( 1, 0, 0),
				new THREE.Vector3( 1, -1, 0),
				new THREE.Vector3( 0, -1, 0),
				new THREE.Vector3( -1, -1, 0 )
			];
		}

		this.intersections.length = 0;


		var cellSearch = this.octree.search( cell.position, this.radius, true );

		this.rays.forEach( function ( ray, index ) {
			this.rayCaster.set( cell.position, ray );
			this.intersections.concat( this.rayCaster.intersectOctreeObjects( cellSearch ) );

		}.bind( this ) );

		if ( this.intersections.length > 0 ) {
			console.log( "intersections.length:", this.intersections.length );
		}

		return this.intersections;
	};

	return Ecosystem;
} );