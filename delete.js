import handler from "./libs/handler-lib";
// import dynamoDb from "./libs/dynamodb-lib";
import client from "./libs/mongodb-lib";
import Diary from "./models/Diary";
import mongoose from "mongoose";

export const main = handler(async (event, context) => {
  client(() => {

  });

  await Diary.findByIdAndDelete(event.pathParameters.id).then((deletedDiary) => {
    mongoose.disconnect();
    return deletedDiary;
  });
});
