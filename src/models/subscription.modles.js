import mongoose,{Schema} from "mongoose";

const usersubscrptionschema = new Schema({

    Subscriber : {
        type :Schema.Types.ObjectId,
        ref : "User"
    },

    channel :{
        type :Schema.Types.ObjectId,
        ref : "User"
    }

})

export const Subscription = mongoose.model("Subscription",usersubscrptionschema)