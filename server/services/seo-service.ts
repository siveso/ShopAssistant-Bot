import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  structuredData: any;
}

export interface ProductSEORequest {
  nameUz: string;
  nameRu: string;
  descriptionUz?: string;
  descriptionRu?: string;
  price: string;
  category?: string;
  features?: string[];
}

export class SEOService {
  async generateProductSEO(product: ProductSEORequest, language: 'uz' | 'ru'): Promise<SEOData> {
    try {
      const prompt = this.buildSEOPrompt(product, language);
      
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        config: {
          responseMimeType: "application/json"
        },
        contents: prompt
      });

      const rawJson = response.text;
      if (!rawJson) {
        throw new Error("Empty response from Gemini API");
      }

      const seoData: SEOData = JSON.parse(rawJson);
      return seoData;

    } catch (error) {
      console.error("Error generating SEO data:", error);
      return this.getFallbackSEO(product, language);
    }
  }

  private buildSEOPrompt(product: ProductSEORequest, language: 'uz' | 'ru'): string {
    const isUzbek = language === 'uz';
    
    return `
    ${isUzbek ? 'Quyidagi mahsulot uchun SEO optimallashtirilgan kontentni yarating' : 'Создайте SEO-оптимизированный контент для следующего товара'}:

    ${isUzbek ? 'Mahsulot nomi' : 'Название товара'}: ${isUzbek ? product.nameUz : product.nameRu}
    ${isUzbek ? 'Tavsif' : 'Описание'}: ${isUzbek ? product.descriptionUz || '' : product.descriptionRu || ''}
    ${isUzbek ? 'Narx' : 'Цена'}: $${product.price}
    ${isUzbek ? 'Kategoriya' : 'Категория'}: ${product.category || ''}
    ${isUzbek ? 'Xususiyatlar' : 'Особенности'}: ${product.features?.join(', ') || ''}

    ${isUzbek ? 
      'Quyidagi JSON formatida javob bering. SEO uchun Google, Yandex va boshqa qidiruv tizimlariga moslashtirilgan bo\'lishi kerak:' :
      'Ответьте в следующем JSON формате. SEO должно быть оптимизировано для Google, Yandex и других поисковых систем:'
    }

    {
      "title": "${isUzbek ? 'SEO optimallashtirilgan sahifa sarlavhasi (60 belgidan kam)' : 'SEO-оптимизированный заголовок страницы (менее 60 символов)'}",
      "description": "${isUzbek ? 'Meta tavsif (150-160 belgi, foydalanuvchini jalb qiluvchi)' : 'Мета-описание (150-160 символов, привлекающее пользователей)'}",
      "keywords": [${isUzbek ? '"asosiy kalit so\'zlar ro\'yxati"' : '"список основных ключевых слов"'}],
      "ogTitle": "${isUzbek ? 'Open Graph sarlavhasi ijtimoiy tarmoqlar uchun' : 'Open Graph заголовок для социальных сетей'}",
      "ogDescription": "${isUzbek ? 'Open Graph tavsifi ijtimoiy tarmoqlar uchun' : 'Open Graph описание для социальных сетей'}",
      "structuredData": {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": "${isUzbek ? product.nameUz : product.nameRu}",
        "description": "${isUzbek ? product.descriptionUz || product.nameUz : product.descriptionRu || product.nameRu}",
        "offers": {
          "@type": "Offer",
          "price": "${product.price}",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }
      }
    }

    ${isUzbek ? 
      'Eslatma: Barcha matn o\'zbek tilida bo\'lishi va mahalliy qidiruv so\'rovlariga mos kelishi kerak.' :
      'Примечание: Весь текст должен быть на русском языке и соответствовать местным поисковым запросам.'
    }
    `;
  }

  private getFallbackSEO(product: ProductSEORequest, language: 'uz' | 'ru'): SEOData {
    const isUzbek = language === 'uz';
    const name = isUzbek ? product.nameUz : product.nameRu;
    
    return {
      title: `${name} - ${isUzbek ? 'Arzon narxlarda' : 'По доступным ценам'}`,
      description: `${name} ${isUzbek ? 'ni bizning do\'kondan sotib oling. Sifatli mahsulotlar, tez yetkazib berish.' : 'купить в нашем магазине. Качественные товары, быстрая доставка.'}`,
      keywords: [name, isUzbek ? 'sotib olish' : 'купить', isUzbek ? 'narx' : 'цена'],
      ogTitle: name,
      ogDescription: `${name} - $${product.price}`,
      structuredData: {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": name,
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "USD"
        }
      }
    };
  }

  async generateCatalogSEO(language: 'uz' | 'ru'): Promise<SEOData> {
    try {
      const isUzbek = language === 'uz';
      const prompt = `
      ${isUzbek ? 
        'Onlayn do\'kon katalogi uchun SEO optimallashtirilgan kontentni yarating. Do\'kon turli elektronika mahsulotlarini sotadi.' :
        'Создайте SEO-оптимизированный контент для каталога интернет-магазина. Магазин продает различную электронику.'
      }

      JSON formatida javob bering:
      {
        "title": "${isUzbek ? 'Katalog sahifasi uchun SEO sarlavha' : 'SEO заголовок для страницы каталога'}",
        "description": "${isUzbek ? 'Katalog sahifasi uchun meta tavsif' : 'Мета-описание для страницы каталога'}",
        "keywords": [${isUzbek ? '"katalog uchun kalit so\'zlar"' : '"ключевые слова для каталога"'}],
        "ogTitle": "${isUzbek ? 'Ijtimoiy tarmoqlar uchun sarlavha' : 'Заголовок для социальных сетей'}",
        "ogDescription": "${isUzbek ? 'Ijtimoiy tarmoqlar uchun tavsif' : 'Описание для социальных сетей'}",
        "structuredData": {
          "@context": "https://schema.org/",
          "@type": "WebPage",
          "name": "${isUzbek ? 'Mahsulotlar katalogi' : 'Каталог товаров'}"
        }
      }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        config: {
          responseMimeType: "application/json"
        },
        contents: prompt
      });

      const rawJson = response.text;
      if (!rawJson) {
        throw new Error("Empty response from Gemini API");
      }

      return JSON.parse(rawJson);

    } catch (error) {
      console.error("Error generating catalog SEO:", error);
      const isUzbek = language === 'uz';
      return {
        title: isUzbek ? "Mahsulotlar Katalogi - Bizning Do'kon" : "Каталог Товаров - Наш Магазин",
        description: isUzbek ? 
          "Bizning do'kondan sifatli elektronika mahsulotlarini sotib oling. Samsung, Apple, va boshqa brendlar." :
          "Покупайте качественную электронику в нашем магазине. Samsung, Apple и другие бренды.",
        keywords: isUzbek ? 
          ["katalog", "elektronika", "telefon", "noutbuk", "sotib olish"] :
          ["каталог", "электроника", "телефон", "ноутбук", "купить"],
        ogTitle: isUzbek ? "Mahsulotlar Katalogi" : "Каталог Товаров",
        ogDescription: isUzbek ? "Sifatli elektronika mahsulotlari" : "Качественные электронные товары",
        structuredData: {
          "@context": "https://schema.org/",
          "@type": "WebPage",
          "name": isUzbek ? "Mahsulotlar katalogi" : "Каталог товаров"
        }
      };
    }
  }
}

export const seoService = new SEOService();