define( function ( require ) {
	'use strict';

	var $         = require( 'jquery' );
	var THREE     = require( 'THREE' );
	var TWEEN     = require( 'TWEEN' );
	var Ecosystem = require( 'Ecosystem' );

	var $ecosystem = $( '#ecosystem' );
	var width      = window.innerWidth;
	var height     = window.innerHeight;
	var scene      = new THREE.Scene();
	var camera     = new THREE.OrthographicCamera( 0, width, 0, height, 1, 1000 );

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

	// shim layer with setTimeout fallback
	var requestAnimFrame = ( function () {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function ( callback ) {
			window.setTimeout(callback, 1000 / 60);
		};
	} )();

	var ecosystem = new Ecosystem( { 'scene' : scene } );

	// stats
	var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	$ecosystem.append( stats.domElement );


	( function render () {
		requestAnimFrame( render );
		stats.update();
		ecosystem.step();
		TWEEN.update();
		renderer.render( scene, camera );
	} )();



} );