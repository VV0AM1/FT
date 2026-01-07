
import * as fs from 'fs';
import * as path from 'path';

async function upload() {
    // Correct path to the sample file we created earlier
    const filePath = path.resolve(__dirname, '../../../sample_statement.csv');

    console.log(`Looking for file at: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error('Error: File not found at', filePath);
        return;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'text/csv' });

    // Create FormData
    const formData = new FormData();
    formData.append('file', blob, 'sample_statement.csv');

    console.log('Uploading file...');

    try {
        const response = await fetch('http://localhost:3000/documents/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        console.log('------------------------------------------------');
        console.log(`Status Code: ${response.status}`);
        console.log('Response:', JSON.stringify(data, null, 2));
        console.log('------------------------------------------------');

        if (response.status === 201 || response.status === 200) {
            console.log('✅ Upload Successful!');
        } else {
            console.log('❌ Upload Failed');
        }

    } catch (error) {
        console.error('Network Error:', error);
    }
}

upload();
