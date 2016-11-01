'use strict';
var learnjs = {};

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

learnjs.fadeElement = function(elem, content) {
	elem.fadeOut('fast', function() {
		elem.html(content);
		elem.fadeIn();
	});
}

learnjs.template = function(name) {
	return $('.templates .' + name).clone();
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

learnjs.problemView = function(data) {
	var problemNumber = parseInt(data, 10);
	var view = $('problem-view');
	var problemData = learnjs.problemStoreArray[problemNumber-1];
	var resultFlashCard = view.find('.result');

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

learnjs.showView = function(hash) {
	var routes = {
		'#problem': learnjs.problemView
	};

	var hashParts = hash.split('-');

	var viewFn = routes[hashParts[0]];

	if(viewFn) {
		$('.view-container').empty().append(viewFn(hashParts[1]));
	}
}

learnjs.appOnReady = function() {
	window.onhashchange = function() {
		learnjs.showView(window.location.hash);
	};

	learnjs.showView(window.location.hash);
}