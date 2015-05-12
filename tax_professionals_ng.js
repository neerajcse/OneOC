var myApp = angular.module('OneOC', ['ngStorage']);

/**
* TOUCH THIS ONLY IF YOU WANT TO ADD PROFESSIONALS TO THE LIST.
*/
myApp.service('TaxProDBService', function($localStorage){

	this.storage = $localStorage.$default({
    	listOfProfessionals: [
			{
				'id' : 1000,
				'email': 'johndoe@tax.org',
				'name': 'John Doe',
				'loc': [4,5],
				'slots':['04/28/2015'],
				'time': 0,
				'slots1':['05/28/2015'],
				'time1': 0,
				'languages' : [0,1],
				'pf': 1,
			},
			{
				'id' : 1001,
				'email': 'gfitz@tax.org',
				'name': 'Gloria Fitzgerald',
				'loc':[1,1],
				'slots':['04/29/2015'],
				'time': 1,
				'slots1':['05/29/2015'],
				'time1': 0,
				'languages': [1],
				'pf': 1,
			},
			{
				'id' : 1002,
				'email': 'shi@tax.org',
				'name': 'Kim Shi',
				'loc':[5,6], 
				'slots':['04/30/2015'],
				'languages': [1,2],
				'time': 2,
				'slots1':['05/30/2015'],
				'time1': 1,
				'pf': 1,
			},
			{
				'id' : 1003,
				'email': 'omark@tax.org',
				'name': 'Oliver Mark',
				'loc':[5,6], 
				'slots':['04/21/2015'],
				'time': 3,
				'slots1':['05/21/2015'],
				'time1': 1,
				'languages': [1,2],
				'pf': 1,
			},
		]
	});


	this.spokenLanguages = ["Spanish", "English", "Chinese"];
	this.timeSlots = ["Morning", "Afternoon", "Evening", "Late Evening"];

	
	this.getListOfProfessionals = function() {
		return this.storage.listOfProfessionals;
	}

	this.addProfessional = function(name, languages, lat, lon, slots, email, pf, id, timeSlot, slots1, timeSlot1) {
		var isEditing = id != (undefined || null);
		if(isEditing) {
			for(var i=0;i<this.storage.listOfProfessionals.length;i++) {
				var pro = this.storage.listOfProfessionals[i];
				if(pro.id == id) {
					this.deleteProfessional(i);
					break;
				}
			}
		}
		this.storage.listOfProfessionals.push({
			'id': isEditing ? parseInt(id,10) : this.storage.listOfProfessionals.length + 1000,
			'email': email,
			'name': name,
			'languages': languages,
			'slots': slots,
			'loc' : [lat,lon],
			'pf' : pf,
			'time': timeSlot.value,
			'slots1': slots1,
			'time1' : timeSlot1,
		});
		if (isEditing) {
			alert("Details for " + pro.name + " edited successfully.");
		} else {
			alert("New professional added successfully.")
		}
		
		//$localStorage.setItem("listOfProfessionals", this.listOfProfessionals);
		return this.storage.listOfProfessionals;
	};

	this.deleteProfessional = function(atIndex) {
		console.log(atIndex);
		this.storage.listOfProfessionals.splice(atIndex, 1);
		return this.storage.listOfProfessionals;
	};

	this.reset = function() {
		console.log("Resetting data...");
		localStorage.clear();
	}
});

/*********** CONTROLLERS BEGIN ************************/


/**
* This is the heart of the code. This handles pretty much everything around the logic.
**/
myApp.controller('TaxProController', function($scope, TaxProDBService){


	$scope.spokenLanguages = TaxProDBService.spokenLanguages;
	$scope.timeSlots = TaxProDBService.timeSlots;
	$scope.listOfProfessionals = TaxProDBService.getListOfProfessionals();

	$scope.spokenLanguageOptions = [ 
		{ name: 'No'	, value:-1 },
		{ name: 'Spanish' , value:0 },
		{ name: 'English' , value:1 },
		{ name: 'Chinese' , value:2 },
	];

	$scope.timeSlotOptions = [ 
		{ name: 'Morning'	, value:0 },
		{ name: 'Afternoon' , value:1 },
		{ name: 'Evening' , value:2 },
		{ name: 'Late Evening' , value:3 },
	];

	
	// Data stored related to map and selected cells on the map
	$scope.selectedLocation = [0, 0];
	$scope.selectedMapCell = undefined;
	$scope.selectedLanguages = [];
	$scope.selectedTimeSlot =  $scope.timeSlotOptions[0];
	$scope.selectedTimeSlot1 =  $scope.timeSlotOptions[0];
	

	$scope.searchTriggered = false;
	$scope.completedWork = false;
	$scope.selectedProfessional = undefined;

	$scope.selectProfessional = function(id) {
		id = parseInt(id - 1000,10);
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

	$scope.toggleSelection = function(language) {
	   var idx = $scope.spokenLanguages.indexOf(language);
	   var exists = $scope.selectedLanguages.indexOf(idx);
	   // is currently selected
	   if (exists > -1) {
	     $scope.selectedLanguages.splice(exists, 1);
	   } else {
	     $scope.selectedLanguages.push(idx);
	   }
	};
});

myApp.controller('CRUDTaxProController', function($scope, $filter, TaxProDBService) {

	$scope.user = {
		'spokenlanguages' : []
	};
	
	$scope.spokenLanguages = TaxProDBService.spokenLanguages;
	$scope.listOfProfessionals = TaxProDBService.getListOfProfessionals();
	$scope.timeSlotOptions = [ 
		{ name: 'Morning'	, value:0 },
		{ name: 'Afternoon' , value:1 },
		{ name: 'Evening' , value:2 },
		{ name: 'Late Evening' , value:3 },
	];

  	$scope.user.selectedTimeSlot = $scope.timeSlotOptions[0];
	$scope.user.selectedTimeSlot1 = $scope.timeSlotOptions[0];


	/**
	* This will not be used unless we decide to make an admin console.
	*/	
	$scope.addProfessional = function(name, languages, lat,lon, slots, email, pf, id, timeSlot, slots1, timeSlot1) {
		$scope.listOfProfessionals = TaxProDBService.addProfessional(name, languages, lat, lon, slots, email, 
			parseInt(pf,10), id, timeSlot, slots1, timeSlot1);
	};


	$scope.submitForm = function() {
		var formattedDate = $filter('date')($scope.user.date, "MM/dd/yyyy");
		var formattedDate1 = $filter('date')($scope.user.date1, "MM/dd/yyyy");
		
      	$scope.addProfessional($scope.user.name, $scope.user.spokenlanguages, $scope.user.lat, $scope.user.lon, [formattedDate], 
      		$scope.user.email, $scope.user.pf, $scope.user.id, $scope.user.selectedTimeSlot, [formattedDate1], $scope.user.selectedTimeSlot1);
      	$scope.user = {
			'spokenlanguages' : []
	  	};
	  	$scope.userForm.$setPristine();
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

	$scope.editProfessional = function(id) {
		console.log("Editing pro " + id)
		for(var i=0;i<$scope.listOfProfessionals.length;i++) {
			var pro = $scope.listOfProfessionals[i];
			if (pro.id == id) {
				$scope.user.name = pro.name;
				$scope.user.spokenLanguages = pro.languages;
				$scope.user.lat = pro.loc[0];
				$scope.user.lon = pro.loc[1];
				$scope.user.email = pro.email;

				var dateSplit = pro.slots[0].split("/");
				$scope.user.date = new Date(dateSplit[2] + "-" + dateSplit[0] + "-" + dateSplit[1]);

				var dateSplit = pro.slots1[0].split("/");
				$scope.user.date1 = new Date(dateSplit[2] + "-" + dateSplit[0] + "-" + dateSplit[1]);


				$scope.user.pf = pro.pf;
				$scope.user.id = pro.id;

				$scope.user.selectedTimeSlot = $scope.timeSlotOptions[pro.time];
				$scope.user.selectedTimeSlot1 = $scope.timeSlotOptions[pro.time1];
				//TaxProDBService.deleteProfessional(i,1);
			}
		}

	}

	$scope.resetData = function(parent, gp) {
		TaxProDBService.reset();
		alert("Data reset. Please login again.");
		document.location.reload();
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

myApp.filter('match_factor', function($filter){
	return function(professionals, selected_languages, date, lat, lon, selectedTime, lastYearPro) {
		var formattedDate = $filter('date')(date, "MM/dd/yyyy");
		console.log("Date is " + formattedDate);
		console.log("Selected time slot is " + selectedTime.value);

		var distance = function(x1, y1, x2, y2) {
			var a = x1 - x2;
			var b = y1 - y2;
			return Math.sqrt( a*a + b*b ); 
		}

		var match_factor_comparator = function(a,b) {
		  return a.score > b.score;
		}

		var clone = professionals.slice(0);

		for(var i=0; i<clone.length; i++) {
			var score = 0;
			var professional = clone[i];
			if(professional.pf == 2) {
				score += 3;
			}
			if(professional.pf == 3) {
				//INTRO-BUG: Want 7, added 8:
				score += 8;
			}

			var languageMatchScore = 0;
			for(var l=0;l<selected_languages.length;l++) {

				if(professional.languages.indexOf(selected_languages[l]) > -1) {
					languageMatchScore += 10;
				}
			}

			//INTRO-BUG- Ignore any additional score after 20 points:
			if (languageMatchScore >= 20) {
				languageMatchScore = 20;
			}
			score += languageMatchScore;

			if(professional.id == lastYearPro) {
				score += 10;
			}
			
			if(	professional.slots.indexOf(formattedDate) > -1 ) {
				score += 12;
			}
			if(professional.time == selectedTime.value) {
				score += 8;
			}

			//INTRO-BUG - Ignore distance score if any of these is 10:
			if ( professional.loc[0] != 10 || professional.loc[1] != 10) {
				score += 3 * ( 15 - Math.ceil(distance(lat, lon, professional.loc[0], professional.loc[1])) );	
			}
			
			clone[i]['score'] = score;
		}


		for(var i=1; i<11; i++) {
			for(var j=1; j<11; j++) {
				var el = angular.element(document.querySelector("#mapCell-"+i+"-"+j));
				el.removeClass("pro");		
			}			
		}

		for(var i=0; i<clone.length; i++) {
			var pro = clone[i];
			lat = pro.loc[0];
			lon = pro.loc[1];
			el = angular.element(document.querySelector("#mapCell-"+lat+"-"+lon));
			el.addClass("pro");
		}

		return clone.sort(match_factor_comparator);
	}
});

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
                    dateFormat:'mm/dd/yy',
                    onSelect:function (date) {
                    	scope.date = date.getMonth() + "/" + date.getDate() + "/" + date.getYear();
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

