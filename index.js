const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 80;
const chunksFolder = './chunks';

// Middleware to parse JSON request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create the chunks folder if it doesn't exist
if (!fs.existsSync(chunksFolder)) {
	fs.mkdirSync(chunksFolder);
}

function content(text) {
	return `<center>${text}<br/><br/><a href="/">Go back</a></center>`;
}

// Store endpoint
app.post('/store', (req, res) => {
	const { filename, text } = req.body;
	const filenamePath = `${__dirname}/${chunksFolder}/${filename}`;

	fs.writeFileSync(filenamePath, text);
	res.send(content('File saved successfully!'));
});

// Read endpoint
app.get('/read/:filename', (req, res) => {
	const { filename } = req.params;
	const filenamePath = `${__dirname}/${chunksFolder}/${filename}`;

	if (fs.existsSync(filenamePath)) {
		const fileData = fs.readFileSync(filenamePath, 'utf-8');

		res.send(content('<h3>File Content:</h3>' + fileData));
	} else {
		res.status(404).send(content('File not found'));
	}
});

// Delete endpoint
app.get('/delete/:id', (req, res) => {
	const { id } = req.params;
	const filenamePath = `${__dirname}/${chunksFolder}/${id}`;

	if (fs.existsSync(filenamePath)) {
		fs.unlinkSync(filenamePath);

		res.send(content('File deleted successfully!'));
	} else {
		res.status(404).send(content('File not found'));
	}
});

// Get size endpoint
app.get('/getsize/:id', (req, res) => {
	const { id } = req.params;
	const filenamePath = `${__dirname}/${chunksFolder}/${id}`;

	if (fs.existsSync(filenamePath)) {
		const fileMetadata = fs.readFileSync(filenamePath, 'utf-8');
		const totalSize = fileMetadata.length;
		res.send(content(`File size is: ${totalSize} KB`));
	} else {
		res.status(404).send(content('Error getting file size'));
	}
});

// Get all files
app.get('/files', (req, res) => {
	const folderPath = `${__dirname}/${chunksFolder}`;

	fs.readdir(folderPath, (err, files) => {
		if (err) {
			res.status(500).json({ success: false });
		} else {
			res.json({ success: true, files });
		}
	});
});

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

// Start the server
app.listen(port, () => {
	console.log(`File system running on http://localhost:${port}`);
});
