import mongoose from 'mongoose';

const projStateSchema = mongoose.Schema({

    stateName : {
        type: String,
        required : true
    },
    // List of task
    taskIDs : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }]
}, {
    timestamps : true
})

const projStateModel = mongoose.model('ProjectState', projStateSchema);

export default projStateModel;