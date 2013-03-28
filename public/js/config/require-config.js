require.config( {

	'paths' : {
		'paper'    : 'libs/paper',
		'jquery'   : 'libs/jquery',
		'toastr'   : 'libs/toastr',
		'Creature' : 'models/creature'
	},

	'shim' : {

		'paper' : {
			'exports' : 'paper'
		},

		'jquery' : {
			'exports' : '$'
		},

		'boostrap' : {
			'deps' : [ 'jquery' ]
		}
	}

} );