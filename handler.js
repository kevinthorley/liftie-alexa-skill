module.exports.getSkiReport = (event, context, callback) => {
  var resortName = event.request.intent.slots.ResortName.value;

  getLiftieReport(resortName, function (error, liftieReport) {
    if (error) {
      console.error('Error retrieving results from liftie:', error);

      var alexaResponse = {
        "version": "1.0",
        "response": {
          "outputSpeech": {
            "type": "PlainText",
            "text": "I'm sorry, I was unable to retrieve the ski report for " + resortName
          }
        },
        "shouldEndSession": true
      }

      callback(null, alexaResponse);
      return;
    }

    var newSnow = 0;
    if (liftieReport.weather.snow != "") {
      var newSnowTokens = liftieReport.weather.snow.split('-');
      newSnow = newSnowTokens[newSnowTokens.length - 1];
    }

    var numLiftsOpenOrScheduled = liftieReport.lifts.stats.open + liftieReport.lifts.stats.scheduled;
    var numLiftsOnHold = liftieReport.lifts.stats.hold;


    var snowText = resortName + ' is reporting up to ' + newSnow + ' inches of new snow. '
    var openScheduledText =  numLiftsOpenOrScheduled + ' lifts are scheduled to operate today. '
    var holdText = numLiftsOnHold + ' lifts are currently on hold. '

    var alexaResponse = {
      "version": "1.0",
      "response": {
        "outputSpeech": {
          "type": "PlainText",
          "text": snowText + openScheduledText + holdText
        }
      },
      "shouldEndSession": true
    }

    callback(null, alexaResponse);

  });
};

var getLiftieReport = function(resortName, callback) {
  var request = require('request');

  var formattedResortName = resortName
    .toLowerCase()
    .replace(" ", "-");

  var liftieApiUrl = 'https://liftie.info/api/resort/' + formattedResortName;

  request(liftieApiUrl, function (error, response, body) {
    if (error) {
      callback(error);
    } else if (response.statusCode == 200) {
      var skiReport = JSON.parse(body);
      callback(null, skiReport);
    } else {
      callback('Error calling liftie: ' + response.getStatusCode);
    }
  });
}
