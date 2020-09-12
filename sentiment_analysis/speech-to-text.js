var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});

var transcribeservice = new AWS.TranscribeService({apiVersion: '2017-10-26'});

var params = {
    "TranscriptionJobName": "Test5",
    "LanguageCode": "en-US",
    "MediaSampleRateHertz": 44100,
    "MediaFormat": "mp3",
    "Media": {
        "MediaFileUri": "s3://diary-sound-bucket/test.mp3"
    }
  };

transcribeservice.startTranscriptionJob(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data);           // successful response
});

// var params2 = {
//     TranscriptionJobName: 'Test2' /* required */
//   };

// transcribeservice.getTranscriptionJob(params2, function(err, data) {
//     if (err) console.log(err, err.stack); // an error occurred
//     else     console.log(data);           // successful response
//   });
