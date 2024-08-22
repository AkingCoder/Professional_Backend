import { Comment } from "../models/comment.model.js"
import mongoose from "mongoose"
import ApiError from "../utils/ApiError.js"
import { isValidObjectId } from "mongoose"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    const skip = (page - 1) * limit
    const comments = await Comment.find({ video: videoId })
        .skip(skip)
        .limit(parseInt(limit))
    if (!comments) {
        throw new ApiError(400, "No comments")
    }

    const user = req.user
    if (!user) {
        throw new ApiResponse(401, "User not authenticated")
    }

    const commentsOwnerInfo = await Comment.aggregate([
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
                content: 1,
                video: 1,
                owner: 1,
                ownerInfo: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                },
                createdAt: 1
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Comments fetched successfully",
                commentsOwnerInfo
            )
        )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid VideoID")
    }

    const { content } = req.body

    const user = req.user
    if (!user) {
        throw new ApiError(401, "User not authenticated")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: user._id
    })


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Comment added successfully",
                comment
            )
        )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID")
    }

    const { content } = req.body
    if (!content.trim()) {
        throw new ApiError(400, "Content is Empty")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        { new: true }
    )

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Comment updated successfully",
                comment
            )
        )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID")
    }

    const comment = await Comment.findByIdAndDelete(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Comment deleted successfully",
                comment
            )
        )


})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}