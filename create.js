import handler from "./libs/handler-lib";
import Diary from "./models/Diary";
import mongoose from 'mongoose';

import client from "./libs/mongodb-lib";

export const main = handler(async (event, context) => {
  client(() => {

  });

  return await Diary.create({title: "userID", userId: event.requestContext.identity.cognitoIdentityId}).then((newDiary) => {
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