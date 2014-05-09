define( function ( require ) {
	'use strict';

	var _               = require( 'underscore' );
	var $               = require( 'jquery' );
	var Matter          = require( 'Matter' );
	var Cell            = require( 'Cell' );
	var EcosystemConfig = require( 'EcosystemConfig' );

	var Ecosystem = function ( options ) {
		this.gui             = options.gui;
		this.engine          = options.engine;
		this.mouseConstraint = options.mouseConstraint;

		this.initialize();
	};

	Ecosystem.prototype.reset = function () {
		var world = this.engine.world;

		Matter.Ecosystem.clear(world);
		Matter.Engine.clear(this.engine);

		// clear scene graph (if defined in controller)
		var renderController = this.engine.render.controller;
		if (renderController.clear)
		    renderController.clear(this.engine.render);

		// clear all scene events
		for (var i = 0; i < _sceneEvents.length; i++)
		    Events.off(this.engine, _sceneEvents[i]);
		_sceneEvents = [];

		// reset id pool
		Common._nextId = 0;

		// reset mouse offset and scale (only required for Demo.views)
		Mouse.setScale(this.engine.input.mouse, { x: 1, y: 1 });
		Mouse.setOffset(this.engine.input.mouse, { x: 0, y: 0 });

		this.engine.enableSleeping = false;
		this.engine.world.gravity.y = 1;
		this.engine.world.gravity.x = 0;
		this.engine.timing.timeScale = 1;

		var offset = 5;
		Matter.World.add(world, [
		    Bodies.rectangle(400, -offset, 800.5 + 2 * offset, 50.5, { isStatic: true }),
		    Bodies.rectangle(400, 600 + offset, 800.5 + 2 * offset, 50.5, { isStatic: true }),
		    Bodies.rectangle(800 + offset, 300, 50.5, 600.5 + 2 * offset, { isStatic: true }),
		    Bodies.rectangle(-offset, 300, 50.5, 600.5 + 2 * offset, { isStatic: true })
		]);

		this.mouseConstraint = Matter.MouseConstraint.create(this.engine);
		Matter.World.add(world, this.mouseConstraint);

		var renderOptions = this.engine.render.options;
		renderOptions.wireframes = true;
		renderOptions.hasBounds = false;
		renderOptions.showDebug = false;
		renderOptions.showBroadphase = false;
		renderOptions.showBounds = false;
		renderOptions.showVelocity = false;
		renderOptions.showCollisions = false;
		renderOptions.showAxes = false;
		renderOptions.showPositions = false;
		renderOptions.showAngleIndicator = true;
		renderOptions.showIds = false;
		renderOptions.showShadows = false;
		renderOptions.background = '#fff';
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
