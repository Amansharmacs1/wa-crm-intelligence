const { generateChatResponse } = require('../../../model/gemini.service');

const handleChat = async (req, res, next) => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }
        
        const reply = await generateChatResponse({ message, history });
        
        res.status(200).json({ success: true, reply });
    } catch (err) {
        console.error('Error generating chat response:', err);
        res.status(500).json({ success: false, error: 'Failed to generate chat response' });
    }
};

module.exports = {
    handleChat
};
