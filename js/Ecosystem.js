define( function ( require ) {
	'use strict';

	var _             = require( 'underscore' );
	var Cell          = require( 'Cell' );
	var THREE         = require( 'THREE' );
	var Octree        = require( 'Octree' );
	var GeometryUtils = require( 'GeometryUtils' );

	var EcosystemConfig = require( 'EcosystemConfig' );


	var Ecosystem = function ( options ) {
		this.scene  = options.scene;
		this.camera = options.camera;
		this.tick   = 0;

		this.initialize();
	};

	Ecosystem.prototype.initialize = function () {

		// `ecosystem` variables
		_.extend( this, EcosystemConfig );

		this.geometry = new THREE.SphereGeometry( this.width, 24, 24 );

		// cell vars
		this.cells            = [];
		this.initialCellCount = 200;
		this.spawning         = true;
		this.intersections    = [];

		// search vars
		this.radius        = 10;
		this.radiusMax     = this.radius * 1.5;
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
			'objectsThreshold' : 8
		} );
	};

	Ecosystem.prototype.getRandomPosition = function () {
		return THREE.GeometryUtils.randomPointsInGeometry( this.geometry, 1 )[ 0 ];
	};

	Ecosystem.prototype.spawnCell = function ( cell ) {

		// create new object
		cell = cell || new Cell( { 'ecosystem' : this } );

		// add new object to octree and scene
		this.octree.add( cell );
		this.scene.add( cell );

		// store object for later
		this.cells.push( cell );
	};

	Ecosystem.prototype.removeCell = function ( cell ) {
		this.octree.remove( cell );
		this.scene.remove( cell );
		this.cells = _.without( this.cells, cell );
	};

	Ecosystem.prototype.update = function () {

		this.tick++;

		if ( this.tick % 250 === 0 ) {
			console.log( this.tick + ' ticks', '(', this.cells.length, ')' );
		}

		// if at max, stop this.spawning
		if ( this.cells.length === this.initialCellCount ) {
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