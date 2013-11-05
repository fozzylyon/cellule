define( function ( require ) {
	'use strict';

	var THREE = require( 'THREE' );
	var Cell  = require( 'Cell' );


	var $ecosystem = $( '#ecosystem' );

	var width = $ecosystem.height();
	var height = $ecosystem.width();

	var scene  = new THREE.Scene();
	var camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
	scene.add( camera );

	var renderer = new THREE.WebGLRenderer();
	camera.position.z = 300;

	// start the renderer
	renderer.setSize( width, height );

	$ecosystem.append( renderer.domElement );


	// create a point light
	var pointLight = new THREE.PointLight(0xFFFFFF);

	// set its position
	pointLight.position.x = 10;
	pointLight.position.y = 50;
	pointLight.position.z = 130;

	// add to the scene
	scene.add(pointLight);

	var cell = new Cell( null, { 'scene' : scene } );
	cell.step();



	// shim layer with setTimeout fallback
	var requestAnimFrame = (function(){
	  return  window.requestAnimationFrame       ||
	          window.webkitRequestAnimationFrame ||
	          window.mozRequestAnimationFrame    ||
	          function( callback ){
	            window.setTimeout(callback, 1000 / 60);
	          };
	})();


	// usage:
	// instead of setInterval(render, 16) ....

	(function render(){
		requestAnimFrame(render);

		cell.step();
		renderer.render( scene, camera );
	})();


} );