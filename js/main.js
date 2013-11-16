define( function ( require ) {
	'use strict';

	var $         = require( 'jquery' );
	var THREE     = require( 'THREE' );
	var Octree    = require( 'Octree' );
	var TWEEN     = require( 'TWEEN' );
	var Ecosystem = require( 'Ecosystem' );

	var $ecosystem = $( '#ecosystem' );
	var width      = window.innerWidth;
	var height     = window.innerHeight;
	var scene      = new THREE.Scene();
	var camera     = new THREE.OrthographicCamera( 0, width, 0, height, 1, 1000 );
	// var camera     = new THREE.PerspectiveCamera( 75, width / height, 1, 5000 * 100 );//new THREE.OrthographicCamera( 0, width, 0, height, .5, 1000 );

	scene.position.y = height / 2;
	scene.position.x = width / 2;
	scene.position.z = 0.5;
	scene.add( camera );

	var renderer = new THREE.WebGLRenderer();
	camera.position.z = 300;

	// start the renderer
	renderer.setSize( width, height );

	$ecosystem.append( renderer.domElement );

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
	// var stats = new Stats();
	// stats.domElement.style.position = 'absolute';
	// stats.domElement.style.top = '0px';
	// $ecosystem.append( stats.domElement );


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

		// var timer = - Date.now() / 10000;
		// camera.position.x = Math.cos( timer ) * 1000;
		// camera.position.y = Math.cos( timer ) * 1000;
		// camera.position.z = Math.sin( timer ) * 1000;
		// camera.lookAt( scene.position );

		renderer.render( scene, camera );
	};

	var animate = function () {
		// note: three.js includes requestAnimationFrame shim
		requestAnimFrame( animate );

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

	$( '#debugger' ).on( 'click', function () {
		debugger;
	} );

} );