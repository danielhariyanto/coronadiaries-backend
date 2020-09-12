import handler from "./libs/handler-lib";
import client from "./libs/mongodb-lib";
import Diary from "./models/Diary";
import mongoose from "mongoose";


export const main = handler(async (event, context) => {
  client(() => {

  });

   return await Diary.findById(event.pathParameters.id).then((diary) => {
       mongoose.disconnect();
       return diary;
  });
});

