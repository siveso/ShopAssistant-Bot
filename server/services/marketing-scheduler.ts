import cron from 'node-cron';
import { storage } from '../storage';

interface MarketingMessage {
  id: string;
  titleUz: string;
  titleRu: string;
  contentUz: string;
  contentRu: string;
  imageUrl?: string;
  isActive: boolean;
  intervalDays: number;
  createdAt: Date;
  lastSentAt?: Date;
}

export class MarketingScheduler {
  private telegramBot: any;
  private cronJob: any;

  constructor(telegramBot: any) {
    this.telegramBot = telegramBot;
    this.initializeScheduler();
  }

  private initializeScheduler() {
    // Run every day at 10:00 AM
    this.cronJob = cron.schedule('0 10 * * *', async () => {
      await this.sendScheduledMarketingMessages();
    }, {
      timezone: "Asia/Tashkent"
    });
  }

  public startScheduler() {
    if (this.cronJob) {
      this.cronJob.start();
      console.log('Marketing scheduler started');
    }
  }

  public stopScheduler() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('Marketing scheduler stopped');
    }
  }

  private async sendScheduledMarketingMessages() {
    try {
      console.log('Checking for marketing messages to send...');
      
      const marketingMessages = await this.getActiveMarketingMessages();
      const users = await storage.getAllUsers();
      const telegramUsers = users.filter(user => user.platformType === 'telegram');

      for (const message of marketingMessages) {
        const shouldSend = await this.shouldSendMessage(message);
        
        if (shouldSend) {
          console.log(`Sending marketing message: ${message.titleUz}`);
          
          let sentCount = 0;
          for (const user of telegramUsers) {
            try {
              await this.sendMarketingMessageToUser(user, message);
              sentCount++;
              
              // Add delay between messages to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error: any) {
              console.error(`Failed to send marketing message to user ${user.id}:`, error);
            }
          }
          
          // Update last sent time
          await this.updateMessageLastSent(message.id);
          console.log(`Marketing message sent to ${sentCount} users`);
        }
      }
    } catch (error) {
      console.error('Error in marketing scheduler:', error);
    }
  }

  private async getActiveMarketingMessages(): Promise<MarketingMessage[]> {
    // This would be implemented when we have the marketing messages table
    // For now, return default messages
    return [
      {
        id: 'default-1',
        titleUz: '🎉 Yangi Chegirmalar!',
        titleRu: '🎉 Новые Скидки!',
        contentUz: `🛍️ Hurmatli mijoz!\n\n🎊 Bizda yangi chegirmalar boshlandi!\n💫 20% gacha chegirma barcha mahsulotlarga\n⏰ Muddat: 3 kun\n\n📦 Katalogni ko'rish uchun tugmani bosing!`,
        contentRu: `🛍️ Уважаемый клиент!\n\n🎊 У нас началась новая акция!\n💫 Скидки до 20% на все товары\n⏰ Срок: 3 дня\n\n📦 Нажмите кнопку для просмотра каталога!`,
        isActive: true,
        intervalDays: 2,
        createdAt: new Date(),
        lastSentAt: undefined
      },
      {
        id: 'default-2',
        titleUz: '🚚 Bepul Yetkazib Berish!',
        titleRu: '🚚 Бесплатная Доставка!',
        contentUz: `🎁 Ajoyib yangilik!\n\n🚚 100,000 so'mdan yuqori buyurtmalarga bepul yetkazib berish!\n📍 Butun O'zbekiston bo'ylab\n⚡ Tez va ishonchli\n\n🛒 Hoziroq buyurtma bering!`,
        contentRu: `🎁 Отличные новости!\n\n🚚 Бесплатная доставка при заказе от 100,000 сум!\n📍 По всему Узбекистану\n⚡ Быстро и надежно\n\n🛒 Заказывайте прямо сейчас!`,
        isActive: true,
        intervalDays: 2,
        createdAt: new Date(),
        lastSentAt: undefined
      }
    ];
  }

  private async shouldSendMessage(message: MarketingMessage): Promise<boolean> {
    if (!message.isActive) return false;
    
    if (!message.lastSentAt) return true;
    
    const daysSinceLastSent = (Date.now() - message.lastSentAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastSent >= message.intervalDays;
  }

  private async sendMarketingMessageToUser(user: any, message: MarketingMessage) {
    const language = user.preferredLanguage || 'uz';
    const title = language === 'uz' ? message.titleUz : message.titleRu;
    const content = language === 'uz' ? message.contentUz : message.contentRu;
    
    const fullMessage = `${title}\n\n${content}`;
    
    const keyboard = {
      inline_keyboard: [
        [
          { 
            text: language === 'uz' ? '📦 Katalog' : '📦 Каталог', 
            callback_data: 'catalog' 
          },
          { 
            text: language === 'uz' ? '🛒 Savatcha' : '🛒 Корзина', 
            callback_data: 'cart' 
          }
        ],
        [
          { 
            text: language === 'uz' ? '📞 Biz bilan aloqa' : '📞 Связаться с нами', 
            callback_data: 'contact' 
          }
        ]
      ]
    };

    if (message.imageUrl) {
      try {
        await this.telegramBot.sendPhoto(user.platformId, message.imageUrl, {
          caption: fullMessage,
          reply_markup: keyboard
        });
      } catch (error: any) {
        // Fallback to text message
        await this.telegramBot.sendMessage(user.platformId, fullMessage, { reply_markup: keyboard });
      }
    } else {
      await this.telegramBot.sendMessage(user.platformId, fullMessage, { reply_markup: keyboard });
    }
  }

  private async updateMessageLastSent(messageId: string) {
    // This would update the database when we have the marketing messages table
    // For now, we'll store it in memory or skip
    console.log(`Updated last sent time for message ${messageId}`);
  }

  // Manual method to send marketing messages immediately
  public async sendMarketingMessageNow(messageId: string) {
    try {
      const marketingMessages = await this.getActiveMarketingMessages();
      const message = marketingMessages.find(m => m.id === messageId);
      
      if (!message) {
        throw new Error('Marketing message not found');
      }

      const users = await storage.getAllUsers();
      const telegramUsers = users.filter(user => user.platformType === 'telegram');

      let sentCount = 0;
      for (const user of telegramUsers) {
        try {
          await this.sendMarketingMessageToUser(user, message);
          sentCount++;
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to send marketing message to user ${user.id}:`, error);
        }
      }

      await this.updateMessageLastSent(message.id);
      return { success: true, sentCount };
    } catch (error) {
      console.error('Error sending marketing message:', error);
      throw error;
    }
  }
}