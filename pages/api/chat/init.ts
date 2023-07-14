import type { NextApiRequest, NextApiResponse } from 'next';
import * as crypto from 'crypto';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	//only accept GET requests
	if (req.method !== 'GET') {
		res.status(405).json({ error: 'Method not allowed' });
		return;
	}

	try {
		// Generate a random string
		const randomString: string = generateRandomString(10);

		// Hash the random string using MD5
		const randomStringHash: string = crypto.createHash('md5').update(randomString).digest('hex');

		res.status(200).json({
			success: true,
			data: {
				hash: randomStringHash,
				initMessage: 'Hello! I am your AI assistant. Let me know how I can help!',
			}
		});
	} catch (error: any) {
		console.log('error', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Something went wrong'
		});
	}
}

function generateRandomString(length: number): string {
	const characters: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let randomString: string = '';

	for (let i = 0; i < length; i++) {
		const randomIndex: number = Math.floor(Math.random() * characters.length);
		randomString += characters.charAt(randomIndex);
	}

	return randomString;
}