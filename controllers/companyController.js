const Company = require('../models/Company');
const express = require('express');
const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
const register = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;

        if (!name || !description || !location) {
            return res.status(400).json({
                message: "Something is missing for company registration..",
                success: false
            });
        }

        const existing = await Company.findOne({ name });
        if (existing) {
            return res.status(400).json({
                message: "Company already registered",
                success: false
            });
        }

        const companyDetails = {
            name,
            description,
            location,
            userId: req.userId
        };

        if (website) companyDetails.website = website;

        // ✅ HANDLE LOGO UPLOAD
        if (req.file) {
            companyDetails.logo = `/uploads/${req.file.filename}`;
        }

        const company = new Company(companyDetails);
        await company.save();

        return res.status(201).json({
            message: "Registration Successful",
            company,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Company registering failed",
            success: false
        });
    }
};
const getCompany = async (req, res) => {
    try {
        const userId = req.userId;
        const company = await Company.findOne({ userId }); //Logged in User Id
        if (!company) {
            return res.status(404).json({ message: "No data found for Company", success: false });
        }
        return res.status(202).json({ company, success: true });
    } catch (error) {
        console.log(`Cannot Get a Company due to error:${error}`);
        return res.status(404).json({ message: "Comapny Details Fetching Failed", success: false });
    }
}
const getAllCompany = async (req, res) => {
    try {
        const userId = req.userId;

        const companies = await Company.find({ userId });

        if (!companies || companies.length === 0) {
            return res.status(404).json({
                message: "No data found for Company",
                success: false
            });
        }

        return res.status(200).json({
            companies,
            success: true
        });

    } catch (error) {
        console.log(`Cannot Get a Company due to error: ${error}`);
        return res.status(500).json({
            message: "Company Details Fetching Failed",
            success: false
        });
    }
}
const getCompanybyId = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id); 
        if (!company) {
            return res.status(404).json({ message: "No data found for Company", success: false });
        }
        return res.status(202).json({ company, success: true });
    } catch (error) {
        console.log(`Cannot Get a Company due to error:${error}`);
        return res.status(404).json({ message: "Comapny Details Fetching Failed", success: false });
    }
}
const update = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;

        const companyData = {};

        if (name) companyData.name = name;
        if (description) companyData.description = description;
        if (website) companyData.website = website;
        if (location) companyData.location = location;

        if (req.file) {
            companyData.logo = `/uploads/${req.file.filename}`;
        }

        const company = await Company.findByIdAndUpdate(
            req.params.id,
            companyData,
            { new: true }
        );

        if (!company) {
            return res.status(404).json({
                message: "Company update failed",
                success: false
            });
        }

        return res.status(200).json({
            message: "Company updated successfully",
            company,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Company update failed",
            success: false
        });
    }
};
module.exports = { register, getCompany, getCompanybyId, update, getAllCompany };
