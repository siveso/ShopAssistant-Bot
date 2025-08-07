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

    // Handle callback queries (button clicks)
    this.bot.on('callback_query', async (query) => {
      const chatId = query.message?.chat.id;
      const userId = query.from.id.toString();
      
      if (!chatId || !query.data) return;

      try {
        console.log('Callback query received:', query.data);
        
        // Get user language
        const user = await storage.getUserByPlatformId(userId, "telegram");
        const language = user?.languageCode || "uz";

        if (query.data.startsWith('lang_')) {
          const selectedLanguage = query.data.split('_')[1] as "uz" | "ru";
          
          // Update user language
          await storage.updateUser(userId, { languageCode: selectedLanguage });
          
          const welcomeMessage = selectedLanguage === "uz" 
            ? "Xush kelibsiz! Men sizning savdo yordamchingizman. Qanday yordam bera olaman?"
            : "Добро пожаловать! Я ваш помощник по продажам. Чем могу помочь?";
          
          const mainMenu = this.getMainMenuKeyboard(selectedLanguage);
          
          await this.bot!.editMessageText(welcomeMessage, {
            chat_id: chatId,
            message_id: query.message?.message_id,
            reply_markup: mainMenu
          });
        }
        else if (query.data === 'catalog') {
          await this.handleCatalogRequest(chatId, language);
        }
        else if (query.data === 'cart') {
          await this.handleCartRequest(chatId, userId, language);
        }
        else if (query.data === 'contact') {
          await this.handleContactRequest(chatId, language);
        }
        else if (query.data === 'operator') {
          await this.handleOperatorRequest(chatId, language);
        }
        else if (query.data.startsWith('order_')) {
          const productId = query.data.split('_')[1];
          await this.handleProductOrder(chatId, userId, productId, language);
        }
        else if (query.data === 'show_catalog') {
          await this.handleCatalogRequest(chatId, language);
        }
        else if (query.data === 'contact_operator') {
          await this.handleOperatorRequest(chatId, language);
        }
        else if (query.data === 'main_menu') {
          const mainMenuMessage = language === "uz" 
            ? "🏠 Asosiy menyu:"
            : "🏠 Главное меню:";
          
          await this.bot!.sendMessage(chatId, mainMenuMessage, {
            reply_markup: this.getMainMenuKeyboard(language)
          });
        }
        else if (query.data === 'confirm_order') {
          await this.handleOrderConfirmation(chatId, userId, language);
        }
        else if (query.data === 'clear_cart') {
          await this.handleCartClear(chatId, userId, language);
        }
        else if (query.data === 'live_operator') {
          await this.handleOperatorRequest(chatId, language);
        }

        await this.bot!.answerCallbackQuery(query.id);
      } catch (error) {
        console.error("Error handling callback query:", error);
        await this.bot!.answerCallbackQuery(query.id, {
          text: "Xatolik yuz berdi / Произошла ошибка",
          show_alert: true
        });
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

  private async handleCatalogRequest(chatId: number, language: "uz" | "ru") {
    if (!this.bot) return;

    try {
      const products = await storage.getAllProducts();
      
      if (products.length === 0) {
        const message = language === "uz" 
          ? "Hozirda katalogda mahsulot yo'q. Tez orada yangi mahsulotlar qo'shiladi!"
          : "В каталоге пока нет товаров. Скоро появятся новые товары!";
        
        await this.bot.sendMessage(chatId, message);
        return;
      }

      const catalogMessage = language === "uz" 
        ? "📦 Bizning katalog:"
        : "📦 Наш каталог:";
      
      await this.bot.sendMessage(chatId, catalogMessage);
      
      // Show first 5 products
      for (const product of products.slice(0, 5)) {
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
      }
    } catch (error) {
      console.error("Error handling catalog request:", error);
      const errorMessage = language === "uz"
        ? "Katalogni yuklashda xatolik yuz berdi."
        : "Ошибка при загрузке каталога.";
      
      await this.bot.sendMessage(chatId, errorMessage);
    }
  }

  private async handleCartRequest(chatId: number, userId: string, language: "uz" | "ru") {
    if (!this.bot) return;

    try {
      // Get user from database first
      const user = await storage.getUserByPlatformId(userId, "telegram");
      if (!user) return;

      const orders = await storage.getOrdersByUser(user.id);
      const pendingOrders = orders.filter(order => order.orderStatus === "pending");
      
      if (pendingOrders.length === 0) {
        const message = language === "uz" 
          ? "🛒 Savatingiz bo'sh. Katalogdan mahsulot tanlang!"
          : "🛒 Ваша корзина пуста. Выберите товары из каталога!";
        
        const keyboard = {
          reply_markup: {
            inline_keyboard: [
              [{ text: language === "uz" ? "📦 Katalog" : "📦 Каталог", callback_data: "catalog" }]
            ]
          }
        };
        
        await this.bot.sendMessage(chatId, message, keyboard);
        return;
      }

      const cartMessage = language === "uz" 
        ? `🛒 Savatingizda ${pendingOrders.length} ta mahsulot:`
        : `🛒 В корзине ${pendingOrders.length} товаров:`;
      
      await this.bot.sendMessage(chatId, cartMessage);
      
      let totalAmount = 0;
      for (const order of pendingOrders) {
        const product = await storage.getProduct(order.productId);
        if (product) {
          const name = language === "uz" ? product.nameUz : product.nameRu;
          const orderMessage = language === "uz"
            ? `📦 ${name}\n💰 ${order.quantity} x $${product.price} = $${order.totalPrice}`
            : `📦 ${name}\n💰 ${order.quantity} x $${product.price} = $${order.totalPrice}`;
          
          await this.bot.sendMessage(chatId, orderMessage);
          totalAmount += parseFloat(order.totalPrice || "0");
        }
      }
      
      const totalMessage = language === "uz"
        ? `💰 Umumiy summa: $${totalAmount.toFixed(2)}`
        : `💰 Общая сумма: $${totalAmount.toFixed(2)}`;
      
      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: language === "uz" ? "✅ Buyurtmani tasdiqlash" : "✅ Подтвердить заказ", callback_data: "confirm_order" }],
            [{ text: language === "uz" ? "🗑️ Savatni tozalash" : "🗑️ Очистить корзину", callback_data: "clear_cart" }]
          ]
        }
      };
      
      await this.bot.sendMessage(chatId, totalMessage, keyboard);
    } catch (error) {
      console.error("Error handling cart request:", error);
    }
  }

  private async handleContactRequest(chatId: number, language: "uz" | "ru") {
    if (!this.bot) return;

    const contactMessage = language === "uz" 
      ? "📞 Biz bilan bog'lanish:\n\n• Telefon: +998 90 123 45 67\n• Telegram: @shop_support\n• Ish vaqti: 9:00-19:00 (dushanba-shanba)\n• Manzil: Toshkent shahar, Amir Temur ko'chasi"
      : "📞 Связь с нами:\n\n• Телефон: +998 90 123 45 67\n• Telegram: @shop_support\n• Время работы: 9:00-19:00 (пн-сб)\n• Адрес: г. Ташкент, ул. Амира Темура";
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: language === "uz" ? "👤 Operator bilan gaplashish" : "👤 Говорить с оператором", callback_data: "operator" }],
          [{ text: language === "uz" ? "🏠 Asosiy menyu" : "🏠 Главное меню", callback_data: "main_menu" }]
        ]
      }
    };
    
    await this.bot.sendMessage(chatId, contactMessage, keyboard);
  }

  private async handleOperatorRequest(chatId: number, language: "uz" | "ru") {
    if (!this.bot) return;

    const operatorMessage = language === "uz"
      ? "👤 Operator bilan bog'lanish uchun telefon qiling: +998 90 123 45 67\n\nYoki @shop_support ga yozing. Tez orada javob beramiz!"
      : "👤 Для связи с оператором звоните: +998 90 123 45 67\n\nИли пишите @shop_support. Ответим как можно скорее!";
    
    await this.bot.sendMessage(chatId, operatorMessage);
  }

  private async handleProductOrder(chatId: number, userId: string, productId: string, language: "uz" | "ru") {
    if (!this.bot) return;

    try {
      const product = await storage.getProduct(productId);
      if (!product) {
        const message = language === "uz" 
          ? "Mahsulot topilmadi."
          : "Товар не найден.";
        await this.bot.sendMessage(chatId, message);
        return;
      }

      if ((product.stockQuantity || 0) <= 0) {
        const message = language === "uz" 
          ? "Kechirasiz, bu mahsulot tugab qolgan."
          : "Извините, этот товар закончился.";
        await this.bot.sendMessage(chatId, message);
        return;
      }

      // Get user from database
      const user = await storage.getUserByPlatformId(userId, "telegram");
      if (!user) {
        const errorMessage = language === "uz"
          ? "Foydalanuvchi topilmadi. /start buyrug'ini bosing."
          : "Пользователь не найден. Нажмите /start.";
        await this.bot.sendMessage(chatId, errorMessage);
        return;
      }

      // Create order
      const order = await storage.createOrder({
        userId: user.id,
        productId,
        quantity: 1,
        totalPrice: product.price
      });

      const name = language === "uz" ? product.nameUz : product.nameRu;
      const successMessage = language === "uz"
        ? `✅ "${name}" mahsuloti savatingizga qo'shildi!\n💰 Narxi: $${product.price}`
        : `✅ "${name}" добавлен в корзину!\n💰 Цена: $${product.price}`;

      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: language === "uz" ? "🛒 Savatni ko'rish" : "🛒 Посмотреть корзину", callback_data: "cart" }],
            [{ text: language === "uz" ? "📦 Katalog" : "📦 Каталог", callback_data: "catalog" }]
          ]
        }
      };

      await this.bot.sendMessage(chatId, successMessage, keyboard);
    } catch (error) {
      console.error("Error handling product order:", error);
      const errorMessage = language === "uz"
        ? "Buyurtma berishda xatolik yuz berdi."
        : "Ошибка при оформлении заказа.";
      
      await this.bot.sendMessage(chatId, errorMessage);
    }
  }

  private getMainMenuKeyboard(language: "uz" | "ru") {
    const buttons = language === "uz" ? [
      [{ text: "📦 Katalog", callback_data: "catalog" }],
      [{ text: "🛒 Savatcha", callback_data: "cart" }],
      [{ text: "📞 Biz bilan aloqa", callback_data: "contact" }],
      [{ text: "👤 Operator bilan gaplashish", callback_data: "operator" }]
    ] : [
      [{ text: "📦 Каталог", callback_data: "catalog" }],
      [{ text: "🛒 Корзина", callback_data: "cart" }],
      [{ text: "📞 Связь с нами", callback_data: "contact" }],
      [{ text: "👤 Говорить с оператором", callback_data: "operator" }]
    ];

    return { inline_keyboard: buttons };
  }

  private async handleOrderConfirmation(chatId: number, userId: string, language: "uz" | "ru") {
    if (!this.bot) return;

    try {
      // Get user from database first
      const user = await storage.getUserByPlatformId(userId, "telegram");
      if (!user) return;

      const orders = await storage.getOrdersByUser(user.id);
      const pendingOrders = orders.filter(order => order.orderStatus === "pending");
      
      if (pendingOrders.length === 0) {
        const message = language === "uz" 
          ? "Tasdiqlash uchun buyurtma topilmadi."
          : "Нет заказов для подтверждения.";
        await this.bot.sendMessage(chatId, message);
        return;
      }

      // Update order status to processing
      for (const order of pendingOrders) {
        await storage.updateOrderStatus(order.id, "processing");
      }

      const confirmMessage = language === "uz"
        ? `✅ Buyurtmangiz tasdiqlandi!\n📦 ${pendingOrders.length} ta mahsulot\n\nTez orada operatorimiz siz bilan bog'lanadi.\nTelefon: +998 90 123 45 67`
        : `✅ Ваш заказ подтвержден!\n📦 ${pendingOrders.length} товаров\n\nВскоре с вами свяжется оператор.\nТелефон: +998 90 123 45 67`;

      await this.bot.sendMessage(chatId, confirmMessage);
    } catch (error) {
      console.error("Error confirming order:", error);
      const errorMessage = language === "uz"
        ? "Buyurtmani tasdiqlashda xatolik yuz berdi."
        : "Ошибка при подтверждении заказа.";
      
      await this.bot.sendMessage(chatId, errorMessage);
    }
  }

  private async handleCartClear(chatId: number, userId: string, language: "uz" | "ru") {
    if (!this.bot) return;

    try {
      // Get user from database first
      const user = await storage.getUserByPlatformId(userId, "telegram");
      if (!user) return;

      const orders = await storage.getOrdersByUser(user.id);
      const pendingOrders = orders.filter(order => order.orderStatus === "pending");
      
      // Update order status to cancelled
      for (const order of pendingOrders) {
        await storage.updateOrderStatus(order.id, "cancelled");
      }

      const clearMessage = language === "uz"
        ? "🗑️ Savatcha tozalandi!"
        : "🗑️ Корзина очищена!";

      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: language === "uz" ? "📦 Katalog" : "📦 Каталог", callback_data: "catalog" }],
            [{ text: language === "uz" ? "🏠 Asosiy menyu" : "🏠 Главное меню", callback_data: "main_menu" }]
          ]
        }
      };

      await this.bot.sendMessage(chatId, clearMessage, keyboard);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
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
