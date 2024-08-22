import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import uploadOnCloudinary from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    let filter = {};
    if (query) {
        // Assuming you want to search in title and description fields
        filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }

    if (userId) {
        filter.user = userId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Convert sortType to -1 for descending or 1 for ascending
    const sortDirection = sortType === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortDirection };

    // Fetch videos from the database
    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

    // Get the total count for pagination purposes
    const totalVideos = await Video.countDocuments(filter);

    // Send response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Videos fetched successfully",
                videos
            )
        )
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!title) {
        throw new ApiError(400, "Title is required")
    }

    const videoLocalPath = req.files?.video[0].path
    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required")
    }
    // console.log(videoLocalPath)

    const thumbnailLocalPath = req.files?.thumbnail[0].path
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required")
    }

    const video = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!video && !thumbnail) {
        throw new ApiError(400, "Failed to upload video to cloudinary")
    }
    const user = req.user
    if (!user) {
        throw new ApiError(400, "User fetching error")
    }

    const videoData = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: video.duration,
        owner: user._id
    })

    const owner = await Video.aggregate([
        {
            $match: {
                owner: user._id
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerInfo"
            }
        },
        {
            $project: {
                _id: 1,
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                ownerInfo: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                    coverImage:1
                },
                createdAt: 1,
  
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Video published successfully",
                owner[0]
            )
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(500, "Video not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Video fetched successfully",
                video
            )
        )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: req.body.title,
                description: req.body.description,
                thumbnail: req.body.thumbnail
            }
        },
        { new: true }
    )

    if (!video) {
        throw new ApiError(500, "Video not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Video updated successfully",
                video
            )
        )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findByIdAndDelete(videoId)

    if (!video) {
        throw new ApiError(500, "Video not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Video deleted successfully",
                video
            )
        )


})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)
    const update = { isPublished: !video.isPublished }
    const toggleStatus = await Video.findByIdAndUpdate(videoId, update, { new: true })
    if (!video) {
        throw new ApiError(500, "Video not found")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                `Video status updated successfully to ${toggleStatus.isPublished}`,
                toggleStatus
            )
        )
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}