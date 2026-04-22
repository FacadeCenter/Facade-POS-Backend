import { logger } from '../../config/logger';

export class JobService {
  /**
   * Schedule a job to run in the background.
   * This is a simple implementation that uses setTimeout or immediate execution.
   * In production, this should be replaced by BullMQ or a similar robust queue.
   */
  async schedule(name: string, data: any, delayMs: number = 0) {
    logger.info(`🔄 Scheduling job: ${name} with data: ${JSON.stringify(data)}`);
    
    if (delayMs > 0) {
      setTimeout(() => {
        this.execute(name, data);
      }, delayMs);
    } else {
      setImmediate(() => {
        this.execute(name, data);
      });
    }
  }

  private async execute(name: string, data: any) {
    logger.info(`🚀 Executing job: ${name}`);
    try {
      switch (name) {
        case 'SEND_WELCOME_EMAIL':
          // logic for sending welcome email
          break;
        case 'GENERATE_DAILY_REPORT':
          // logic for report generation
          break;
        default:
          logger.warn(`Unknown job name: ${name}`);
      }
    } catch (error: any) {
      logger.error(`Error executing job ${name}: ${error.message}`);
    }
  }
}

export const jobService = new JobService();
