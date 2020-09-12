import handler from "./libs/handler-lib";
import Diary from "./models/Diary";
import mongoose from 'mongoose';
import * as uuid from "uuid";

import client from "./libs/mongodb-lib";

import AWS from "aws-sdk";

export const main = handler(async (event, context) => {
  client(() => {

  });

  const diaryId = uuid.v1();

  return await Diary.create({_id: diaryId, title: "userID", userId: event.requestContext.identity.cognitoIdentityId}).then((newDiary) => {

    AWS.config.update({region:'us-east-1'});

    const transcribeservice = new AWS.TranscribeService({apiVersion: '2017-10-26'});

    let params = {
        "TranscriptionJobName": diaryId,
        "LanguageCode": "en-US",
        "MediaSampleRateHertz": 44100,
        "MediaFormat": "mp3",
        "Media": {
            "MediaFileUri": "s3://diary-sound-bucket/test.mp3" /* change uri */
        }
      };

    transcribeservice.startTranscriptionJob(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });

    let completed = false;
    let fileURI = "";

    // while (!completed) {
    //   console.log("running while loop");
    //   setTimeout(function() {
    //     console.log("running timeout");
    //     transcribeservice.getTranscriptionJob({TranscriptionJobName: diaryId}, function(err, data) {
    //       if (err) console.log(err, err.stack); // an error occurred
    //       // else if(data.TranscriptionJob.TranscriptionJobStatus == 'COMPLETED'){
    //       //   completed = true;
    //       //   fileURI = data.TranscriptionJob.Transcript.TranscriptFileUri;
    //       // } else console.log('Processing...');
    //       console.log("status");
    //       console.log(data.TranscriptionJob);
    //     });
    //   }, 5000);
    // }

    let checkJobStatus = setInterval(() => {
      transcribeservice.getTranscriptionJob({TranscriptionJobName: diaryId}, function(err, data) { 
    console.log(data)
  })
  }, 2000);
  
    console.log(fileURI);
    mongoose.disconnect();
    return newDiary;
  });

  // // TODO: Take the data.attachment, and run it through a speech to text.
  // const diaryText = "This is some text";
  // const score = 1;
  // const magnitude = 1;
  // const params = {
  //   TableName: process.env.tableName,
  //   // 'Item' contains the attributes of the item to be created
  //   // - 'userId': user identities are federated through the
  //   //             Cognito Identity Pool, we will use the identity id
  //   //             as the user id of the authenticated user
  //   // - 'diaryId': a unique uuid
  //   // - 'content': parsed from request body
  //   // - 'attachment': parsed from request body
  //   // - 'createdAt': current Unix timestamp
  //
  //   Item: {
  //     userId: event.requestContext.identity.cognitoIdentityId,
  //     diaryId: uuid.v1(),
  //     content: data.content,
  //     // TODO: UPDATE THESE TO BE GENERATED BASED ON TEXT
  //     score,
  //     magnitude,
  //     diaryText,
  //     attachment: data.attachment,
  //     createdAt: Date.now()
  //   }
  // };
  //
  // await dynamoDb.put(params);
  //
  // return params.Item;
});