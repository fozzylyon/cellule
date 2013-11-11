define( function ( require ) {
	'use strict';

	var _      = require( 'underscore' );
	var Cell   = require( 'Cell' );
	var THREE  = require( 'THREE' );
	var Octree = require( 'Octree' );

	var Ecosystem = function ( options ) {
		this.scene = options.scene;

		this.initialize();
	};

	Ecosystem.prototype.initialize = function () {

		// cell vars
		this.cells = [];
		this.cellCountMax = 16;
		this.spawning = true;
		this.intersections = [];

		// search vars
		this.radius = 20;
		this.radiusMax = this.radius * 1.5;
		this.radiusMaxHalf = this.radiusMax * 0.5;


		// create octree
		this.octree = new THREE.Octree( {
			'radius'     : this.radius,
			'overlapPct' : 0.25,
			'scene'      : this.scene
		} );

		this.rayCaster = new THREE.Raycaster();
		this.rayCaster.far = this.radiusMax;
	};

	Ecosystem.prototype.spawnCell = function () {
		// create new object
		var cell = new Cell();

		// add new object to octree and scene
		this.octree.add( cell );
		this.scene.add( cell );

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

			var intersects = this.getPossibleIntersects( cell );
			if ( intersects.length > 1 ) {
				cell.material.color.setRGB( cell.material.color.r * 1.0005, cell.material.color.g * 1.0005, cell.material.color.b * 1.0005 );
			}
		}.bind( this ) );
	};


	Ecosystem.prototype.updateOctree = function () {
		this.octree.update();
		this.octree.rebuild();
	};


	Ecosystem.prototype.getPossibleIntersects = function ( cell ) {

		this.intersections.length = 0;

		var origin = new THREE.Vector3().copy( cell.position );
		var end = new THREE.Vector3().copy( cell.target );
		this.rayCaster.set( origin, end );
		// console.log( "distance:", origin.distanceTo( end ) );
		//var cells = this.octree.search( caster.ray.origin, 50, true, caster.ray.direction );

		var cellSearch = this.octree.search( this.rayCaster.ray.origin, this.radius, true, this.rayCaster.ray.direction );
		console.log( "this.rayCaster.far:", this.rayCaster.far );
		this.intersections.concat( this.rayCaster.intersectOctreeObjects( cellSearch ) );

		if ( this.intersections.length > 0 ) console.log( "intersections.length:", this.intersections.length );

		return this.intersections;
	};

	return Ecosystem;
} );