const express = require('express');
const zlib = require('zlib');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const port = 80;
const chunksFolder = './chunks/';

// Create the chunks folder if it doesn't exist
if (!fs.existsSync(chunksFolder)) {
	fs.mkdirSync(chunksFolder);
}

// Store endpoint
app.post('/store', (req, res) => {
	const { filename, text } = req.body;
	const textBuffer = Buffer.from(text, 'utf8');
	const compressedData = zlib.brotliCompressSync(textBuffer);
	const chunkSize = 1024; // 1KB

	const fileId = crypto.createHash('md5').update(textBuffer).digest('hex');
	const fileChunks = [];

	for (let i = 0; i < compressedData.length; i += chunkSize) {
		const chunk = compressedData.slice(i, i + chunkSize);
		const chunkId = crypto.createHash('md5').update(chunk).digest('hex');
		const chunkFilename = `${chunksFolder}${chunkId}`;

		if (!fs.existsSync(chunkFilename)) {
			fs.writeFileSync(chunkFilename, chunk);
		}

		fileChunks.push(chunkId);
	}

	const fileMetadata = {
		fileId,
		filename,
		chunks: fileChunks
	};

	// Store the metadata for file reconstruction during read

	res.json({ fileId });
});

// Read endpoint
app.get('/read/:id', (req, res) => {
	const { id } = req.params;

	// Retrieve file metadata based on the id

	const fileChunks = []; // Array to store the chunks

	for (const chunkId of fileMetadata.chunks) {
		const chunkFilename = `${chunksFolder}${chunkId}`;

		const chunk = fs.readFileSync(chunkFilename);
		fileChunks.push(chunk);
	}

	const fileData = Buffer.concat(fileChunks);
	const decompressedData = zlib.brotliDecompressSync(fileData);

	res.set('Content-Encoding', 'br');
	res.send(decompressedData);
});

// Delete endpoint
app.get('/delete/:id', (req, res) => {
	const { id } = req.params;

	// Retrieve file metadata based on the id

	for (const chunkId of fileMetadata.chunks) {
		const chunkFilename = `${chunksFolder}${chunkId}`;

		fs.unlinkSync(chunkFilename);
	}

	// Remove the file metadata

	res.send('File deleted successfully.');
});

// Get size endpoint
app.get('/getsize/:id', (req, res) => {
	const { id } = req.params;

	// Retrieve file metadata based on the id

	const totalSize = fileMetadata.chunks.length * 1024; // Assuming all chunks are 1KB

	res.json({ size: totalSize });
});

// Start the server
app.listen(port, () => {
	console.log(`Name server running on http://localhost:${port}`);
});
