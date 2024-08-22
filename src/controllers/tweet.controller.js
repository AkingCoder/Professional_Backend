import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    const user = req.user
    if (!isValidObjectId(user._id)) {
        throw new ApiError(400, "Invalid user")
    }

    const tweet = await Tweet.create({ content, owner: user._id })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Tweet created successfully",
                tweet
            )
        )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const tweets = await Tweet.find(
        { owner: userId }
    )
    if (!tweets) {
        throw new ApiError(400, "No tweets found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "User tweets retrieved successfully",
                tweets
            )
        )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { content },
        { new: true }
    )
    if (!tweet) {
        throw new ApiError(400, "Tweet not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Tweet updated successfully",
                tweet
            )
        )


})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Tweet deleted successfully",
                tweet
            )
        )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}