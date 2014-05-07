define( function ( require ) {
	'use strict';

	var _      = require( 'underscore' );
	var $      = require( 'jquery' );
	var Pixi   = require( 'Pixi' );
	var Matter = require( 'matter' );

	var Ecosystem = require( 'Ecosystem' );

	var $container = $.find( 'container' );

	var stats = new Stats();
	stats.setMode(1); // 0: fps, 1: ms

	// Align top-left
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';

	document.body.appendChild( stats.domElement );

	$(window).resize(resize)
	window.onorientationchange = resize;

	var options = {
	    'positionIterations' : 6,
	    'velocityIterations' : 4,
	    'enableSleeping'     : false
	};

	var engine = Matter.Engine.create( $container, options );

	var _mouseConstraint = MouseConstraint.create(_engine);
  Matter.World.add(_engine.world, _mouseConstraint);
	Engine.run(_engine);

	var w = 1024;
	var h = 768;
	var renderer = Pixi.autoDetectRenderer(w, h);
	var stage = new Pixi.Stage();
	document.body.appendChild( renderer.view );

	var sx        = 1.0 + (Math.random() / 20);
	var sy        = 1.0 + (Math.random() / 20);
	var slideX    = w / 2;
	var slideY    = h / 2;

	var ecosystem = new Ecosystem( {
		'renderer' : renderer,
		'stage'    : stage
	} );


	function resize()
	{
		w = $(window).width() - 16;
		h = $(window).height() - 16;

		slideX = w / 2;
		slideY = h / 2;

		renderer.resize(w, h);
	}

	function animate()
	{
		stats.begin();

		ecosystem.update();

		renderer.render( stage );

		requestAnimFrame( animate );

		stats.end();
	}

animate();

	// var requestAnimFrame = ( function () {
	// 	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function ( callback ) {
	// 		window.setTimeout(callback, 1000 / 60);
	// 	};
	// } )();

	// var stats = new Stats();
	// stats.setMode(1); // 0: fps, 1: ms
	//
	// // Align top-left
	// stats.domElement.style.position = 'absolute';
	// stats.domElement.style.left = '0px';
	// stats.domElement.style.top = '0px';
	//
	// document.body.appendChild( stats.domElement );
	//
	// var animate = function () {
	// 	stats.begin();
	//
	// 	thing.clear();
	//
	// 	count += 0.1;
	//
	// 	thing.clear();
	// 	thing.lineStyle(30, 0xff0000, 1);
	// 	thing.beginFill(0xffFF00, 0.5);
	//
	// 	thing.moveTo(-120 + Math.sin(count) * 20, -100 + Math.cos(count)* 20);
	// 	thing.lineTo(120 + Math.cos(count) * 20, -100 + Math.sin(count)* 20);
	// 	thing.lineTo(120 + Math.sin(count) * 20, 100 + Math.cos(count)* 20);
	// 	thing.lineTo(-120 + Math.cos(count)* 20, 100 + Math.sin(count)* 20);
	// 	thing.lineTo(-120 + Math.sin(count) * 20, -100 + Math.cos(count)* 20);
	//
	// 	thing.rotation = count * 0.1;
	//     renderer.render(stage);
	//
	// 	requestAnimFrame( animate );
	//
	// 	stats.end();
	// };
	//
	// requestAnimFrame( animate );

} );
