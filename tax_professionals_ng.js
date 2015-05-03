var myApp = angular.module('OneOC', ['ngStorage']);

/**
* TOUCH THIS ONLY IF YOU WANT TO ADD PROFESSIONALS TO THE LIST.
*/
myApp.service('TaxProDBService', function($localStorage){

	this.storage = $localStorage.$default({
    	listOfProfessionals: [
			{
				'id' : 0,
				'name': 'John Doe',
				'loc': [4,5],
				'slots':['04/28 1-2'],
				'languages' : [0,1],
			},
			{
				'id' : 1,
				'name': 'Gloria Fitzgerald',
				'loc':[1,1],
				'slots':['04/28 3-4'],
				'languages': [1],
			},
			{
				'id' : 2,
				'name': 'Kim Shi',
				'loc':[5,6], 
				'slots':['04/28 5-6'],
				'languages': [1,2],
			},
			{
				'id' : 3,
				'name': 'Oliver Mark',
				'loc':[5,6], 
				'slots':['04/28 5-6'],
				'languages': [1,2],
			},
		]
	});


	this.spokenLanguages = ["Spanish", "English", "Chinese"];

	
	this.getListOfProfessionals = function() {
		return this.storage.listOfProfessionals;
	}

	this.addProfessional = function(name, languages, lat, lon, slots) {
		this.storage.listOfProfessionals.push({
			'id': this.storage.listOfProfessionals.length,
			'name': name,
			'languages': languages,
			'slots': slots,
			'loc' : [lat,lon]
		});

		//$localStorage.setItem("listOfProfessionals", this.listOfProfessionals);

		return this.storage.listOfProfessionals;	
	};

	this.deleteProfessional = function(atIndex) {
		console.log(atIndex);
		this.storage.listOfProfessionals.splice(atIndex, 1);
		return this.storage.listOfProfessionals;
	};
});





/*********** CONTROLLERS BEGIN ************************/


/**
* This is the heart of the code. This handles pretty much everything around the logic.
**/
myApp.controller('TaxProController', function($scope, TaxProDBService){


	$scope.spokenLanguages = TaxProDBService.spokenLanguages;
	$scope.listOfProfessionals = TaxProDBService.getListOfProfessionals();

	$scope.spokenLanguageOptions = [ 
		{ name: 'No'	, value:-1 },
		{ name: 'Spanish' , value:0 },
		{ name: 'English' , value:1 },
		{ name: 'Chinese' , value:2 },
	];
	$scope.filter_by_language = -1;


	// Data stored related to map and selected cells on the map
	$scope.selectedLocation = [0, 0];
	$scope.selectedMapCell = undefined;

	
	$scope.searchTriggered = false;
	$scope.completedWork = false;
	$scope.selectedProfessional = undefined;

	$scope.selectProfessional = function(id) {
		id = parseInt(id,10);
		console.log("Got " + id);
		var r = confirm("Please confirm that you want to schedule a meeting with " + $scope.listOfProfessionals[id]['name']);
		if (r == true) {
		   $scope.completedWork = true;
		   $scope.selectedProfessional = $scope.listOfProfessionals[id]['name']; 
		} else {
		    
		}
	}

	/**
	* This is called whenever the user select a point on the map.
	*/
	$scope.handleLocationSelection = function(lat, lon) {
		$scope.selectedLocation = [lat, lon];
		if ( $scope.selectedMapCell) {
			$scope.selectedMapCell.removeClass("pin");	
		}
		$scope.selectedMapCell = angular.element(document.querySelector( '#mapCell-'+lat+'-'+lon));
		$scope.selectedMapCell.addClass("pin");
	};

	$scope.triggerSearch = function() {
		$scope.searchTriggered = true;
	}

	$scope.logout = function(parentController) {
		$scope.searchTriggered = false;
		$scope.completedWork = false;
		$scope.selectedProfessional = undefined;
		parentController.logout();
	}
});

myApp.controller('CRUDTaxProController', function($scope, TaxProDBService) {

	$scope.user = {
		'spokenlanguages' : []
	};
	
	$scope.spokenLanguages = TaxProDBService.spokenLanguages;
	$scope.listOfProfessionals = TaxProDBService.getListOfProfessionals();
  	

	/**
	* This will not be used unless we decide to make an admin console.
	*/	
	$scope.addProfessional = function(name, languages, lat,lon, slots) {
		$scope.listOfProfessionals = TaxProDBService.addProfessional(name, languages, lat, lon, slots);
	};


	$scope.submitForm = function() {
      $scope.addProfessional($scope.user.name, $scope.user.spokenlanguages, $scope.user.lat, $scope.user.lon, [$scope.user.date]);
      $scope.user = {
		'spokenlanguages' : []
	  };
      
    };

	$scope.toggleSelection = function(language) {
	   var idx = $scope.spokenLanguages.indexOf(language);
	   var exists = $scope.user.spokenlanguages.indexOf(idx);
	   // is currently selected
	   if (exists > -1) {
	     $scope.user.spokenlanguages.splice(exists, 1);
	   } else {
	     $scope.user.spokenlanguages.push(idx);
	   }
	};

	$scope.logout = function(parent, grandparent) {
		parent.logout(grandparent);
	}
});

/**
* As the name suggests, this is used for the login screen.
* As of now anyone can login with any username password.
**/
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





/*********** FILTERS BEGIN ************************/

/** DO NOT TOUCH THIS UNTIL YOU'VE READ ABOUT ANGULARJS FILTERS**/
myApp.filter('language', function() {
	return function(professionals, language) {
		var filtered = [];
		language = parseInt(language, 10);
		console.log("Value for langauge is " + language)
		if(language == -1) {
			return professionals;
		}
		for(var i=0;i<professionals.length; i++) {
			var pro = professionals[i];
			if (pro.languages.indexOf(language) > -1) {
				filtered.push(pro);
			}
		}
		return filtered;
	}
});

/** DO NOT TOUCH THIS UNTIL YOU'VE READ ABOUT ANGULARJS FILTERS**/
myApp.filter('sort_by_distance', function() {
	return function(professionals, lat, lon) {

		var clone = professionals.slice(0);

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

		clone.sort(distance_comparator);

		for(var i=1; i<11; i++) {
			for(var j=1; j<11; j++) {
				var el = angular.element(document.querySelector("#mapCell-"+i+"-"+j));
				el.removeClass("pro");		
			}			
		}

		for(var i=0; i<clone.length; i++) {
			var pro = professionals[i];
			lat = pro.loc[0];
			lon = pro.loc[1];
			el = angular.element(document.querySelector("#mapCell-"+lat+"-"+lon));
			el.addClass("pro");
		}

		return clone;
	}
});


myApp.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});





/*********** DIRECTIVES BEGIN ************************/

/** DO NOT TOUCH THIS UNTIL YOU'VE READ ABOUT ANGULARJS DIRECTIVES**/
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

/** DO NOT TOUCH THIS UNTIL YOU'VE READ ABOUT ANGULARJS DIRECTIVES**/
myApp.directive('locationpicker', function($compile) {
    return {
        restrict: 'A',
        require : 'ngModel',
        link : function (scope, element, attrs, ngModelCtrl) {
        	$(function(){
        		for(var i=1;i<11;i++) {
        			
        			if(i==10) {
        				var logoElement = angular.element("<div class=logo></div>");
        				element.append(logoElement);
        			}

        			for(var j=1; j<11;j++) {
        				var picker= $compile("<div id='mapCell-"+i+"-"+ j+"' class='locationcell' ng-click='handleLocationSelection(" + i + "," + j + ")'></div>")( scope );
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

