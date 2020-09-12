import handler from "./libs/handler-lib";
import Diary from "./models/Diary";
import mongoose from 'mongoose';
import * as uuid from "uuid";
import axios from "axios";

import client from "./libs/mongodb-lib";

import AWS from "aws-sdk";

export const main = handler(async (event, context) => {
  client(() => {

  });

  const diaryId = uuid.v1();

  await Diary.create({_id: diaryId, title: "finalTest", userId: event.requestContext.identity.cognitoIdentityId}).then(() => {
      console.log("New Diary Created");
  });

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

    let transcriptFileUri = "";

    function waitForJob(callback){
        let checkJobStatus = setInterval(() => {
            transcribeservice.getTranscriptionJob({TranscriptionJobName: diaryId}, function(err, data) {
                if (err) {
                    console.log(err, err.stack);
                } else {
                    console.log("Job Status:");
                    const {TranscriptionJobStatus } = data.TranscriptionJob;
                    console.log(TranscriptionJobStatus);
                    if(TranscriptionJobStatus == 'COMPLETED') {
                        console.log("Found the file!");
                        transcriptFileUri = data.TranscriptionJob.Transcript.TranscriptFileUri;
                        clearInterval(checkJobStatus);
                        callback(transcriptFileUri);
                    }
                }
            });
        }, 10000);
    }

    waitForJob(async (file) => {
        console.log("File was " + file);
        axios.get(file).then(async response => {
            const {data} = response;
            const comprehend = new AWS.Comprehend({apiVersion: '2017-11-27'});

            const comprehendParams = {
                LanguageCode: 'en', /* required */
                Text: data.results.transcripts[0].transcript /* required */
            };

            comprehend.detectSentiment(comprehendParams, async function (err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else {
                    console.log(data);
                    Diary.findByIdAndUpdate(diaryId, {
                        completed: true,
                        fileUri: file,
                        content: comprehendParams.Text
                    }).then(updatedDiary => {
                        console.log(updatedDiary);
                        console.log("Bye!");
                        mongoose.disconnect();
                    }).catch(err => console.log(err));
                }          // successful response
            });
        });
    });
});