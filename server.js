const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const nodemailer = require('nodemailer');

app.use(express.json());
app.use(cors({ origin: "*" }));

const port = process.env.PORT || 3000;

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://mathewsgeorge202:ansu@cluster0.ylyaonw.mongodb.net/NFC', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDB connected successfully");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});

// Create separate schemas for each teacher's collection
const jiniRecordSchema = new mongoose.Schema({
    serialNumber: String,
    logData: String,
    time: String,
    period: String,
    subject: String,
}, { collection: 'jini_records' });

const anithaRecordSchema = new mongoose.Schema({
    serialNumber: String,
    logData: String,
    time: String,
    period: String,
    subject: String,
}, { collection: 'anitha_records' });

const nimithaRecordSchema = new mongoose.Schema({
    serialNumber: String,
    logData: String,
    time: String,
    period: String,
    subject: String,
}, { collection: 'nimitha_records' });

// Create separate models based on the schemas
const JiniRecord = mongoose.model('JiniRecord', jiniRecordSchema);
const AnithaRecord = mongoose.model('AnithaRecord', anithaRecordSchema);
const NimithaRecord = mongoose.model('NimithaRecord', nimithaRecordSchema);

// Endpoint to receive check-in and check-out data
app.post('/record', async (req, res) => {
    const { serialNumber, logData, time, teacher, period, subject } = req.body;
    try {
        let recordModel;

        // Determine which teacher was selected and choose the appropriate model
        switch (teacher.toUpperCase()) {
            case 'JINI':
                recordModel = JiniRecord;
                break;
            case 'ANITHA':
                recordModel = AnithaRecord;
                break;
            case 'NIMITHA':
                recordModel = NimithaRecord;
                break;
            default:
                recordModel = null;
        }

        if (!recordModel) {
            return res.status(400).send('Invalid Teacher');
        }

        // Save the record to the appropriate MongoDB collection
        const record = new recordModel({
            serialNumber,
            logData,
            time,
            period,
            subject,
        });
        await record.save();

        res.status(201).send('Record saved successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Add a new schema for tracking total classes
const totalClassSchema = new mongoose.Schema({
    subject: String,
    teacher: String,
    count: { type: Number, default: 0 }
}, { collection: 'total_classes' });    

const TotalClass = mongoose.model('TotalClass', totalClassSchema);

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mathewsgeorge202@gmail.com',
        pass: 'lhmw gvsd pydu wecj'
    }
});

// Function to send email
const sendEmail = async (email, subject, text) => {
    const mailOptions = {
        from: 'mathewsgeorge202@gmail.com',
        to: email,
        subject: subject,
        text: text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Failed to send email:', error);
    }
};

// Endpoint to start a class and increment the count
app.post('/start-class', async (req, res) => {
    const { subject, teacher, readSerialNumbers, period, classIdentifier } = req.body;

    try {
        const record = await TotalClass.findOneAndUpdate(
            { subject, teacher },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
        );

        const currentDate = new Date().toLocaleDateString('en-GB');

        const serialEmails = {
            "05:39:ea:cc:f7:b0:c1": { email: "mathewsgeorge2003@gmail.com", class: "S6" },
            "05:33:96:60:06:b0:c1": { email: "ansurose41@gmail.com", class: "S6" },
            "05:36:41:dc:f7:b0:c1": { email: "keshavumesh001@gmail.com", class: "S6" },
            "05:35:84:cc:f7:b0:c1": { email: "nehacherian570@gmail.com", class: "S6" },
            "05:34:6a:64:26:b0:c1": { email: "", class: "S4" },
            "05:39:01:60:06:b0:c1": { email: "pta21cs044@cek.ac.in", class: "S4" }
        };

        let absenteesNotified = 0;

        await Promise.all(Object.keys(serialEmails).map(async (serial) => {
            if (!readSerialNumbers[serial] && serialEmails[serial].class === classIdentifier) {
                const emailText = `Alert From NFCAMS-CEK You were marked absent for ${subject} on ${currentDate}, during ${period}.`;
                await sendEmail(serialEmails[serial].email, "NFCAMS-Absence Notification", emailText);
                absenteesNotified++;
            }
        }));

        const responseMessage = `Class started for ${subject}. Total classes: ${record.count}. Absence notifications sent successfully to ${absenteesNotified} absentees.`;

        res.status(201).send(responseMessage);
    } catch (error) {
        console.error("Error in /start-class endpoint:", error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
