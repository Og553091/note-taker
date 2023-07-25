const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const notesData = require("./db/db.json")

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/notes", (req, res) => {
    res.sendFile(__dirname + "/public/notes.html")
})

app.get("/api/notes", (req, res) => {
    res.json(notesData)
})

app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;
    const id = uuidv4();

    const newData = {
        title,
        text,
        id
    };

    let jsonData = [];

    fs.promises.readFile(path.join(__dirname, "db", "db.json"), "utf-8")
        .then(fileData => {
            jsonData = JSON.parse(fileData);

            jsonData.push(newData);

            return fs.promises.writeFile(path.join(__dirname, "db", "db.json"), JSON.stringify(jsonData));
        })
        .then(() => {
            console.log('Data saved successfully.');
            res.status(200).json(jsonData);
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).json({ message: 'Failed to save data.' });
        });
});

app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;

    fs.readFile('./db/db.json', 'utf8', (err, fileData) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).json({ message: 'Failed to read data.' });
        }

        let jsonData = JSON.parse(fileData);

        const updatedData = jsonData.filter((note) => note.id !== noteId);

        fs.writeFile('./db/db.json', JSON.stringify(updatedData), (err) => {
            if (err) {
                console.error('Error writing JSON file:', err);
                return res.status(500).json({ message: 'Failed to save data.' });
            }

            console.log('Data saved successfully.');
            res.status(200).json({ message: 'Note deleted successfully.' });
        });
    });
});


app.get("*", (req, res) => {
    res.sendFile(__dirname + "/public/index.html")
})

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});