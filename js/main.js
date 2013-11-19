define( function ( require ) {
	'use strict';

	var $               = require( 'jquery' );
	var THREE           = require( 'THREE' );
	var Octree          = require( 'Octree' );
	var OrbitControls   = require( 'OrbitControls' );
	var TWEEN           = require( 'TWEEN' );
	var Ecosystem       = require( 'Ecosystem' );
	var EcosystemConfig = require( 'EcosystemConfig' );

	var $container = $( 'body' );
	var width      = EcosystemConfig.width;
	var height     = EcosystemConfig.height;
	var depth      = EcosystemConfig.depth;
	var scene      = new THREE.Scene();
	var camera     = new THREE.PerspectiveCamera( 60, width / height, 1, 10000 );

	var controls = new THREE.OrbitControls( camera );
	controls.target = new THREE.Vector3( width / 2, height / 2,  depth / 2 );

	scene.add( camera );

	var renderer = new THREE.WebGLRenderer();

	// start the renderer
	renderer.setSize( width, height );

	$container.append( renderer.domElement );

	// create a directional light
	var light = new THREE.DirectionalLight( 0xFF8888 );

	// set its position
	light.position.x = 10;
	light.position.y = 50;
	light.position.z = 130;
	// add to the scene
	scene.add( light );


	// create a directional light
	var blueLight = new THREE.DirectionalLight( 0x8888FF );
	// set its position
	blueLight.position.x = -10;
	blueLight.position.y = -50;
	blueLight.position.z = -130;

	// add to the scene
	scene.add( blueLight );


	// stats
	var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	$container.append( stats.domElement );


	var requestAnimFrame = ( function () {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function ( callback ) {
			window.setTimeout(callback, 1000 / 60);
		};
	} )();


	var ecosystem = new Ecosystem( {
		'scene'    : scene,
		'camera'   : camera
	} );

	var render = function () {
		renderer.render( scene, camera );
	};

	var animate = function () {
		// note: three.js includes requestAnimationFrame shim
		requestAnimFrame( animate );

		controls.update();

		// update ecosystem
		ecosystem.update();

		// tween
		TWEEN.update();

		// render results
		render();

		// update octree to add deferred objects
		ecosystem.updateOctree();

	};

	animate();

} );