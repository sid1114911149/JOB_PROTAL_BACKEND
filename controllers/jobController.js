const Job = require('../models/Job');
const express = require('express');
const Application=require('../models/Application');
const Company=require('../models/Company');
const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
const postJob = async (req, res) => {
    try {
        console.log(req.body);
        const {
            title,
            description,
            requirements,
            salary,
            location,
            experienceLevel,
            jobType,
            position,
            companyName
        } = req.body;

        if (!title || !description || !requirements || !salary ||
            !location || !experienceLevel || !jobType || !position || !companyName) {
            return res.status(400).json({
                message: "All fields are required for job posting.",
                success: false
            });
        }

        const userId = req.userId;
        const company=await Company.findOne({name:companyName});
        if(!company){
            return res.status(400).json({
                message: "Company is Not there.",
                success: false
            });
        }
        const companyId=company._id;
        const companyRecId=company.userId;
        if(companyRecId != userId){
            return res.status(400).json({
                message: "You are Not a Recruiter of the Company",
                success: false
            });
        }
        const job = new Job({
            title,
            description,
            requirements: requirements.split(",").map(r => r.trim()),
            salary,
            location,
            experienceLevel,
            jobType,
            position,
            company: companyId,
            created_by: userId
        });

        await job.save();

        return res.status(201).json({
            message: "Job posted successfully",
            job,
            success: true
        });

    } catch (error) {
        console.error(`Job cannot be posted due to error: ${error}`);
        return res.status(500).json({
            message: "Job posting failed",
            success: false
        });
    }
};
const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";

        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { location: { $regex: keyword, $options: "i" } }
            ]
        };

        const jobs = await Job.find(query).populate({ path: "company" }).populate({ path: "created_by" }).sort({ createdAt: -1 });
        if (!jobs) {
            return res.status(404).json({ message: "No jobs Found with Given Id", success: false });
        }
        return res.status(200).json({
            jobs,
            success: true
        });

    } catch (error) {
        console.log(`Jobs cannot be Retrieved due to error: ${error}`);
        return res.status(500).json({
            message: "Job Cannot be retrieved",
            success: false
        });
    }
};

const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId=req.userId;
        const job = await Job.findById(jobId)
            .populate({ path: "company" })
            .populate({ path: "created_by" })
            .populate({
                path: "applications",
                populate: {
                    path: "applicant"
                }
            });
        if (!job) {
            return res.status(404).json({ message: "No job Found with Given Id", success: false });
        }
        const isApplied=await Application.findOne({applicant:userId,job:jobId});

        return res.status(200).json({
            message: "Job by Id retrieval Successful",
            job,
            isApplied,
            success: true
        });
    } catch (error) {
        console.log(`Job by ID cannot be Retrieved due to error: ${error}`);
        return res.status(500).json({
            message: "Job by ID Cannot be retrieved",
            success: false
        });
    }
}
const getJobByIdNotLogged = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId)
            .populate({ path: "company" })
            .populate({ path: "created_by" })
            .populate({
                path: "applications",
                populate: {
                    path: "applicant"
                }
            });
        if (!job) {
            return res.status(404).json({ message: "No job Found with Given Id", success: false });
        }

        return res.status(200).json({
            message: "Job by Id retrieval Successful",
            job,
            success: true
        });
    } catch (error) {
        console.log(`Job by ID cannot be Retrieved due to error: ${error}`);
        return res.status(500).json({
            message: "Job by ID Cannot be retrieved",
            success: false
        });
    }
}
const AdminJobs = async (req, res) => {
    try {
        const adminId = req.userId;
        const jobs = await Job.find({ created_by: adminId }).populate({ path: "company" }).populate({ path: "created_by" });
        if (!jobs) {
            return res.status(404).json({ message: "No jobs Found with Given Id", success: false });
        }
        return res.status(202).json({ message: "Job rereival successful", jobs, success: true });
    } catch (error) {
        console.log(`Jobs cannot be Retrieved due to error: ${error}`);
        return res.status(500).json({
            message: "Job Cannot be retrieved",
            success: false
        });
    }
}

module.exports = { postJob, getAllJobs, getJobById, AdminJobs,getJobByIdNotLogged };