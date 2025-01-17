import express, { Request, Response } from 'express';
import path from 'path';
import { RedisUtil } from './redis';
import cors from 'cors';

export class Web {
	private app = express();
	private PORT = process.env.WEB_PORT || 3000;
	private redis: RedisUtil;

	constructor(redis: RedisUtil) {
		this.redis = redis;
		this.app.use(cors());
		this.app.post('/api/verify/:code', this.verifyCode.bind(this));
		this.app.get('/api/analytics', this.analytics.bind(this));
		const frontendBuildPath = process.env.STATIC_PATH || path.join(__dirname, 'frontend/build');
		this.app.use(express.static(frontendBuildPath));
		this.app.get('*', (req, res) => {
			res.sendFile(frontendBuildPath);
		});

		this.app.listen(this.PORT);
		console.log(`Web listening on port ${this.PORT}`);
	}

	async verifyCode(req: Request, res: Response) {
		const { code } = req.params;
		const value = await this.redis.getPlayerByCode(code);
		if (!value) return res.status(404).json({ error: 'Invalid code' });
		await this.redis.deleteCode(value.code);
		return res.json({
			code: value.code,
			created: value.created,
			expiry: value.expiry,
			uuid: value.uuid,
			username: value.username,
		});
	}

	async analytics(req: Request, res: Response) {
		const analytics = await this.redis.getAnalytics();
		return res.json(analytics);
	}
}
