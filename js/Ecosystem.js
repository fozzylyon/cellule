define( function ( require ) {
	'use strict';

	var _      = require( 'underscore' );
	var Cell   = require( 'Cell' );
	var THREE  = require( 'THREE' );
	var Octree = require( 'Octree' );

	var Ecosystem = function ( options ) {
		this.scene = options.scene;
		this.renderer = options.renderer;
		this.camera = options.camera;
		this.animateFrame = options.animateFrame;

		this.cells = [];
		// this.cellsSearch = [];
		this.cellCountMax = 300;
		this.radius = 5;
		this.radiusMax = this.radius * 1;
		this.radiusMaxHalf = this.radiusMax * 0.5;
		this.radiusSearch = 5;
		this.spawning = true;

		this.initialize();
	};

	Ecosystem.prototype.initialize = function () {
		// create octree
		this.octree = new THREE.Octree( {
			'radius' : this.radius,
			'overlapPct' : 0.05,
			'scene' : this.scene
		} );

		this.rayCaster = new THREE.Raycaster();

		// create object to show search radius and add to scene
		// this.searchMesh = new THREE.Mesh(
		// 	new THREE.SphereGeometry( this.radiusSearch ),
		// 	new THREE.MeshBasicMaterial( {
		// 		'color'       : 0x00FF00,
		// 		'transparent' : true,
		// 		'opacity'     : 0.25
		// 	} )
		// );
		// this.scene.add( this.searchMesh );
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

			var intersects = this.getPossibleIntersects( cell );
			if ( intersects.length > 1 ) {
				cell.material.color.setRGB( cell.material.color.r * 1.0005, cell.material.color.g * 1.0005, cell.material.color.b * 1.0005 );
			}
		}.bind( this ) );
	};


	Ecosystem.prototype.updateOctree = function () {
		this.octree.update();
		this.octree.rebuild();
	};


	Ecosystem.prototype.getPossibleIntersects = function ( cell ) {

		// this.searchMesh.position.set(
		// 			Math.random() * this.radiusMax - this.radiusMaxHalf,
		// 			Math.random() * this.radiusMax - this.radiusMaxHalf,
		// 			Math.random() * this.radiusMax - this.radiusMaxHalf
		// 		);

		// var rayCaster = new THREE.Raycaster( new THREE.Vector3().copy( this.searchMesh.position ), new THREE.Vector3( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 ).normalize() );
		// this.cellsSearch = this.octree.search( rayCaster.ray.origin, this.radiusSearch, true, rayCaster.ray.direction );
		// var intersections = rayCaster.intersectOctreeObjects( this.cellsSearch );
		//var caster = new THREE.Raycaster( cell.position, cell.target )
		this.rayCaster.set( new THREE.Vector3().copy( cell.position ), new THREE.Vector3().copy( cell.target ) );
		//var cells = this.octree.search( caster.ray.origin, 50, true, caster.ray.direction );
		var cellSearch = this.octree.search( this.rayCaster.ray.origin, 5, true, this.rayCaster.ray.direction );
		var intersections = this.rayCaster.intersectOctreeObjects( cellSearch );
		if ( cellSearch.length > 1 ) console.log( "cellSearch.length:", cellSearch.length );
		if ( intersections.length > 1 ) console.log( "intersections.length:", intersections.length );
		// var intersections = caster.intersectOctreeObjects( cells );
		// console.log( "intersections.length:", intersections.length );
		// console.log( "this.cellSearch.length:", this.cellSearch.length );
		// console.log( "cells:", cells );
		return intersections;
	};

	return Ecosystem;
} );