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
	var camera     = new THREE.OrthographicCamera( 0, width, 0, height, .5, 1000 );//new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 500 * 100 );

	scene.add( camera );

	var renderer = new THREE.WebGLRenderer();
	camera.position.z = 300;

	// start the renderer
	renderer.setSize( width, height );

	$ecosystem.append( renderer.domElement );

	// create a point light
	var pointLight = new THREE.PointLight( 0xFFFFFF );

	// set its position
	pointLight.position.x = 10;
	pointLight.position.y = 50;
	pointLight.position.z = 130;

	// add to the scene
	scene.add(pointLight);


	// stats
	var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	$ecosystem.append( stats.domElement );


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

		var timer = - Date.now() / 5000;

		// camera.position.x = Math.cos( timer ) * 10000;
		// camera.position.z = Math.sin( timer ) * 10000;
		// camera.position.x += 1;
		// camera.position.y += 1;
		// camera.position.z += 1;
		// camera.lookAt( scene.position );

		renderer.render( scene, camera );
	}

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

} );