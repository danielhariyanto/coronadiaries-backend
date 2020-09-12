import mongoose from 'mongoose';
const uri = "mongodb+srv://dbUser:admin@corona-diaries.9b0oy.mongodb.net/corona-diaries?retryWrites=true&w=majority";

export default function(callback){
    let db = mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(() => console.log("Connected!"))
        .catch(err => console.log(err));

    callback(db);
};