'use strict';
var learnjs = {};

learnjs.identity = new $.Deferred();

learnjs.poolId = {
	poolId: 'eu-central-1:6f07e986-8a06-44ce-bbc4-f3585b1b4f1c'
}

learnjs.problemStoreArray = [
	{
		description: "What is truth?",
		code: "function problem() { return __; }"
	},
	{
		description: "Simple Math",
		code: "function problem() { return 42 == 6 * __; } "
	}
];

learnjs.applyObject = function(obj, elem) {
	for(var key in obj) {
		elem.find('[data-name="' + key + '"]').text(obj[key]);
	}
}

learnjs.awsRefresh = function() {
	var deferred = new $.Deferred();

	AWS.config.credentials.refresh(function(err) {
		if(err) {
			deferred.reject(err);
		} else {
			deferred.resolve(AWS.config.credentials.identityId);
		}
	});

	return deferred.promise();
}

learnjs.triggerEvent = function(name, args) {
	$('.view-container>*').trigger(name, args);
}

learnjs.fadeElement = function(elem, content) {
	elem.fadeOut('fast', function() {
		elem.html(content);
		elem.fadeIn();
	});
}

learnjs.template = function(name) {
	return $('.templates .' + name).clone();
}

learnjs.addProfileLink = function(profile) {
	var link = learnjs.template('profile-link');
	link.find('a').text(profile.email);
	$('.signin-bar').prepend(link);
}

learnjs.buildCorrectFlashCard = function(problemNumber) {
	var flashCard = learnjs.template('correct-flash');
	var link 	  = flashCard.find('a');

	if(problemNumber < learnjs.problemStoreArray.length) {
		link.attr('href', '#problem-' + (problemNumber + 1));
	} else {
		link.attr('href', '');
		link.text('All done! Nice job.');
	}

	return flashCard;
}

learnjs.landingView = function() {
	return learnjs.template('landing-view');
}

learnjs.problemView = function(data) {
	var problemNumber = parseInt(data, 10);
	var view = learnjs.template('problem-view');
	var problemData = learnjs.problemStoreArray[problemNumber-1];
	var resultFlashCard = view.find('.result');

	//Add Skip Button if possible
	if(problemNumber < learnjs.problemStoreArray.length) {
		var button = learnjs.template('skip-btn');
		button.find('a').attr('href', '#problem-' + (problemNumber + 1));
		$('.nav-list').append(button);

		view.bind('removingView', function() {
			button.remove();
		});
	}
	function checkAnswer() {
		var answer = view.find('.answer').val();
		var test = problemData.code.replace('__', answer) + '; problem();';

		return eval(test); 
	}

	function checkAnswerClick() {
		if(checkAnswer()) {
			var correctFlash = learnjs.buildCorrectFlashCard(problemNumber);
			learnjs.fadeElement(resultFlashCard, correctFlash);
		} else {
			learnjs.fadeElement(resultFlashCard, 'Incorrect!');
		}

		return false;
	}

	view.find('.check-btn').click(checkAnswerClick);
	view.find('.title').text('Problem #' + problemNumber);
	learnjs.applyObject(problemData, view);	
	
	return view;
}

learnjs.profileView = function() {
	var view = learnjs.template('profile-view');
	learnjs.identity.done(function(identity) {
		view.find('email').text(identity.email);
	});
	return view;
}

learnjs.showView = function(hash) {
	var routes = {
		'#problem': learnjs.problemView,
		'#profile': learnjs.profileView,
		'#': learnjs.landingView,
		'': learnjs.landingView
	};

	var hashParts = hash.split('-');

	var viewFn = routes[hashParts[0]];

	if(viewFn) {
		learnjs.triggerEvent('removingView', []);
		$('.view-container').empty().append(viewFn(hashParts[1]));
	}
}

learnjs.appOnReady = function() {
	window.onhashchange = function() {
		learnjs.showView(window.location.hash);
	};

	learnjs.showView(window.location.hash);
	learnjs.identity.done(learnjs.addProfileLink);
}

/*Callback for Google API*/
function googleSignIn() {
	var id_token = googleUser.getAuthResponse().id_token;
	
	AWS.config.update({
		region: 'eu-central-1',
		credentials: new AWS.CognitoIdentityCredentials({
			IdentityPoolId: learnjs.poolId,
			Logins: {
				'accounts.google.com': id_token
			}
		})
	})

	function refresh() {
		return gapi.auth2.getAuthInstance().signIn({
			prompt: 'login'
		}).then(function(userUpdate) {
			var creds = AWS.config.credentials;
			var newToken = userUpdate.getAuthResponse().id_token;
			creds.params.Logins['accounts.google.com'] = newToken;
			return learnjs.awsRefresh();
		});
	}

	learnjs.awsRefresh().then(function(id) {
		learnjs.identity.resolve({
			id: id,
			email: googleUser.getBasicProfile().getEmail(),
			refresh: refresh
		});
	});
}