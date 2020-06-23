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

        preventer: function () {
            document.querySelectorAll("[type='submit']").forEach(function () {
                this.addEventListener("click", function (event) {
                    event.preventDefault();
                })
            })
        },

        ajaxCallTagging: function () {
            var submit = document.getElementById("submit_tagging")

            submit.addEventListener("click", function () {

                const ajax = new XMLHttpRequest();

                ajax.open("POST", "/tagging", true);
                ajax.setRequestHeader("Content-type", "application/json");

                ajax.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        var geoTagLi = document.createElement("li");
                        var geoTagValue = document.createTextNode(ajax.responseText);
                        geoTagLi.appendChild(geoTagValue);
                        document.getElementById("results").appendChild(geoTagLi);
                    }

                    const jsonString = JSON.stringify(new GeoTag(document.getElementById("latitude").value,
                        document.getElementById("longitude").value,
                        document.getElementById("name").value,
                        document.getElementById("hashtag").value));
                    ajax.send(jsonString);
                    console.log(jsonString);
                };
            })
        },

        ajaxCallFilter: function () {
            var submit = document.getElementById("submit_discovery");

            submit.addEventListener("click", function () {

                var searchTerm = document.getElementById("searchTerm")

                if (searchTerm !== undefined) {
                    document.URL += "?searchTerm=" + searchTerm.toString()
                }

                const ajax = new XMLHttpRequest();

                ajax.open("GET", "/discovery", true);
                ajax.setRequestHeader("Content-type", "application/json");

                ajax.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {

                    }
                }

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
    gtaLocator.preventer()
    gtaLocator.ajaxCallTagging();
    gtaLocator.ajaxCallFilter();
});