// JS to have a better overview over the routes with /geotags

const express = require('express');

var bodyParser = require('body-parser');
const router = express.Router();
var jsonParser = bodyParser.json();


router.post('/', jsonParser, (req, res) => {
    var searchArray = inMemorySpeicherung.radiusSearch(req.body.latitude, req.body.longitude);
    searchArray.push(inMemorySpeicherung.addGeotag(
        req.body.name, req.body.latitude, req.body.longitude, req.body.hashtag))
})


/**
 * TODO: This is all required:
    use the functions established in gta-server.js
    router.post (/)
    router.get (/)
    router.xy (geotags/geotagsID): get, change, delete
    geotagsID has to be programmed (see example down below)
    use the functions established in gta-sever.js */

router.delete('/geotags/:geotagID', (req, res) => { //
    var geotagID = req.params.geotagID;
    // TODO find geotagID in element and then call function delete
    res.send({
        // TODO return status(200)
    });

})

module.exports = router;

