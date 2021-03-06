/* Dieses Skript wird ausgeführt, wenn der Browser index.html lädt. */

// Befehle werden sequenziell abgearbeitet ...

/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit geöffnet werden.
 */
console.log("The script is going to start...");

// Es folgen einige Deklarationen, die aber noch nicht ausgeführt werden ...

// Hier wird die verwendete API für Geolocations gewählt
// Die folgende Deklaration ist ein 'Mockup', das immer funktioniert und eine fixe Position liefert.
GEOLOCATIONAPI = {
    getCurrentPosition: function (onsuccess) {
        onsuccess({
            "coords": {
                "latitude": 49.013790,
                "longitude": 8.390071,
                "altitude": null,
                "accuracy": 39,
                "altitudeAccuracy": null,
                "heading": null,
                "speed": null
            },
            "timestamp": 1540282332239
        });
    }
};

// Die echte API ist diese.
// Falls es damit Probleme gibt, kommentieren Sie die Zeile aus.
// GEOLOCATIONAPI = navigator.geolocation;

/**
 * GeoTagApp Locator Modul
 */

class GeoTag2 {
    constructor(latitude, longitude, name, hashTag) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.name = name;
        this.hashtag = hashTag;
    }
}

var ajax = new XMLHttpRequest();


// TODO: Fix error when sending a geotag-post
//  Fix functionality for discovery

ajax.onreadystatechange = function () {
    if (ajax.readyState === ajax.DONE) {
        if (ajax.status == 200) {
            var serverResponse = JSON.parse(ajax.responseText);
            var geoTagsList = serverResponse.taglist;
            var htmlString = '';

            geoTagsList.forEach(function (data) {
                htmlString +=
                    "<li> " + data.name + "  (" + data.latitude + ", " + data.longitude + ") " + data.hashtag + " </li>";
            })

            document.getElementById("results").innerHTML = "";
            document.getElementById("results").innerHTML += htmlString;
            gtaLocator.updateLocation();

        }else if (ajax.status == 400) {
            alert('There was an 400 error');
        } else {
            alert('Something else other than 200 was returned')
        }
    }
}

var submit = document.getElementById("submit_tagging");
submit.addEventListener("click", function (event) {
    event.preventDefault();

    ajax.open("POST", "/tagging", true);
    ajax.setRequestHeader("Content-type", "application/json");
    ajax.setRequestHeader("Data-Type", "json");

    var newGeoTag = new GeoTag2(document.getElementById("latitude").value,
        document.getElementById("longitude").value,
        document.getElementById("name").value,
        document.getElementById("hashtag").value);

    var jsonString = JSON.stringify(newGeoTag);
    ajax.send(jsonString);
    console.log(jsonString);
})

var discovery = document.getElementById("submit_discovery");
discovery.addEventListener("click", function (event) {

    var searchTerm = document.getElementById("discovery_searchterm").value;
    var latitudeToSend = document.getElementById("latitude_search").value;
    var longitudeToSend = document.getElementById("longitude_search").value;
    var methodUrl = '/discovery?searchterm=' + searchTerm + '&latitude=' + latitudeToSend + '&longitude=' + longitudeToSend;
    console.log(methodUrl)
    ajax.open('GET',methodUrl,true);
    ajax.setRequestHeader("Content-type", "application/json");
    ajax.setRequestHeader("Data-Type", "json");
    ajax.send(null);
})

var gtaLocator = (function GtaLocator(geoLocationApi) {

    // Private Member

    /**
     * Funktion spricht Geolocation API an.
     * Bei Erfolg Callback 'onsuccess' mit Position.
     * Bei Fehler Callback 'onerror' mit Meldung.
     * Callback Funktionen als Parameter übergeben.
     */
    var tryLocate = function (onsuccess, onerror) {
        if (geoLocationApi) {
            geoLocationApi.getCurrentPosition(onsuccess, function (error) {
                var msg;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "The request to get user location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        msg = "An unknown error occurred.";
                        break;
                }
                onerror(msg);
            });
        } else {
            onerror("Geolocation is not supported by this browser.");
        }
    };

    // Auslesen Breitengrad aus der Position
    var getLatitude = function (position) {
        return position.coords.latitude;
    };

    // Auslesen Längengrad aus Position
    var getLongitude = function (position) {
        return position.coords.longitude;
    };

    // Hier Google Maps API Key eintragen
    var apiKey = "7M9jETrf4mRdAyx6JCFGImwbQ3WXJ3wg";

    /**
     * Funktion erzeugt eine URL, die auf die Karte verweist.
     * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
     * sein.
     *
     * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
     * tags : Array mit Geotag Objekten, das auch leer bleiben kann
     * zoom: Zoomfaktor der Karte
     */
    var getLocationMapSrc = function (lat, lon, tags, zoom) {
        zoom = typeof zoom !== 'undefined' ? zoom : 10;

        if (apiKey === "YOUR_API_KEY_HERE") {
            console.log("No API key provided.");
            return "images/mapview.jpg";
        }

        var tagList = "&pois=You," + lat + "," + lon;

        if (tags !== undefined) tags.forEach(function (tag) {
            tagList += "|" + tag.name + "," + tag.latitude + "," + tag.longitude;
        });

        var urlString = "https://www.mapquestapi.com/staticmap/v4/getmap?key=" +
            apiKey + "&size=600,400&zoom=" + zoom + "&center=" + lat + "," + lon + "&" + tagList;

        console.log("Generated Maps Url: " + urlString);
        return urlString;
    };


    return { // Start öffentlicher Teil des Moduls ...

        // Public Member

        readme: "Dieses Objekt enthält 'öffentliche' Teile des Moduls.",

        updateLocation: function () {

            if (document.getElementById("latitude").value === "" && document.getElementById("longitude").value === "") {
                tryLocate(function (pos) {

                    document.getElementById("latitude").value = getLatitude(pos);
                    document.getElementById("longitude").value = getLongitude(pos);
                    document.getElementById("latitude_search").value = getLatitude(pos);
                    document.getElementById("longitude_search").value = getLongitude(pos);

                    var arrayWithTags = JSON.parse(document.getElementById("result-img").getAttribute("data-tags"));
                    var mapURL = getLocationMapSrc(getLatitude(pos), getLongitude(pos), arrayWithTags, 16);
                    document.getElementById("result-img").src = mapURL;
                }, function (alertString) {
                    alert(alertString);
                });
            } else {
                var arrayWithTags = JSON.parse(document.getElementById("result-img").getAttribute("data-tags"));
                var mapURL = getLocationMapSrc(document.getElementById("latitude").value, document.getElementById("longitude").value, arrayWithTags, 16);
                document.getElementById("result-img").src = mapURL;
            }

        },

        ajaxCallFilter: function () {

            var ajax = new XMLHttpRequest();
            var submit = document.getElementById("submit_discovery");

            submit.addEventListener("click", function (event) {
                event.preventDefault();
                var searchTerm = document.getElementById("searchTerm");

                if (searchTerm !== undefined) {
                    document.URL += "?searchTerm=" + searchTerm.toString()
                }

                ajax.open("GET", "/discovery", true);
                ajax.setRequestHeader("Content-type", "application/json");


            })
        }


    }; // ... Ende öffentlicher Teil
})
(GEOLOCATIONAPI);

/**
 * $(function(){...}) wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(function () {
    gtaLocator.updateLocation();
});