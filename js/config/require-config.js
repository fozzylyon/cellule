require.config( {

	'paths' : {
		'underscore' : 'libs/underscore',
		'PIXI'       : 'libs/pixi.dev',
		'Physics'    : 'libs/physicsjs-full-0.6.0',
		'Ecosystem'  : 'Ecosystem'
	},

	'shim' : {

		'underscore' : {
			'exports' : '_'
		},

	},

	'urlArgs' : 'bust=' + ( new Date() ).getTime()


} );
