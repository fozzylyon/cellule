require.config( {

	'paths' : {
		'underscore' : 'libs/underscore',
		'jquery'     : 'libs/jquery',
		'bean'       : 'libs/bean',
		'toastr'     : 'libs/toastr',
		'THREE'      : 'libs/three',
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
		}
	}

} );