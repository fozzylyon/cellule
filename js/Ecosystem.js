define( function ( require ) {
	'use strict';

	var _      = require( 'underscore' );
	var Cell   = require( 'Cell' );
	var THREE  = require( 'THREE' );
	var Octree = require( 'Octree' );

	var Ecosystem = function ( options ) {
		this.scene        = options.scene;
		this.renderer     = options.renderer;
		this.camera       = options.camera;
		this.animateFrame = options.animateFrame;

		this.cells          = [];
		this.cellCountMax   = 300;
		this.radius         = 5;
		this.radiusMax      = this.radius * 1;
		this.radiusMaxHalf  = this.radiusMax * 0.5;
		this.radiusSearch   = 5;
		this.spawning       = true;

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
		}.bind( this ) );
	};


	Ecosystem.prototype.updateOctree = function () {
		this.octree.update();
		this.octree.rebuild();
	};

	return Ecosystem;
} );