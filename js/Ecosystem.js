define( function ( require ) {
	'use strict';

	var _               = require( 'underscore' );
	var $               = require( 'jquery' );
	var Matter           = require( 'Matter' );
	var Cell            = require( 'Cell' );
	var EcosystemConfig = require( 'EcosystemConfig' );
	// var $population     = $( '#population' );

	var Ecosystem = function ( options ) {
		this.world;
		this.renderer = options.renderer;
		this.stage    = options.stage;
		this.tick     = 0;
		// this.world    = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10),  true);

		this.initialize();
	};

	Ecosystem.prototype.initialize = function () {

		// `ecosystem` variables
		_.extend( this, EcosystemConfig );

		// this.geometry = new THREE.CylinderGeometry( this.height, this.width, this.depth, 24 );
		// var mat = new THREE.MeshBasicMaterial( { 'transparent' : true, 'opacity' : 0.01 } );
		// this.boundingMesh = new THREE.Mesh( this.geometry, mat );
		// this.boundingMesh.scale.x = 2;
		// this.boundingMesh.scale.z = 2;
		// this.scene.add( this.boundingMesh );


		// cell vars
		this.cells    = [];
		this.bodies   = [];
		this.spawning = true;

		// ray collision
		// this.rayCaster = new THREE.Raycaster();
		// this.rays = [
		// 	new THREE.Vector3( -1, 0, 0),
		// 	new THREE.Vector3( -1, 1, 0),
		// 	new THREE.Vector3( 0, 1, 0),
		// 	new THREE.Vector3( 1, 1, 0),
		// 	new THREE.Vector3( 1, 0, 0),
		// 	new THREE.Vector3( 1, -1, 0),
		// 	new THREE.Vector3( 0, -1, 0),
		// 	new THREE.Vector3( -1, -1, 0 ),
		//
		// 	new THREE.Vector3( 0, 1, -1),
		// 	new THREE.Vector3( 0, 0, -1),
		// 	new THREE.Vector3( 0, -1, -1),
		// 	new THREE.Vector3( 0, -1, 1),
		// 	new THREE.Vector3( 0, 0, 1),
		// 	new THREE.Vector3( 0, 1, 1),
		//
		// ];

		// create octree
		// this.octree = new THREE.Octree( {
		// 	'scene'      : this.scene,
		// 	'overlapPct' : 0.25,
		// 	'objectsThreshold' : 100
		// } );
	};

	Ecosystem.prototype.getRandomPosition = function () {
		// return THREE.GeometryUtils.randomPointsInGeometry( this.geometry, 1 )[ 0 ];
	};

	Ecosystem.prototype.spawnCell = function ( cell ) {

		// create new object
		cell = cell || new Cell( { 'ecosystem' : this } );

		// add to stage
		this.stage.addChild( cell );
		cell.position.x = _.random(0,this.renderer.width);
		cell.position.y = _.random(0,this.renderer.height);
		cell.body.position.x = _.random(0,this.renderer.width);
		cell.body.position.y = _.random(0,this.renderer.height);

		// store object for later
		this.cells.push( cell );
		this.bodies.push( cell.body );
	};

	Ecosystem.prototype.removeCell = function ( cell ) {
		this.octree.remove( cell );
		// this.scene.remove( cell );
		this.cells = _.without( this.cells, cell );
	};


	Ecosystem.prototype.newWave = function () {
		// sx = 1.0 + (Math.random() / 20);
		// sy = 1.0 + (Math.random() / 20);
		// document.getElementById('sx').innerHTML = 'SX: ' + sx + '<br />SY: ' + sy;
	}

	Ecosystem.prototype.update = function () {

		this.tick++;

		if ( this.tick % 100 === 0 ) {
			console.log( this.tick + ' ticks', '(', this.cells.length, ')' );
			// $population.html( this.cells.length );
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

	return Ecosystem;
} );
