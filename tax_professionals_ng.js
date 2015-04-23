var myApp = angular.module('OneOC', ['uiGmapgoogle-maps']);

myApp.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
});

myApp.service('TaxProDBService', function(){

	this.listOfProfessionals = [
		{
			'name': 'John Doe',
			'availabilties': [{'loc':'', 'time':''}],
			'languages' : [0,1],
		},
		{
			'name': 'Jane Doe',
			'availabilties': [{'loc':'', 'time':''}],
			'languages': [1],
		},
		{
			'name': 'Joe Doe',
			'availabilties': [{'loc':'', 'time':''}],
			'languages': [1,2],
		},
	];

	this.refreshMap = false;

	this.getRefreshMap = function() {
		return this.refreshMap;
	};

	this.setRefreshMap = function(r) {
		this.refreshMap = r;
	}

	this.getListOfProfessionals = function() {
		return this.listOfProfessionals;
	}

	this.addProfessional = function(name, languages) {
		this.listOfProfessionals.push({
			'name': name,
			'languages': languages,
		});
		return this.listOfProfessionals;	
	};

	this.deleteProfessional = function(atIndex) {
		console.log(atIndex);
		this.listOfProfessionals.splice(atIndex, 1);
		return this.listOfProfessionals;
	};
});


myApp.controller('TaxProController', function($scope, TaxProDBService){

	$scope.map = { center: { latitude: 33.66, longitude: -117.82 }, zoom: 8, refresh:TaxProDBService.getRefreshMap() };
	
	$scope.spokenLanguages = ["Spanish", "English", "Chinese"];

	$scope.listOfProfessionals = TaxProDBService.getListOfProfessionals();

	$scope.addProfessional = function(name, languages) {
		$scope.listOfProfessionals = TaxProDBService.addProfessional(name, languages);
	};

	$scope.deleteProfessional = function(atIndex) {
		$scope.listOfProfessionals = TaxProDBService.deleteProfessional(atIndex);
	};

	$scope.forceRefreshMap = function() {
		TaxProDBService.setRefreshMap(true);
	};

});

myApp.controller('LoginController', function($scope, TaxProDBService){
	$scope.loggedIn = false;
	$scope.notLoggedIn = true;

	$scope.setLogin = function(uciID) {
		$scope.loggedIn = true;
		$scope.notLoggedIn = false;
		$scope.id = uciID;
		TaxProDBService.setRefreshMap(true);
	};

	$scope.logout = function() {
		$scope.loggedIn = false;
	};
});