const BASE_URL = 'http://localhost:3001/api'; // Backend server URL

export async function uploadFiles(formData: FormData) {
  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to upload files');
  }
  return response.json();
}

export async function submitFormData(formData: any) {
  const response = await fetch(`${BASE_URL}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  if (!response.ok) {
    throw new Error('Failed to submit form data');
  }
  return response.json();
}
