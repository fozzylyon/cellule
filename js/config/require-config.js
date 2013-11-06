require.config( {

	'paths' : {
		'underscore' : 'libs/underscore',
		'jquery'     : 'libs/jquery',
		'bean'       : 'libs/bean',
		'toastr'     : 'libs/toastr',
		'THREE'      : 'libs/three',
		'TWEEN'      : 'libs/tween',
		'Ecosystem'  : 'Ecosystem'
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

		'THREE' : {
			'exports' : 'THREE'
		},

		'TWEEN' : {
			'exports' : 'TWEEN'
		}
	}

} );