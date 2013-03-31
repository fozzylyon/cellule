define( function ( require ) {
	'use strict';

	var _        = require( 'underscore' );
	var bean     = require( 'bean' );
	var toastr   = require( 'toastr' );
	var Creature = require( 'Creature' );

	var self;

	var $tick       = $( '#tick' );
	var $population = $( '#population' );
	var $births     = $( '#births' );
	var $deaths     = $( '#deaths' );

	var Ecosystem = function ( elementId ) {
		self = this;

		this.alive  = [];
		this.dead   = [];
		this.births = 0;
		this.time   = 0;

		paper.setup( document.getElementById( elementId ) );
		paper.project.view.draw();
		view.draw();

		for ( var i = 0; i < 200; i++ ) {
			this.alive.push( new Creature() );
		}
		bean.fire( window, 'Ecosystem:populated' );

		view.onFrame = this.tick;

		setInterval( this.update, 1000 );

		bean.on( window, 'Creature:new', this.add );
	};

	Ecosystem.prototype.update = function () {
		$tick.html( self.time );
		$population.html( self.alive.length );
		$births.html( self.births );
		$deaths.html( self.dead.length );

		self._drawPopulationPieChart();
	};

	Ecosystem.prototype.tick = function ( event ) {
		self.time += 1;

		self.alive.forEach( function ( creature, index ) {
			if ( creature.energy < -1 ) {
				self.dead.push( creature );
				self.alive.splice( index, 1);
			}

			creature.step();
		} );
	};

	Ecosystem.prototype.add = function ( creature ) {
		self.births += 1;

		self.alive.push( creature );
	};

	Ecosystem.prototype.map = function () {
		var mapped = {};

		self.alive.forEach( function ( value, key ) {
			if ( !mapped[ value.color ] ) {
				mapped[ value.color ] = [];
			}

			mapped[ value.color ].push( value );
		} );

		return mapped;
	};

	Ecosystem.prototype._drawPopulationPieChart = function () {
		var mapped = self.map();
		var data   = [];

		Object.keys( mapped ).forEach( function ( key ) {
			var value = mapped[ key ];

			data.push( [ key, value.length ] );
		} );

		data.unshift( [ 'Color', 'Population' ] );

		var options = {
			'colors' : Object.keys( mapped ),
			'legend' : { 'textStyle' : { 'color' : '#EFEFEF' } },

			'backgroundColor' : {
				'fill'   : '#000',
				'stroke' : '#000'
			},
			'pieSliceBorderColor' : '#000',
			'pieSliceTextStyle'   : { 'color' : '#000' }
		};

		var chart = new google.visualization.PieChart( document.getElementById( 'population-pie-chart' ) );
		chart.draw( google.visualization.arrayToDataTable( data ), options );
	};

	return Ecosystem;
} );