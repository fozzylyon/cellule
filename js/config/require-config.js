require.config( {

	'paths' : {
		'underscore'        : 'libs/underscore',
		'jquery'            : 'libs/jquery',
		'bean'              : 'libs/bean',
		'toastr'            : 'libs/toastr',
		'THREE'             : 'libs/three',
		'Octree'            : 'libs/threeoctree',
		'TWEEN'             : 'libs/tween',
		'OrbitControls'     : 'libs/OrbitControls',
		'GeometryUtils'     : 'libs/GeometryUtils',
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

		'THREE' : {
			'exports' : 'THREE'
		},

		'Octree' : {
			'deps' : [ 'THREE' ]
		},

		'OrbitControls' : {
			'deps' : [ 'THREE' ]
		},

		'TWEEN' : {
			'exports' : 'TWEEN'
		}
	}

} );