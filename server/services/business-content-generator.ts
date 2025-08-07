import { GoogleGenAI } from '@google/genai';
import slugify from 'slugify';
import { storage } from '../storage';
import { InsertBlog } from '@shared/schema';

export class BusinessContentGenerator {
  private geminiAPI: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.geminiAPI = new GoogleGenAI({ apiKey });
    }
  }

  /**
   * Biznes va AI mavzularida maqolalar yaratish
   */
  async generateBusinessContent(): Promise<void> {
    if (!this.geminiAPI) {
      console.warn('Gemini API key topilmadi');
      return;
    }

    const topics = [
      {
        title: "Biznesda Sun'iy Intellektning O'rni",
        prompt: `
Biznesda sun'iy intellektning o'rni va ahamiyati haqida professional maqola yozing.
Quyidagi mavzularni qamrab oling:
- AI ning biznesga ta'siri
- Kichik va o'rta bizneslar uchun AI imkoniyatlari
- AI yordamida biznes jarayonlarini avtomatlashtirish
- AI ning kelajakdagi rivojlanish yo'nalishlari
- O'zbekistonda AI texnologiyalarining joriy etilishi

Maqola 800-1000 so'zdan iborat bo'lsin va professional uslubda yozilsin.
`,
        category: "biznes-ai"
      },
      {
        title: "E-commerce: Onlayn Savdo Platforma Yaratish",
        prompt: `
Onlayn savdo platformasini yaratish va rivojlantirish bo'yicha to'liq qo'llanma yozing.
Quyidagi mavzularni qamrab oling:
- E-commerce platformasi yaratishning asosiy bosqichlari
- Mijozlar bilan munosabat o'rnatish strategiyalari
- Onlayn to'lov tizimlari va xavfsizlik
- SEO va digital marketing usullari
- Mahsulot katalogini boshqarish
- O'zbekiston bozorida e-commerce rivoji

Maqola amaliy maslahatlar bilan boyitilgan bo'lsin.
`,
        category: "e-commerce"
      },
      {
        title: "Telegram Bot Orqali Biznesni Avtomatlashtirish",
        prompt: `
Telegram bot yordamida biznes jarayonlarini avtomatlashtirish haqida maqola yozing.
Quyidagi mavzularni qamrab oling:
- Telegram botning biznes uchun afzalliklari
- Mijozlarga xizmat ko'rsatishda botlar
- Buyurtma qabul qilish va boshqarish
- Bot orqali marketing va reklama
- Chatbot va sun'iy intellekt integratsiyasi
- Real biznes misollar

Maqola texnik va amaliy jihatlarni o'z ichiga olsin.
`,
        category: "telegram-bot"
      },
      {
        title: "Ko'p Tilli Veb-saytlar: Global Bozorga Chiqish",
        prompt: `
Ko'p tilli veb-saytlar yaratish va global bozorga chiqish strategiyalari haqida yozing.
Quyidagi mavzularni qamrab oling:
- Multilingual website yaratishning afzalliklari
- SEO va ko'p tillilik
- O'zbek va rus tillarida kontent yaratish
- Mahalliy bozorlarni tushunish
- Translation va localization farqi
- Texnik jihatlar va yaxshi amaliyotlar

Maqola xalqaro tajriba va mahalliy bozor haqida ma'lumot bersin.
`,
        category: "multilingual"
      },
      {
        title: "Modern Web Texnologiyalari: React va TypeScript",
        prompt: `
Zamonaviy web dasturlash texnologiyalari React va TypeScript haqida yozing.
Quyidagi mavzularni qamrab oling:
- React frameworkining afzalliklari
- TypeScript va JavaScript farqi
- Component-based architecture
- State management (React Query, Context)
- Performance optimization
- Best practices va coding standards
- Career opportunities

Maqola dasturchilar va biznes egalariga foydali bo'lsin.
`,
        category: "web-tech"
      }
    ];

    console.log('📝 Biznes va AI mavzularida maqolalar yaratilmoqda...');

    for (const topic of topics) {
      try {
        console.log(`✍️ Yaratilmoqda: ${topic.title}`);
        
        const content = await this.generateArticleContent(topic.prompt);
        if (content) {
          await this.saveBlogPost(topic.title, content, topic.category);
          console.log(`✅ Saqlandi: ${topic.title}`);
          
          // API rate limit uchun kutish
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`${topic.title} yaratishda xatolik:`, error);
      }
    }

    console.log('🎉 Biznes maqolalari yaratish tugallandi');
  }

  /**
   * Maqola kontentini yaratish
   */
  private async generateArticleContent(prompt: string): Promise<{
    titleUz: string;
    titleRu: string;
    contentUz: string;
    contentRu: string;
    excerptUz: string;
    excerptRu: string;
  } | null> {
    if (!this.geminiAPI) return null;

    try {
      const fullPrompt = `${prompt}

Javobni quyidagi JSON formatida bering:
{
  "titleUz": "O'zbek tilidagi sarlavha",
  "titleRu": "Русский заголовок",
  "excerptUz": "Qisqacha mazmun o'zbek tilida (200 so'z)",
  "excerptRu": "Краткое содержание на русском (200 слов)",
  "contentUz": "To'liq maqola o'zbek tilida (800-1000 so'z)",
  "contentRu": "Полная статья на русском языке (800-1000 слов)"
}

Talablar:
- Professional va informatif uslub
- Amaliy maslahatlar va misollar
- O'zbek tilida rasmiy uslub
- Rus tilida ham rasmiy uslub
- SEO-friendly kontent
- Biznes va texnologiya sohasiga oid`;

      const response = await this.geminiAPI.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
        },
        contents: fullPrompt,
      });

      const result = JSON.parse(response.text || '{}');
      return result;

    } catch (error) {
      console.error('Maqola yaratishda xatolik:', error);
      return null;
    }
  }

  /**
   * Blog postini saqlash
   */
  private async saveBlogPost(
    baseTitle: string, 
    content: any, 
    category: string
  ): Promise<void> {
    try {
      const slug = slugify(content.titleUz || baseTitle, { lower: true, strict: true });
      
      const blogPost: InsertBlog = {
        titleUz: content.titleUz || baseTitle,
        titleRu: content.titleRu || baseTitle,
        contentUz: content.contentUz || 'Kontent yaratilmoqda...',
        contentRu: content.contentRu || 'Контент создается...',
        excerptUz: content.excerptUz || '',
        excerptRu: content.excerptRu || '',
        slug: slug,
        authorName: 'AI Assistant',
        tags: [category, 'biznes', 'texnologiya', 'ai'],
        isPublished: true,
        publishedAt: new Date(),
        imageUrl: null
      };

      await storage.createBlog(blogPost);
      console.log(`Blog posti saqlandi: ${content.titleUz || baseTitle}`);

    } catch (error) {
      console.error('Blog postini saqlashda xatolik:', error);
    }
  }
}

export const businessContentGenerator = new BusinessContentGenerator();