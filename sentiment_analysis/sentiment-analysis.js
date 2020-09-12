var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});

exports.handler = (event, context, callback) => {
            
    var params = {
        LanguageCode: 'en', /* required */
        Text: event.text /* required */
    };
    
    comprehend.detectSentiment(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });
};