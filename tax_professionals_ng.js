var myApp = angular.module('OneOC', []);

myApp.service('TaxProDBService', function(){

	this.listOfProfessionals = [
		{
			'name': 'John Doe',
			'loc': [4,5],
			'slots':['04/28 1-2'],
			'languages' : [0,1],
		},
		{
			'name': 'Gloria Fitzgerald',
			'loc':[1,1],
			'slots':['04/28 3-4'],
			'languages': [1],
		},
		{
			'name': 'Kim Shi',
			'loc':[5,6], 
			'slots':['04/28 5-6'],
			'languages': [1,2],
		},
		{
			'name': 'Oliver Mark',
			'loc':[5,6], 
			'slots':['04/28 5-6'],
			'languages': [1,2],
		},
	];

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

	$scope.spokenLanguages = ["Spanish", "English", "Chinese"];

	$scope.listOfProfessionals = TaxProDBService.getListOfProfessionals();

	$scope.selectedLocation = [0, 0];

	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var mmNextMonth = (mm%12 + 1);
	var yyyy = today.getFullYear();
	var yyyyNextYear = today.getFullYear() + Math.floor(1 * mmNextMonth/12);

	if(dd<10) {
	    dd='0'+dd
	} 

	if(mm<10) {
	    mm='0'+mm
	} 

	$scope.minDate = yyyy + '-' + mm + '-' + dd;
    $scope.maxDate = yyyyNextYear + '-' + mmNextMonth + '-' + dd;

	$scope.addProfessional = function(name, languages) {
		$scope.listOfProfessionals = TaxProDBService.addProfessional(name, languages);
	};

	$scope.deleteProfessional = function(atIndex) {
		$scope.listOfProfessionals = TaxProDBService.deleteProfessional(atIndex);
	};

	$scope.handleLocationSelection = function(lat, lon) {
		$scope.selectedLocation = [lat, lon];
	};

});

myApp.controller('LoginController', function($scope, TaxProDBService){
	$scope.loggedIn = false;
	$scope.notLoggedIn = true;

	$scope.setLogin = function(uciID) {
		$scope.loggedIn = true;
		$scope.notLoggedIn = false;
		$scope.id = uciID;
	};

	$scope.logout = function() {
		$scope.loggedIn = false;
	};
});

myApp.filter('language', function() {
	return function(professionals, language) {
		var filtered = [];
		language = parseInt(language, 10);
		for(var i=0;i<professionals.length; i++) {
			var pro = professionals[i];
			if (pro.languages.indexOf(language) > -1) {
				filtered.push(pro);
			}
		}
		return filtered;
	}
});

myApp.filter('sort_by_distance', function() {
	return function(professionals, lat, lon) {
		var filtered = [];
		var distance = function(x1, y1, x2, y2) {
			var a = x1 - x2;
			var b = y1 - y2;
			return Math.sqrt( a*a + b*b ); 
		}
		var distance_comparator = function(a,b) {
		  if (distance(lat,lon, a.loc[0], a.loc[1]) > distance(lat,lon, b.loc[0], b.loc[1]))
		     return 1;
		  return -1;
		}

		professionals.sort(distance_comparator);
		return professionals;
	}
});

myApp.directive('datepicker', function() {
    return {
        restrict: 'A',
        require : 'ngModel',
        link : function (scope, element, attrs, ngModelCtrl) {
        	$(function(){
                element.datepicker({
                    dateFormat:'dd/mm/yy',
                    onSelect:function (date) {
                    	scope.date = date;
                       	scope.$apply();
                    }
                });
            });
        }
    }
});

myApp.directive('locationpicker', function($compile) {
    return {
        restrict: 'A',
        require : 'ngModel',
        link : function (scope, element, attrs, ngModelCtrl) {
        	$(function(){
        		for(var i=0;i<10;i++) {
        			if(i==9) {
        				var logoElement = angular.element("<div class=logo></div>");
        				element.append(logoElement);
        			}
        			for(var j=0; j<10;j++) {
        				var picker= $compile( "<div class='locationcell' ng-click='handleLocationSelection(" + i + "," + j + ")'></div>" )( scope );
                		element.append(picker);
        			}
        			var breakDiv = angular.element("<div></div>");
        			element.append(breakDiv)
        		}
                scope.$apply();
            });
        }
    }
});
