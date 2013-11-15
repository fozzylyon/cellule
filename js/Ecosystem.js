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
		this.cellCountMax = 50;
		this.spawning = true;
		this.intersections = [];

		// search vars
		this.radius = 10;
		this.radiusMax = this.radius * 1.5;
		this.radiusMaxHalf = this.radiusMax * 0.5;

		// ray collision
		this.rayCaster = new THREE.Raycaster();
		this.rayCaster.far = this.radiusMax;
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

		// create octree
		this.octree = new THREE.Octree( {
			'radius'           : this.radius,
			'overlapPct'       : 0.15,
			'scene'            : this.scene,
			'objectsThreshold' : 2
		} );
	};

	Ecosystem.prototype.spawnCell = function () {
		// create new object
		var cell = new Cell();
		cell.ecosystem = this;
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
		}.bind( this ) );
	};


	Ecosystem.prototype.updateOctree = function () {
		this.octree.update();
		this.octree.rebuild();
	};

	return Ecosystem;
} );