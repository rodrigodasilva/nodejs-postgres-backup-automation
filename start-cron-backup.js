import { CronJob } from 'cron'

import { logger } from './logger.js'
import { backup } from './backup.js'

const job = new CronJob(
	'0 0 20 * * *', // cronTime
	function () {
		backup()             
	}, // onTick
	null, // onComplete
	true, // start
	'America/Sao_Paulo' // timeZone
)

logger.log('Cron running')