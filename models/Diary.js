import mongoose from 'mongoose';
const { Schema } = mongoose;

const diarySchema = new Schema({
    _id: String,
    title:  String, // String is shorthand for {type: String}
    content: String,
    completed: {
        type: Boolean,
        default: false
    },
    fileName: String,
    fileUri: String,
    userId: String,
    score:   Number,
    attachment: String,
    sentiment: {
        SentimentScore: {
            Mixed: Number,
            Positive: Number,
            Negative: Number,
            Neutral: Number
        },
        Sentiment: String
    }
},
    { timestamps: true
});

export default mongoose.model('Diary', diarySchema);

// {
//     "SentimentScore": {
//     "Mixed": 0.014585512690246105,
//         "Positive": 0.31592071056365967,
//         "Neutral": 0.5985543131828308,
//         "Negative": 0.07093945890665054
// },
//     "Sentiment": "NEUTRAL",
//     "LanguageCode": "en"
// }
//
// Item: {
//     userId: event.requestContext.identity.cognitoIdentityId,
//         diaryId: uuid.v1(),
//         content: data.content,
//         // TODO: UPDATE THESE TO BE GENERATED BASED ON TEXT
//         score,
//         magnitude,
//         diaryText,
//         attachment: data.attachment,
//         createdAt: Date.now()
// }