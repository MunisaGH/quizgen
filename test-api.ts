import fs from 'fs';
import FormData from 'form-data';

async function test() {
  const formData = new FormData();
  formData.append('file', Buffer.from('test text to generate questions'), {
    filename: 'test.docx',
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  try {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch('https://ais-dev-b4vzkazug6jb4x5nqfpsgi-14213601253.asia-southeast1.run.app/api/generate-quiz', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', text);
  } catch (err) {
    console.error(err);
  }
}
test();
