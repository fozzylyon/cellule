require.config( {

	'paths' : {
		'paper'    : 'libs/paper',
		'jquery'   : 'libs/jquery',
		'Creature' : 'models/creature'
	},

	'shim' : {
		'paper' : {
			'exports' : 'paper'
		},

		'jquery' : {
			'exports' : '$'
		}
	}

} );