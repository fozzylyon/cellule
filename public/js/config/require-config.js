require.config( {

	'paths' : {
		'underscore' : 'libs/underscore',
		'paper'      : 'libs/paper',
		'jquery'     : 'libs/jquery',
		'bean'       : 'libs/bean',
		'toastr'     : 'libs/toastr',
		'Creature'   : 'models/creature',
		'ecosystem'  : 'ecosystem',
		'chart'      : 'chart'
	},

	'shim' : {

		'underscore' : {
			'exports' : '_'
		},

		'paper' : {
			'exports' : 'paper'
		},

		'jquery' : {
			'exports' : '$'
		},

		'bean' : {
			'exports' : 'bean'
		},

		'boostrap' : {
			'deps' : [ 'jquery' ]
		}
	}

} );