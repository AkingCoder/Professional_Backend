import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Unauthorized");
    }

    const like = await Like.findOne({
        video: videoId,
        likedBy: user._id
    });

    if (!like) {
        await Like.create({
            video: videoId,
            likedBy: user._id,
        });
        return res.status(200).json(new ApiResponse(200, "Liked video"));
    } else {
        await Like.deleteOne({ _id: like._id });
        return res.status(200).json(new ApiResponse(200, "Unliked video"));
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Unauthorized");
    }

    const like = await Like.findOne({
        comment: commentId,
        likedBy: user._id
    });

    if (!like) {
        await Like.create({
            comment: commentId,
            likedBy: user._id,
        });
        return res.status(200).json(new ApiResponse(200, "Liked comment"));
    } else {
        await Like.deleteOne({ _id: like._id });
        return res.status(200).json(new ApiResponse(200, "Unliked comment"));
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Unauthorized");
    }

    const like = await Like.findOne({
        tweet: tweetId,
        likedBy: user._id
    });

    if (!like) {
        await Like.create({
            tweet: tweetId,
            likedBy: user._id,
        });
        return res.status(200).json(new ApiResponse(200, "Liked tweet"));
    } else {
        await Like.deleteOne({ _id: like._id });
        return res.status(200).json(new ApiResponse(200, "Unliked tweet"));
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
        throw new ApiError(401, "Unauthorized");
    }


    const likedVideos = await Like.aggregate([
        {
            $match:{
                likedBy: user._id,
                video: { $exists: true }
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        {
            $addFields:{
                totalLikedVideos:{
                    $size: "$videoDetails"
                }
            }
        },
        {
            $project:{
                videoDetails: 1,
                totalLikedVideos: 1,
                likedBy:1
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, "Liked videos retrieved", likedVideos));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
