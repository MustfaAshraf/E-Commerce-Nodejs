const Contact = require('../models/message.model');

// GET: Show Contact Page
exports.getContactPage = (req, res) => {
    res.render('shop/contact', {
        pageTitle: 'Contact Us',
        user: req.user, // Pass user to pre-fill form
        message: null,
        error: null
    });
};

// POST: Handle Form Submission
exports.submitContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        await Contact.create({ name, email, phone, subject, message });

        res.render('shop/contact', {
            pageTitle: 'Contact Us',
            user: req.user,
            message: 'Your message has been sent successfully!', // Success Alert
            error: null
        });

    } catch (err) {
        console.error(err);
        res.render('contact', {
            pageTitle: 'Contact Us',
            user: req.user,
            message: null,
            error: 'Failed to send message. Please try again.' // Error Alert
        });
    }
};