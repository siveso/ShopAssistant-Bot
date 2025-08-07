import Parser from 'rss-parser';
import { GoogleGenAI } from '@google/genai';
import slugify from 'slugify';
import { storage } from '../storage';
import { InsertBlog } from '@shared/schema';

const rssParser = new Parser();

// RSS manbalar ro'yxati
const RSS_FEEDS = [
  {
    url: 'https://techcrunch.com/feed/',
    name: 'TechCrunch',
    category: 'technology'
  },
  {
    url: 'https://feeds.feedburner.com/venturebeat/SZYF',
    name: 'VentureBeat', 
    category: 'technology'
  },
  {
    url: 'https://rss.cnn.com/rss/edition.rss',
    name: 'CNN',
    category: 'news'
  },
  {
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    name: 'BBC News',
    category: 'news'
  }
];

export class BlogGeneratorService {
  private geminiAPI: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.geminiAPI = new GoogleGenAI({ apiKey });
    }
  }

  /**
   * RSS feeddan yangi maqolalarni olish
   */
  async fetchRSSArticles(feedUrl: string): Promise<any[]> {
    try {
      const feed = await rssParser.parseURL(feedUrl);
      return feed.items.slice(0, 5); // Oxirgi 5 ta maqolani olish
    } catch (error) {
      console.error(`RSS feed olishda xatolik (${feedUrl}):`, error);
      return [];
    }
  }

  /**
   * Maqolani o'zbek va rus tillariga tarjima qilish
   */
  async translateArticle(title: string, content: string, sourceUrl: string): Promise<{
    titleUz: string;
    titleRu: string;
    contentUz: string;
    contentRu: string;
    excerptUz: string;
    excerptRu: string;
  } | null> {
    if (!this.geminiAPI) {
      console.warn('Gemini API key topilmadi');
      return null;
    }

    try {
      const prompt = `
Quyidagi inglizcha maqolani professional darajada o'zbek va rus tillariga tarjima qiling:

SARLAVHA: ${title}
MAZMUN: ${content.substring(0, 2000)}...

Javobni quyidagi JSON formatida bering:
{
  "titleUz": "O'zbek tilidagi sarlavha",
  "titleRu": "Русский заголовок", 
  "excerptUz": "Qisqacha mazmun o'zbek tilida (150 so'z)",
  "excerptRu": "Краткое содержание на русском (150 слов)",
  "contentUz": "To'liq mazmun o'zbek tilida",
  "contentRu": "Полное содержание на русском языке"
}

Tarjima talablari:
- Professional va aniq tarjima
- O'zbek tilida rasmiy uslub
- Rus tilida ham rasmiy uslub  
- Texnik atamalar to'g'ri tarjima qilinsin
- Maqola oxirida manba ko'rsatilsin: "Manba: ${sourceUrl}"
`;

      const response = await this.geminiAPI.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
        },
        contents: prompt,
      });

      const result = JSON.parse(response.text || '{}');
      
      return {
        titleUz: result.titleUz || title,
        titleRu: result.titleRu || title,
        contentUz: result.contentUz ? `${result.contentUz}\n\nManba: ${sourceUrl}` : content,
        contentRu: result.contentRu ? `${result.contentRu}\n\nИсточник: ${sourceUrl}` : content,
        excerptUz: result.excerptUz || result.contentUz?.substring(0, 200) + '...' || '',
        excerptRu: result.excerptRu || result.contentRu?.substring(0, 200) + '...' || '',
      };

    } catch (error) {
      console.error('Tarjima qilishda xatolik:', error);
      return null;
    }
  }

  /**
   * Blog postini yaratish va saqlash
   */
  async createBlogPost(article: any, translation: any, category: string, sourceName: string): Promise<void> {
    try {
      const slug = slugify(translation.titleUz, { lower: true, strict: true });
      
      const blogPost: InsertBlog = {
        titleUz: translation.titleUz,
        titleRu: translation.titleRu,
        contentUz: translation.contentUz,
        contentRu: translation.contentRu,
        excerptUz: translation.excerptUz,
        excerptRu: translation.excerptRu,
        slug: slug,
        authorName: sourceName,
        tags: [category, 'avtomatik', 'yangilik'],
        isPublished: true,
        publishedAt: new Date(),
        imageUrl: article.enclosure?.url || null
      };

      await storage.createBlog(blogPost);
      console.log(`Yangi blog posti yaratildi: ${translation.titleUz}`);

    } catch (error) {
      console.error('Blog postini saqlashda xatolik:', error);
    }
  }

  /**
   * Barcha RSS feedlardan kontent yaratish
   */
  async generateBlogContent(): Promise<void> {
    console.log('📰 Avtomatik blog kontent yaratish boshlandi...');

    for (const feed of RSS_FEEDS) {
      try {
        console.log(`📡 RSS olinmoqda: ${feed.name}`);
        const articles = await this.fetchRSSArticles(feed.url);
        
        for (const article of articles.slice(0, 2)) { // Har bir feed dan 2 ta maqola
          if (!article.title || !article.contentSnippet) continue;

          console.log(`🔄 Tarjima qilinmoqda: ${article.title.substring(0, 50)}...`);
          
          const translation = await this.translateArticle(
            article.title,
            article.contentSnippet || article.content || '',
            article.link || ''
          );

          if (translation) {
            await this.createBlogPost(article, translation, feed.category, feed.name);
            
            // API rate limit uchun kutish
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }

        // Feedlar orasida kutish
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error) {
        console.error(`${feed.name} uchun blog yaratishda xatolik:`, error);
      }
    }

    console.log('✅ Blog kontent yaratish tugallandi');
  }

  /**
   * Mavjud bloglarni yangilash (agar kerak bo'lsa)
   */
  async updateExistingBlogs(): Promise<void> {
    try {
      const blogs = await storage.getAllBlogs();
      console.log(`📊 ${blogs.length} ta blog mavjud`);
      
      // Bu yerda eski bloglarni yangilash yoki optimizatsiya qilish mumkin
    } catch (error) {
      console.error('Bloglarni yangilashda xatolik:', error);
    }
  }
}

export const blogGenerator = new BlogGeneratorService();