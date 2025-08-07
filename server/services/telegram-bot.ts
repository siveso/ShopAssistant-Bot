import TelegramBot from "node-telegram-bot-api";
import { storage } from "../storage";
import { generateChatbotResponse, analyzeUserIntent, type ChatContext } from "./gemini";
import botResponsesData from "../config/bot-responses.json";

class TelegramBotService {
  private bot: TelegramBot | null = null;
  private isActive = false;

  async initialize() {
    try {
      const settings = await storage.getBotSettings();
      const token = settings?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
      
      if (!token) {
        throw new Error("Telegram bot token not found");
      }

      this.bot = new TelegramBot(token, { polling: true });
      this.setupEventHandlers();
      this.isActive = true;
      
      console.log("Telegram bot initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Telegram bot:", error);
      throw error;
    }
  }

  private setupEventHandlers() {
    if (!this.bot) return;

    // Handle /start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id.toString();
      
      if (!userId) return;

      try {
        // Check if user exists
        let user = await storage.getUserByPlatformId(userId, "telegram");
        
        if (!user) {
          // Create new user
          user = await storage.createUser({
            platformId: userId,
            platformType: "telegram",
            fullName: `${msg.from?.first_name || ""} ${msg.from?.last_name || ""}`.trim(),
            languageCode: "uz"
          });
        }

        // Send language selection
        const keyboard = {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "O'zbekcha 🇺🇿", callback_data: "lang_uz" },
                { text: "Русский 🇷🇺", callback_data: "lang_ru" }
              ]
            ]
          }
        };

        await this.bot!.sendMessage(chatId, 
          "Tilni tanlang / Выберите язык:", 
          keyboard
        );
      } catch (error) {
        console.error("Error handling /start:", error);
      }
    });

    // Handle language selection
    this.bot.on('callback_query', async (query) => {
      const chatId = query.message?.chat.id;
      const userId = query.from.id.toString();
      
      if (!chatId) return;

      try {
        if (query.data?.startsWith('lang_')) {
          const language = query.data.split('_')[1] as "uz" | "ru";
          
          // Update user language
          await storage.updateUser(userId, { languageCode: language });
          
          const welcomeMessage = language === "uz" 
            ? "Xush kelibsiz! Men sizning savdo yordamchingizman. Qanday yordam bera olaman?"
            : "Добро пожаловать! Я ваш помощник по продажам. Чем могу помочь?";
          
          const mainMenu = this.getMainMenuKeyboard(language);
          
          await this.bot!.editMessageText(welcomeMessage, {
            chat_id: chatId,
            message_id: query.message?.message_id,
            reply_markup: mainMenu
          });
        }

        await this.bot!.answerCallbackQuery(query.id);
      } catch (error) {
        console.error("Error handling callback query:", error);
      }
    });

    // Handle text messages
    this.bot.on('message', async (msg) => {
      if (msg.text?.startsWith('/')) return; // Skip commands
      
      const chatId = msg.chat.id;
      const userId = msg.from?.id.toString();
      const userMessage = msg.text;
      
      if (!userId || !userMessage) return;

      try {
        await this.processUserMessage(chatId, userId, userMessage);
      } catch (error) {
        console.error("Error processing message:", error);
        await this.bot!.sendMessage(chatId, "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
      }
    });
  }

  private async processUserMessage(chatId: number, userId: string, message: string) {
    if (!this.bot) return;

    // Get user info
    const user = await storage.getUserByPlatformId(userId, "telegram");
    if (!user) return;

    const language = user.languageCode || "uz";

    // First check for rule-based responses
    const ruleResponse = await this.checkRuleBasedResponse(message, language);
    if (ruleResponse) {
      await this.bot.sendMessage(chatId, ruleResponse);
      return;
    }

    // Analyze user intent
    const intentAnalysis = await analyzeUserIntent(message, language);
    
    // Handle different intents
    if (intentAnalysis.intent === "product_inquiry") {
      await this.handleProductInquiry(chatId, message, language, intentAnalysis.extractedEntities);
    } else if (intentAnalysis.intent === "order_request") {
      await this.handleOrderRequest(chatId, userId, message, language);
    } else {
      // Use AI for general responses
      await this.handleGeneralQuery(chatId, userId, message, language);
    }
  }

  private async checkRuleBasedResponse(message: string, language: "uz" | "ru"): Promise<string | null> {
    const lowerMessage = message.toLowerCase();
    const responses = await this.loadRuleResponses(language);
    
    // Check for keywords
    for (const [keyword, response] of Object.entries(responses)) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return response;
      }
    }
    
    return null;
  }

  private async loadRuleResponses(language: "uz" | "ru"): Promise<Record<string, string>> {
    try {
      const settings = await storage.getBotSettings();
      const responses = settings?.ruleBasedResponses as Record<string, Record<string, string>> || {};
      
      if (responses && responses[language]) {
        return responses[language];
      }
      
      // Fallback to default responses from imported JSON
      return (botResponsesData as any)[language] || {};
    } catch (error) {
      console.error("Error loading rule responses:", error);
      return {};
    }
  }

  private async handleProductInquiry(
    chatId: number, 
    message: string, 
    language: "uz" | "ru",
    entities?: any
  ) {
    if (!this.bot) return;

    try {
      let products: any[] = [];
      
      if (entities?.productName) {
        products = await storage.searchProducts(entities.productName, language);
      }
      
      if (products.length === 0) {
        // Search by message content
        products = await storage.searchProducts(message, language);
      }

      if (products.length > 0) {
        // Show found products
        for (const product of products.slice(0, 3)) { // Limit to 3 products
          const name = language === "uz" ? product.nameUz : product.nameRu;
          const description = language === "uz" ? product.descriptionUz : product.descriptionRu;
          
          const productMessage = language === "uz" 
            ? `📦 ${name}\n💰 Narxi: $${product.price}\n📝 ${description}\n📦 Omborda: ${product.stockQuantity} dona`
            : `📦 ${name}\n💰 Цена: $${product.price}\n📝 ${description}\n📦 На складе: ${product.stockQuantity} шт`;

          const keyboard = {
            reply_markup: {
              inline_keyboard: [
                [{ 
                  text: language === "uz" ? "Buyurtma berish" : "Заказать", 
                  callback_data: `order_${product.id}` 
                }]
              ]
            }
          };

          await this.bot.sendMessage(chatId, productMessage, keyboard);
          
          if (product.imageUrl) {
            try {
              await this.bot.sendPhoto(chatId, product.imageUrl);
            } catch (error) {
              console.error("Error sending product image:", error);
            }
          }
        }
      } else {
        const noProductsMessage = language === "uz"
          ? "Kechirasiz, bunday mahsulot topilmadi. Boshqa nom bilan qidirib ko'ring yoki katalogni ko'ring."
          : "Извините, такой товар не найден. Попробуйте поискать под другим названием или посмотрите каталог.";
        
        await this.bot.sendMessage(chatId, noProductsMessage, {
          reply_markup: this.getMainMenuKeyboard(language)
        });
      }
    } catch (error) {
      console.error("Error handling product inquiry:", error);
    }
  }

  private async handleOrderRequest(chatId: number, userId: string, message: string, language: "uz" | "ru") {
    if (!this.bot) return;

    const orderMessage = language === "uz"
      ? "Buyurtma berish uchun mahsulotni tanlang:"
      : "Для оформления заказа выберите товар:";
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: language === "uz" ? "Katalog" : "Каталог", callback_data: "show_catalog" }],
          [{ text: language === "uz" ? "Operator bilan aloqa" : "Связь с оператором", callback_data: "contact_operator" }]
        ]
      }
    };

    await this.bot.sendMessage(chatId, orderMessage, keyboard);
  }

  private async handleGeneralQuery(chatId: number, userId: string, message: string, language: "uz" | "ru") {
    if (!this.bot) return;

    try {
      // Get conversation history
      const conversation = await storage.getConversation(userId, "telegram");
      const conversationHistory = (conversation?.messages as Array<{role: "user" | "assistant"; content: string}>) || [];

      // Get user info
      const user = await storage.getUserByPlatformId(userId, "telegram");

      const context: ChatContext = {
        userLanguage: language,
        conversationHistory,
        userInfo: {
          name: user?.fullName || undefined,
          phone: user?.phoneNumber || undefined
        }
      };

      const response = await generateChatbotResponse(message, context);
      await this.bot.sendMessage(chatId, response);

      // Update conversation history
      const newMessages: Array<{role: "user" | "assistant"; content: string}> = [
        ...conversationHistory.slice(-10), // Keep last 10 messages
        { role: "user" as const, content: message },
        { role: "assistant" as const, content: response }
      ];

      if (conversation) {
        await storage.updateConversationMessages(conversation.id, newMessages);
      } else {
        await storage.createConversation({
          userId: user!.id,
          platformType: "telegram",
          messages: newMessages
        });
      }
    } catch (error) {
      console.error("Error handling general query:", error);
      const errorMessage = language === "uz"
        ? "Kechirasiz, javob berishda xatolik yuz berdi. Qayta urinib ko'ring."
        : "Извините, произошла ошибка при ответе. Попробуйте еще раз.";
      
      await this.bot.sendMessage(chatId, errorMessage);
    }
  }

  private getMainMenuKeyboard(language: "uz" | "ru") {
    const buttons = language === "uz" ? [
      [{ text: "📦 Katalog", callback_data: "catalog" }],
      [{ text: "🛒 Savatcha", callback_data: "cart" }],
      [{ text: "📞 Biz bilan aloqa", callback_data: "contact" }],
      [{ text: "👤 Operator bilan gaplashish", callback_data: "live_operator" }]
    ] : [
      [{ text: "📦 Каталог", callback_data: "catalog" }],
      [{ text: "🛒 Корзина", callback_data: "cart" }],
      [{ text: "📞 Связь с нами", callback_data: "contact" }],
      [{ text: "👤 Говорить с оператором", callback_data: "live_operator" }]
    ];

    return { inline_keyboard: buttons };
  }

  async stop() {
    if (this.bot) {
      await this.bot.stopPolling();
      this.isActive = false;
    }
  }

  async restart() {
    await this.stop();
    await this.initialize();
  }

  isRunning(): boolean {
    return this.isActive;
  }
}

export const telegramBot = new TelegramBotService();

// Initialize bot on startup
telegramBot.initialize().catch(console.error);
