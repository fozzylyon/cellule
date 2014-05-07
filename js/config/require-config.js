require.config( {

	'paths' : {
		'underscore'        : 'libs/underscore',
		'jquery'            : 'libs/jquery',
		'bean'              : 'libs/bean',
		'toastr'            : 'libs/toastr',
		'Pixi'              : 'libs/pixi.dev',
		'Matter'            : 'libs/matter-0.8.0',
		'TWEEN'             : 'libs/tween',
		'Ecosystem'         : 'Ecosystem'
	},

	'shim' : {

		'underscore' : {
			'exports' : '_'
		},

		'jquery' : {
			'exports' : '$'
		},

		'bean' : {
			'exports' : 'bean'
		},

		'boostrap' : {
			'deps' : [ 'jquery' ]
		},

		'TWEEN' : {
			'exports' : 'TWEEN'
		}
	},

	'urlArgs' : 'bust=' + ( new Date() ).getTime()


} );
