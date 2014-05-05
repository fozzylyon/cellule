define( function ( require ) {
	'use strict';

	var $               = require( 'jquery' );
	var THREE           = require( 'THREE' );
	var Octree          = require( 'Octree' );
	var OrbitControls   = require( 'OrbitControls' );
	var TWEEN           = require( 'TWEEN' );
	var Ecosystem       = require( 'Ecosystem' );
	var EcosystemConfig = require( 'EcosystemConfig' );

	var width      = EcosystemConfig.width;
	var height     = EcosystemConfig.height;
	var depth      = EcosystemConfig.depth;

	var backgroundColor = 0x333333;

	var $container = $( 'body' );
	var scene      = new THREE.Scene();
	var camera     = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100000 );
	camera.position = new THREE.Vector3( 1500, 500, 1500 );

	// fog
	// scene.fog = new THREE.Fog( backgroundColor, 100, 2000 );

	// light
	var light = new THREE.DirectionalLight( 0xFFFFFF );
	light.position.x = width / 2;
	light.position.y = depth / 2;
	light.position.z = height * 2;
	scene.add( light );

	// controls
	var controls = new THREE.OrbitControls( camera );

	controls.target = new THREE.Vector3( 0, 100, 0 );
	scene.add( camera );

	// renderer
	var renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( backgroundColor, 1 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	$container.append( renderer.domElement );

	scene.add( new THREE.GridHelper( 1000, 50 ) );



	var windowResize = function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	};
	window.addEventListener( 'resize', windowResize, false );

	var requestAnimFrame = ( function () {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function ( callback ) {
			window.setTimeout(callback, 1000 / 60);
		};
	} )();

	var ecosystem = window.ecosystem = new Ecosystem( {
		'scene'    : scene,
		'camera'   : camera
	} );

	var render = function () {
		renderer.render( scene, camera );
	};

	var stats = new Stats();
	stats.setMode(1); // 0: fps, 1: ms

	// Align top-left
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';

	document.body.appendChild( stats.domElement );

	var animate = function () {
		stats.begin();

		requestAnimFrame( animate );
		controls.update();
		ecosystem.update();
		TWEEN.update();
		render();
		ecosystem.updateOctree();

		stats.end();
	};

	animate();

} );
