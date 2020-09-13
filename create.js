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

  const data = JSON.parse(event.body);

  const diaryId = uuid.v1();


  await Diary.create({_id: diaryId, title: data.title, userId: event.requestContext.identity.cognitoIdentityId, fileName: data.fileName}).then((newDiary) => {
    console.log("created new diary");
  });

    AWS.config.update({region:'us-east-1'});

    const transcribeservice = new AWS.TranscribeService({apiVersion: '2017-10-26'});

    let params = {
        "TranscriptionJobName": diaryId,
        "LanguageCode": "en-US",
        "MediaSampleRateHertz": 44100,
        "MediaFormat": "mp3",
        "Media": {
            "MediaFileUri": `s3://diary-sound-uploads/private/${event.requestContext.identity.cognitoIdentityId}/${data.fileName}`
        }
    };

    console.log("Transcribing: " + data.fileName);

    transcribeservice.startTranscriptionJob(params, function(err, data) {
        console.log("Starting Transcription job!");
        if (err) {
           console.log(err);
           console.log("transcription failed");
        } else {
            console.log(data);
            console.log("transcription worked!");
        }
    });

    let transcriptFileUri = "";

    function waitForJob(callback){
        let checkJobStatus = setInterval(() => {
            transcribeservice.getTranscriptionJob({TranscriptionJobName: diaryId}, function(err, data) {
                if (err) {
                    console.log("Error");
                    console.log(err, err.stack);
                } else {
                    console.log("Job Status:");
                    const {TranscriptionJobStatus} = data.TranscriptionJob;
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

    console.log("Gonna do the sentiment job now");

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
                        content: comprehendParams.Text,
                        sentiment: data,
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