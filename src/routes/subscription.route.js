import { Router } from 'express';
import { getSubscribedChannels,toggleSubscription,getUserChannelSubscribers } from '../contorller/subscriber.controller.js';
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();


router
    .route("/c/:channelId")
    .get(getUserChannelSubscribers)
    .post(verifyJWT,toggleSubscription);

router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router