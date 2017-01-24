var app = angular.module("app", []);

app.config(function($interpolateProvider) {
	$interpolateProvider.startSymbol('[[').endSymbol(']]');
});


app.controller('PollsCtrl', ['$scope', '$http', function($scope, $http) {
	console.log("This is PollsCtrl");
	$http({
		method: 'GET',
		url: '/api/polls'
	}).then(function(response) {
		console.log(response.data);
		$scope.polls = response.data;
	});
}]);

app.controller('CreatePollsCtrl', ['$scope', '$http', '$window', function($scope, $http, $window) {
	console.log("This is formCtrl");
	$scope.vote = {
		title: "",
		options: []
	}

	$scope.error = false;
	$scope.error_msg = null;
	var submitPoll = function(e) {
		console.log($scope.vote);
		
		if($scope.vote.title){
			$("#overlay").css("display", "block");
			$("#main").css("opacity", "0.1");
			$http({
				method: 'POST',
				url: '/api/createpoll',
				data: $scope.vote
			}).then(function(response) {
				console.log(response);
				setTimeout(function() {
					$window.location.href = "/yourpolls";
				}, 2000);

			});
		} else{
			$scope.error = true;
			$scope.error_msg = "Please enter poll title";
		}
			
	}
	$scope.addOption_status = "Add Options";
	$scope.show_add_option_input = false;

	$scope.addOptions = function() {
		if ($scope.vote.title && $scope.addOption_status == "Add Options") {
			$scope.addOption_status = "Done";
			$scope.show_add_option_input = true;
			$scope.error = false;
			$scope.error_msg = "Please enter poll title";
		} else {
			$scope.addOption_status = "Add Options";
			$scope.show_add_option_input = false;
			$scope.error = true;
			$scope.error_msg = "Please enter poll title";
		}

	}
	$scope.option = "";

	$scope.addOptionFormSubmit = function() {
		
		if($scope.option){
			$scope.vote.options.push({
				"text": $scope.option
			});
			console.log($scope.vote);
			$scope.option = "";
		}
	
	}

	$scope.submitPoll = submitPoll;
}]);


app.controller('VoteCtrl', ['$scope', '$http', '$window', function($scope, $http, $window) {
	console.log("This is VoteCtrl");
	var userVotedFor = $("#userVotedFor_optionId").val();
	console.log("userVotedFor --> ", userVotedFor);

	var options = $(".option");
	var userVotedFor_text;
	for (var i = 0; i < options.length; i++) {
		if (userVotedFor == options[i].id) {
			userVotedFor_text = options[i].querySelector(".option-text").textContent;
		}
	}
	if (userVotedFor) {
		$("#user_voted_msg").text("You have voted for " + userVotedFor_text);
	}
	$scope.addOption_status = "Add Options";
	$scope.show_add_option_input = false;
	$scope.addOptions = function() {
		if ($scope.addOption_status == "Add Options") {
			$scope.addOption_status = "Done";
			$scope.show_add_option_input = true;
		} else {
			$scope.addOption_status = "Add Options";
			$scope.show_add_option_input = false;
		}

	}
	console.log("user--> " + $("#user").val() + " poll author --> " + $("#poll_author").val());
	$scope.show_delete_div = false;
	if ($("#user").val() == $("#poll_author").val()) {
		$scope.show_delete_div = true;
	}
	$scope.option = "";
	$scope.addOptionFormSubmit = function() {
		console.log($scope.option);
		$http({
			method: "POST",
			url: "/api/addoption",
			data: {
				pollId: window.location.pathname.split("/")[2],
				optionText: $scope.option
			}
		}).then(function(response) {
			console.log(response);
			$window.location.href = window.location.pathname;
		})
		$scope.option = "";
	}
	$scope.deletePoll = function() {
		$http({
			method: "POST",
			url: "/api/deletepoll",
			data: {
				pollId: window.location.pathname.split("/")[2]
			}
		}).then(function(response) {
			console.log(response);
			$window.location.href = "/";
		})
	}

	$scope.optionClick = function(e) {
		console.log(window.location.pathname.split("/")[2]);
		if (userVotedFor && (userVotedFor == e.target.id)) {
			alert("You have already voted for " + userVotedFor_text);
		} else {
			$http({
				method: 'POST',
				url: '/api/vote',
				data: {
					pollId: window.location.pathname.split("/")[2],
					optionId: e.target.id
				}
			}).then(function(response) {
				console.log(response);
				$window.location.href = window.location.pathname;
			})
		}
	}
	$http({
		method:"POST",
		url: "/api/poll",
		data:{
			pollId: window.location.pathname.split("/")[2]
		}
	}).then(function(response){
		var options_data=[];
		var options_labels=[];
		var opt = response.data.options;
		console.log(opt);
		for(var i=0;i<opt.length;i++){
			options_data.push(opt[i].votes);
			options_labels.push(opt[i].text);
		}
		var ctx = document.getElementById("myChart");
	var myChart = new Chart(ctx, {
		type: 'pie',
		data: {
			labels: options_labels,
			datasets: [{
				label: '# of Votes',
				data: options_data,
				backgroundColor: [
					'rgba(255, 99, 132, 0.7)',
					'rgba(54, 162, 235, 0.7)',
					'rgba(255, 206, 86, 0.7)',
					'rgba(75, 192, 192, 0.7)',
					'rgba(153, 102, 255, 0.7)',
					'rgba(255, 159, 64, 0.7)'
				],
				borderColor: [
					'rgba(255,99,132,1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(153, 102, 255, 1)',
					'rgba(255, 159, 64, 1)'
				],
				borderWidth: 1
			}]
		},
		options: {
			
		}
	});
	})
	
}]);

app.controller('yourpollCtrl', ['$scope', '$http', function($scope, $http) {
	console.log("This is yourpollCtrl");
	$http({
		method: "GET",
		url: "/api/mypolls"
	}).then(function(response) {
		$scope.polls = response.data;
	});
}]);