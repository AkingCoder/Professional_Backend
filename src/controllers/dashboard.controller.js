import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const user = req.user
    if (!isValidObjectId(user._id)) {
        throw new ApiError(400, "Invalid user")
    }
    // add all views from diff videos
    const totalViews = await Video.aggregate([
        {
            $match: { owner: user._id }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        },
        {
            $project: { totalViews: 1 }
        }
    ])
    const totalVideos = await Video.countDocuments({ owner: user._id })
    const totalLikes = await Like.countDocuments({ likedBy: user._id })
    const totalSubscribers = await Subscription.countDocuments({ channel: user._id })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Channel stats fetched successfully",
                {
                    totalViews: totalViews[0].totalViews, totalVideos, totalLikes, totalSubscribers
                }
            )
        )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const user = req.user
    if (!isValidObjectId(user._id)) {
        throw new ApiError(400, "Invalid user")
    }
    const videos = await Video.find(
        {
            owner: user._id,
            isPublished: true
        }
    )
    if (!videos) {
        throw new ApiError(400, "No videos found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Channel videos fetched successfully",
                videos
            )
        )
})

export {
    getChannelStats,
    getChannelVideos
}