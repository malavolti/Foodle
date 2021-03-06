define(function(require, exports, module) {

	var 
		
		$ = jQuery = require('jquery'),

		API = require('api/API').API,


		HeaderBar = require('controllers/HeaderBar'),

		FrontPage = require('controllers/FrontPage'),
		FoodleResponseController = require('controllers/FoodleResponseController'),
		EditFoodleController = require('controllers/EditFoodleController'),
		UpcomingFeedController = require('controllers/UpcomingFeedController'),

		DJ = require('misc/discojuice'),
		d = require('misc/dict')
		;

	require('bootstrap/bootstrap');
	require('bootstrap-datepicker');


	var route = function(path, strict) {

		if (strict) {
			
			if (window.location.pathname === path) {
				// console.log("› Matching route [" + path + "] STRICT");
				return true;
			}
			return false;
		}

		// console.log('Search route(' + path + ')', window.location.pathname, window.location.pathname.indexOf(path));
		if (window.location.pathname.indexOf(path) === 0) {
			// console.log("› Matching route [" + path + "] loose matching");
			return true;
		}
		return false;
	}



	// var loc = window.location.href;
	// console.log("Parse url", window.location.pathname, loc, parseUri(loc));


	var getPath = function() {

	
		var hash = window.location.hash;
		if (hash.length < 3) return null;
		hash = hash.substring(3);


		hashparams = hash.split('/');
		if (hashparams.length < 2) return null;

		return hashparams;
	}


	



	d.load(function() {
		window._d = d.dict;



		$.getJSON('/api/user', function(data) {

			$(document).ready(function() {

				DJ.load();
				
				var header = new HeaderBar(data);		

				/* Foodle frontpage */
				if (route('/', true)) {

					var api = null;

					if (data.authenticated) {

						$('.showIfAuthenticated').show();
						$('.hideIfAuthenticated').hide();

						console.log("front page");
						var api = new API(data.token);
					} 
					var fp = new FrontPage(api, data);

				/* Foodle repsonse page */
				} else if (route('/foodle/', false)) {



					if (data.user) {

						var api = new API(data.token);
						
						var frc = $("#foodleResponse");
						var identifier = frc.data('foodleid');

						api.getFoodle(identifier, function(foodle) {
							// console.log("Reveiced foodle object with getfoodle: ", foodle);
							foodle.type();
							foodle.setUser(data.user.userid);
							var cc = new FoodleResponseController(api, foodle, data.user, frc);
						});

					} else {

						var api = new API();

						var frc = $("#foodleResponse");
						var identifier = frc.data('foodleid');

						api.getFoodle(identifier, function(foodle) {
							var cc = new FoodleResponseController(api, foodle, null, frc);
						});
					}

				/* Foodle repsonse page */
				} else if (route('/widget', true)) {

					var hash = window.location.hash;
					if (hash.length < 3) throw "Parameters not provided";
					hash = hash.substring(3);


					hashparams = hash.split('/');
					if (hashparams.length < 2) throw "Parameters not provided";
					if (hashparams[0] !== 'feed') throw "Only [feed] widgets supported, yet.";

					var style = 'slim';
					if (hashparams.length > 2) {
						style = hashparams[2];
					}

					// console.log("Hash", hash, hashparams);

					var api = new API();
					// var al = new ActivityListController(api, $("#activities"));
					var il = new UpcomingFeedController(api, $("#widget"), hashparams[1], style);


				} else if (route('/create', true) || route('/edit/', false)) {


					var params = getPath();

					if (params && params.length >= 2 && params[0] === 'create' && data.authenticated) {

						var api = new API(data.token);
						var templateFoodle = params[1];

						// console.log("About to create a new Foodle from a template [" + templateFoodle + "]");


						api.getFoodle(templateFoodle, function(foodle) {
							// foodle.setUser(userid);
							
							delete foodle.identifier;
							console.log("Template is ", foodle);

							var cc = new EditFoodleController(api, $("#editfoodle"), data.user, foodle);
						});


					} else if (data.authenticated) {

						var api = new API(data.token);
						
						if (window.foodle_id) {
							// console.log("Foodle is to load is ", foodle_id);
							api.getFoodleAuth(window.foodle_id, function(foodle) {
								// foodle.setUser(userid);
								var cc = new EditFoodleController(api, $("#editfoodle"), data.user, foodle);
							});

						} else {
							
							var cc = new EditFoodleController(api, $("#editfoodle"), data.user);

						}


					}


				} else {

					console.log("› No routes matches")

				}

			});

		});
	});




});

