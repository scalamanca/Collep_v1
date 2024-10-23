'use server'

export async function sendFileToWebhook(formData: FormData) {
  const file = formData.get('file') as File

  if (!file) {
    return { error: 'File is required' }
  }

  const webhookUrl = process.env.WEBHOOK_URL

  if (!webhookUrl) {
    return { error: 'Webhook URL is not configured' }
  }

  try {
    // Read the file content
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create a FormData object to send the file
    const formDataToSend = new FormData()
    formDataToSend.append('file', new Blob([buffer]), file.name)

    // Send the file to the webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formDataToSend,
    })

    if (!response.ok) {
      throw new Error('Webhook request failed')
    }

    return { success: true, message: 'File succesfully uploaded' }
  } catch (error) {
    console.error('Error sending file to webhook:', error)
    return { error: 'Failed to send file to webhook' }
  }
}