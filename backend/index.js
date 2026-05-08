import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

const app = express(); 
const upload = multer();
const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY});

const GEMINI_MODEL = 'gemini-2.5-flash';

const models = await ai.models.list();
console.log(models);

app.use(express.json());

app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt
        })

        res.status(200).json({ result: response.text })
    } catch (e) {
        console.log(e);
        res.status(500).json({message: e.message})
    }
})

app.post('/generate-from-image', upload.single('image'), async (req, res) => {
    const { prompt } = req.body;
    const base64Image = req.file.buffer.toString('base64')

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt },
                { inlineData: { data: base64Image, mimeType: req.file.mimetype } }
            ]
        })

        res.status(200).json({ result: response.text })
    } catch (e) {
        console.log(e);
        res.status(500).json({message: e.message})
    }
})

app.post('/generate-from-document', upload.single('document'), async (req, res) => {
    const { prompt } = req.body;
    const mimeType = req.file.mimetype;
    const defaultPrompt = "Tolong buat ringkasan dokumen berikut";

    try {
        let contents;

        if (mimeType === 'application/pdf') {
            // PDF: send as inlineData
            const base64Document = req.file.buffer.toString('base64');
            contents = [
                { text: prompt ?? defaultPrompt },
                { inlineData: { data: base64Document, mimeType } }
            ];
        } else {
            // Text/Markdown: send as plain text
            const documentText = req.file.buffer.toString('utf-8');
            contents = [
                { text: prompt ?? defaultPrompt },
                { text: documentText }
            ];
        }

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents
        })
        
        res.status(200).json({ result: response.text })
    } catch (e) {
        console.log(e);
        res.status(500).json({message: e.message})
    }
})

app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
    const { prompt } = req.body;
    const base64Audio = req.file.buffer.toString('base64')

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { 
                    text: prompt ?? "Tolong buatkan transkrip dari audio berikut", 
                    type: "text" 
                },
                { 
                    inlineData: { 
                        data: base64Audio, 
                        mimeType: req.file.mimetype 
                    } 
                }
            ]
        })
        res.status(200).json({ result: response.text })
    } catch (e) {
        console.log(e);
        res.status(500).json({message: e.message})
    }
})

app.listen(4443, () => {
  console.log('Server is running on port 4443');
});