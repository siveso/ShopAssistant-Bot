import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export interface ChatContext {
  userLanguage: "uz" | "ru";
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  productContext?: any[];
  userInfo?: {
    name?: string;
    phone?: string;
  };
}

export async function generateChatbotResponse(
  userMessage: string,
  context: ChatContext
): Promise<string> {
  try {
    const systemPrompt = buildSystemPrompt(context);
    const conversationText = buildConversationText(userMessage, context);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 500,
      },
      contents: conversationText,
    });

    return response.text || "Kechirasiz, javob berishda xatolik yuz berdi.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    
    if (context.userLanguage === "ru") {
      return "Извините, произошла ошибка при обработке вашего сообщения. Попробуйте еще раз.";
    } else {
      return "Kechirasiz, xabaringizni qayta ishlashda xatolik yuz berdi. Yana urinib ko'ring.";
    }
  }
}

function buildSystemPrompt(context: ChatContext): string {
  const isUzbek = context.userLanguage === "uz";
  
  const basePrompt = isUzbek 
    ? `Siz professional onlayn do'kon savdo yordamchisisiz. Sizning vazifangiz:
- Mijozlarga mahsulotlar haqida ma'lumot berish
- Buyurtma berish jarayonida yordam berish
- Savollarga aniq va foydali javoblar berish
- Har doim xushmuomala va professional bo'lish
- Faqat O'zbek tilida javob berish

Agar mahsulot haqida so'ralsangiz, mavjud mahsulotlar ma'lumotlaridan foydalaning.
Agar buyurtma berish haqida so'ralsangiz, jarayonni tushuntiring.
Noma'lum savollar uchun operatorga yo'naltiring.`
    : `Вы профессиональный помощник интернет-магазина. Ваши задачи:
- Предоставлять информацию о товарах клиентам
- Помогать в процессе оформления заказа
- Давать точные и полезные ответы на вопросы
- Всегда быть вежливым и профессиональным
- Отвечать только на русском языке

При вопросах о товарах используйте доступную информацию о продукции.
При вопросах о заказах объясняйте процесс.
При неизвестных вопросах направляйте к оператору.`;

  if (context.productContext && context.productContext.length > 0) {
    const productInfo = context.productContext.map(product => {
      const name = isUzbek ? product.nameUz : product.nameRu;
      const description = isUzbek ? product.descriptionUz : product.descriptionRu;
      return `${name}: ${description} - $${product.price}`;
    }).join('\n');
    
    const contextPrompt = isUzbek 
      ? `\n\nMavjud mahsulotlar:\n${productInfo}`
      : `\n\nДоступные товары:\n${productInfo}`;
    
    return basePrompt + contextPrompt;
  }

  return basePrompt;
}

function buildConversationText(userMessage: string, context: ChatContext): string {
  let conversation = "";
  
  // Add conversation history
  if (context.conversationHistory.length > 0) {
    conversation = context.conversationHistory
      .slice(-6) // Keep last 6 messages for context
      .map(msg => `${msg.role === "user" ? "Mijoz" : "Yordamchi"}: ${msg.content}`)
      .join('\n');
    conversation += '\n';
  }
  
  conversation += `Mijoz: ${userMessage}`;
  return conversation;
}

export async function analyzeUserIntent(
  userMessage: string,
  language: "uz" | "ru"
): Promise<{
  intent: "product_inquiry" | "order_request" | "general_question" | "complaint" | "greeting";
  confidence: number;
  extractedEntities?: {
    productName?: string;
    quantity?: number;
    priceRange?: { min?: number; max?: number };
  };
}> {
  try {
    const systemPrompt = language === "uz" 
      ? `Foydalanuvchi xabarining maqsadini aniqlang va JSON formatida javob bering:
{
  "intent": "product_inquiry|order_request|general_question|complaint|greeting",
  "confidence": 0.0-1.0,
  "extractedEntities": {
    "productName": "mahsulot nomi",
    "quantity": raqam,
    "priceRange": {"min": raqam, "max": raqam}
  }
}`
      : `Определите намерение пользователя и ответьте в JSON формате:
{
  "intent": "product_inquiry|order_request|general_question|complaint|greeting",
  "confidence": 0.0-1.0,
  "extractedEntities": {
    "productName": "название товара",
    "quantity": число,
    "priceRange": {"min": число, "max": число}
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            intent: { type: "string" },
            confidence: { type: "number" },
            extractedEntities: {
              type: "object",
              properties: {
                productName: { type: "string" },
                quantity: { type: "number" },
                priceRange: {
                  type: "object",
                  properties: {
                    min: { type: "number" },
                    max: { type: "number" }
                  }
                }
              }
            }
          },
          required: ["intent", "confidence"]
        }
      },
      contents: userMessage,
    });

    const result = JSON.parse(response.text || "{}");
    return {
      intent: result.intent || "general_question",
      confidence: result.confidence || 0.5,
      extractedEntities: result.extractedEntities
    };
  } catch (error) {
    console.error("Intent analysis error:", error);
    return {
      intent: "general_question",
      confidence: 0.3
    };
  }
}
