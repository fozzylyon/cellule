define( function ( require ) {
    'use strict';

    var Physics = require( 'Physics' );
    var Traits = require( 'Traits' );

    Physics.body( 'cell', function( parent ){
        var defaults = {
            'mass'        : 1,
            'restitution' : 1,
            'treatment'   : 'dynamic',
            'radius'      : 1,
            'styles'      : {
                'lineWidth' : 0,
                'fillStyle' : 0xFFFFFF
            }
        };

        return {
            'init' : function ( options ) {

                options = Physics.util.extend( {}, defaults, options );

                // call parent init method
                parent.init.call( this, options );

                this.geometry = Physics.geometry( 'circle', {
                    'radius': options.radius
                } );

                this.recalc();
            },

            'recalc' : function () {
                parent.recalc.call( this );
                // moment of inertia
                this.moi = this.mass * this.geometry.radius * this.geometry.radius / 2;
            }
        };
    });

} );
