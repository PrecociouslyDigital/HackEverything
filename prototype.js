var map;
var infowindow;

var allVulns = ["Nah", "WEP", "WPA"];
var allDefs = ["Nah", "Firewall1", "Firewall2"];
var allPlaces = {};

var slaves = [];

function Entity(offVulns,defVulns,offDefs,defDefs){
	this.offVulns = offVulns || [];
	this.defVulns = defVulns || [];
	this.offDefs = offDefs || [];
	this.defDefs = defDefs || [];
}

var player = {
  entity : new Entity(allVulns.slice(0,2), [], allDefs.slice(0,2), []),
  money : 0
}
function initMap() {
  var pyrmont = {lat: -33.867, lng: 151.195};

  

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pyrmont = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      map.setCenter(pyrmont);
      infowindow = new google.maps.InfoWindow();

      var service = new google.maps.places.PlacesService(map);
      service.nearbySearch({
        location: pyrmont,
        radius: 500,
      }, callback);
    },function displayError(error) {
        var errors = { 
          1: "Yo browser cold slapped us in tha face (Permissions error)",
          2: "Yo browser don't know where you done are (Unknown location)",
          3: "Yo browser stood us up! (Timeout)"
        };
        alert("Error: " + errors[error.code]);
    });
  } else {
    // Browser doesn't support Geolocation
    alert("whatcha tryin to pull? yo browser can't geolocate yo!");
  }
  map = new google.maps.Map(document.getElementById('map'), {
    center: pyrmont,
    zoom: 15
  });
  player.loc = pyrmont;
  player.marker = new google.maps.Marker({
    map : map,
    position : player.loc,
    label : {
      color : "green",
      text: "Y"
    }
  });
  google.maps.event.addListener(player.marker, "click", function(){
    infowindow.setContent("This is you. What else do you want me to say?");
    infowindow.open(map, this);
  })
}

function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    menu: new Menu(
    					place.name,
    					place.price_level,
    					new Entity(
    						[],
    						[allVulns[chance.natural({min:0,max:allVulns.length-1})]],
    						[],
    						[allDefs[chance.natural({min:0,max:allDefs.length-1})]]
    					)
    				)
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(menuHTMLFactory(marker.menu.name));
    infowindow.open(map, this);
  });
  allPlaces[place.name] = marker;
}

function Menu(name, money, entity){
	this.name = name;
	this.money = money || chance.natural({min:1,max:5});
	this.entity = entity;
}

function menuHTMLFactory(name){
	return "<div>" +
			name +
			": <span onClick = 'attack(allPlaces[\"" +
			name +
			"\"]);'> attack </span> </div>"
}

function attack(place){
  if(slaves.indexOf(place) != -1){
    alert("You already took this over!");
    return;
  }
  if(contest(player.entity, place.menu.entity)){
    alert("You captured it!\nTheir vulnerabilities: " + place.menu.entity.defVulns + "\nTheir defenses: " + place.menu.entity.defDefs + "\nAdded income " + place.menu.money);
    slaves.push(place);
  }else{
    alert("You couldn't capture it!\nTheir vulnerabilities: " + place.menu.entity.defVulns + "\nTheir defenses: " + place.menu.entity.defDefs);
  }
}
function contest(attack, defense){
	for(each of attack.offVulns){
			if(defense.defVulns.indexOf(each) != -1){
				for(which of defense.defDefs){
						if(attack.offDefs.indexOf(which) == -1)
							return false;
				}
        return true;
			}
	}
	return false;
}

setInterval(function(){
  slaves.forEach(function (monies){
    player.money += monies.menu.money;
  });
  console.log("Player Money : " + player.money);
}, 3000);