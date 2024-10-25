import mongoose   from 'mongoose';

const commentSchema = mongoose.Schema({

    title : {
        type: String,
        required : true
    },
    comment : {
        type: String,
    },
    // Created User
    creatorUserID : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    // List of Comment
    replyCommentIDs : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]

}, {
    timestamps : true
})

const commentModel = mongoose.model('Comment', commentSchema);

export default commentModel;