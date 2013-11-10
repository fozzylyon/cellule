require.config( {

	'paths' : {
		'underscore' : 'libs/underscore',
		'jquery'     : 'libs/jquery',
		'bean'       : 'libs/bean',
		'toastr'     : 'libs/toastr',
		'THREE'      : 'libs/three',
		'Octree'     : 'libs/threeoctree',
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

		'Octree' : {
			'deps' : [ 'THREE' ]
		},

		'TWEEN' : {
			'exports' : 'TWEEN'
		}
	}

} );