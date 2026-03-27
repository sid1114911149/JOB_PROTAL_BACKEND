const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const applyJob = async (req, res) => {
    try {
        const userId = req.userId;
        const jobId = req.params.id;

        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required",
                success: false
            });
        }

        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: userId
        });

        if (existingApplication) {
            return res.status(400).json({
                message: "Job already applied",
                success: false
            });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }
        const user = await User.findById(userId);
        if (!user.resume) {
            return res.status(404).json({
                message: "Resume not found",
                success: false
            });
        }
        const newApplication = await Application.create({
            applicant: userId,
            job: jobId
        });

        job.applications.push(newApplication._id);
        await job.save();

        return res.status(201).json({
            message: "Application created successfully",
            success: true,
            newApplication
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Application failed",
            success: false
        });
    }
};
const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.userId;

        const applications = await Application.find({ applicant: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'job',
                model: 'Job',
                populate: {
                    path: 'company',
                    model: 'Company'
                }
            });
        if (applications.length === 0) {
            return res.status(404).json({
                message: "No jobs found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Jobs retrieved successfully",
            applications,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Jobs not retrieved",
            success: false
        });
    }
};

const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;

        const applicants = await Job.findById(jobId).populate({
            path: 'applications',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'applicant'
            }
        });

        if (!applicants) {
            return res.status(404).json({
                message: "No applicants found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Applicants retrieved successfully",
            applicants,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Applicants not retrieved",
            success: false
        });
    }
};
const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({
                message: "Status is required",
                success: false
            });
        }
        const validStatuses = ["pending", "accepted", "rejected"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status value",
                success: false
            });
        }
        const applicationId = req.params.id;

        const updatedStatus = status.toLowerCase();

        const application = await Application.findByIdAndUpdate(
            applicationId,
            { status: updatedStatus },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({
                message: "Application not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Application updated successfully",
            application,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Update failed",
            success: false
        });
    }
};

module.exports = { applyJob, getAppliedJobs, getApplicants, updateStatus };