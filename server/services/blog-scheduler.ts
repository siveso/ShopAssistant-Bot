import cron from 'node-cron';
import { blogGenerator } from './blog-generator';

export class BlogScheduler {
  private isRunning = false;

  constructor() {
    console.log('📅 Blog scheduler yaratildi');
  }

  /**
   * Avtomatik blog yaratish schedulerini ishga tushirish
   */
  start(): void {
    if (this.isRunning) {
      console.log('⚠️  Blog scheduler allaqachon ishlamoqda');
      return;
    }

    // Har kuni soat 9:00 da yangi blog kontentlari yaratish
    cron.schedule('0 9 * * *', async () => {
      console.log('🕘 Soat 9:00: Avtomatik blog yaratish boshlandi');
      try {
        await blogGenerator.generateBlogContent();
      } catch (error) {
        console.error('Scheduled blog yaratishda xatolik:', error);
      }
    }, {
      timezone: "Asia/Tashkent"
    });

    // Har 6 soatda yangi kontent tekshirish (test uchun)
    cron.schedule('0 */6 * * *', async () => {
      console.log('🔄 6 soat o\'tdi: Blog kontentini tekshirish');
      try {
        await blogGenerator.updateExistingBlogs();
      } catch (error) {
        console.error('Blog yangilashda xatolik:', error);
      }
    }, {
      timezone: "Asia/Tashkent"
    });

    this.isRunning = true;
    console.log('✅ Blog scheduler ishga tushdi');
    console.log('📝 Har kuni 09:00 da avtomatik blog yaratiladi');
    console.log('🔍 Har 6 soatda bloglar tekshiriladi');
  }

  /**
   * Schedulerni to'xtatish
   */
  stop(): void {
    cron.destroy();
    this.isRunning = false;
    console.log('⏹️  Blog scheduler to\'xtatildi');
  }

  /**
   * Darhol blog yaratishni ishga tushirish (manual)
   */
  async generateNow(): Promise<void> {
    console.log('🚀 Manual blog yaratish boshlandi...');
    try {
      await blogGenerator.generateBlogContent();
    } catch (error) {
      console.error('Manual blog yaratishda xatolik:', error);
      throw error;
    }
  }

  /**
   * Scheduler holati
   */
  getStatus(): { isRunning: boolean; nextRuns: string[] } {
    return {
      isRunning: this.isRunning,
      nextRuns: this.isRunning ? [
        'Har kuni 09:00 (Toshkent vaqti)',
        'Har 6 soatda tekshirish'
      ] : []
    };
  }
}

export const blogScheduler = new BlogScheduler();