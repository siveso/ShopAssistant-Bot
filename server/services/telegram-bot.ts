import TelegramBot from "node-telegram-bot-api";
import { storage } from "../storage";
import { generateChatbotResponse, analyzeUserIntent, type ChatContext } from "./gemini";
import botResponsesData from "../config/bot-responses.json";

interface UserState {
  awaitingCheckoutInfo?: boolean;
  awaitingQuantity?: boolean;
  productId?: string;
  language?: "uz" | "ru";
}

class TelegramBotService {
  private bot: TelegramBot | null = null;
  private isActive = false;
  private userStates: Map<string, UserState> = new Map();

  // Public methods for marketing scheduler
  public async sendMessage(chatId: string | number, text: string, options?: any) {
    if (!this.bot) return;
    return await this.bot.sendMessage(chatId, text, options);
  }

  public async sendPhoto(chatId: string | number, photo: string, options?: any) {
    if (!this.bot) return;
    return await this.bot.sendPhoto(chatId, photo, options);
  }

  async initialize() {
    try {
      // Completely stop and cleanup existing bot
      if (this.bot) {
        try {
          await this.bot.stopPolling();
          this.bot.removeAllListeners();
          this.bot = null;
          this.isActive = false;
          console.log("Previous bot instance completely stopped");
          // Wait a bit for cleanup
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (e) {
          console.log("Bot cleanup completed");
        }
      }

      const settings = await storage.getBotSettings();
      const token = settings?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
      
      if (!token) {
        throw new Error("Telegram bot token not found");
      }

      console.log("Creating new bot instance...");
      this.bot = new TelegramBot(token, { 
        polling: {
          interval: 3000,
          autoStart: false,
          params: {
            timeout: 20,
            allowed_updates: ["message", "callback_query"]
          }
        }
      });
      
      this.setupEventHandlers();
      
      // Start polling with proper error handling
      try {
        console.log("Starting bot polling...");
        await this.bot.startPolling();
        this.isActive = true;
        console.log("Bot polling started successfully");
      } catch (error) {
        console.error("Polling start error:", error);
        this.isActive = false;
        throw error;
      }
      
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
        else if (query.data === 'catalog' || query.data === 'show_catalog') {
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
        else if (query.data.startsWith('product_')) {
          const productId = query.data.split('_')[1];
          await this.handleProductDetails(chatId, productId, language);
        }
        else if (query.data.startsWith('add_to_cart_')) {
          const productId = query.data.split('_')[3]; // add_to_cart_id
          await this.handleAddToCart(chatId, userId, productId, language);
        }
        else if (query.data.startsWith('quantity_')) {
          const [, productId, quantity] = query.data.split('_');
          await this.handleQuantitySelection(chatId, userId, productId, parseInt(quantity), language);
        }
        else if (query.data.startsWith('order_')) {
          const productId = query.data.split('_')[1];
          await this.handleProductOrder(chatId, userId, productId, language);
        }
        else if (query.data === 'checkout') {
          await this.handleCheckout(chatId, userId, language);
        }
        else if (query.data === 'continue_shopping') {
          await this.handleCatalogRequest(chatId, language);
        }
        else if (query.data === 'clear_cart') {
          await this.handleClearCart(chatId, userId, language);
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
          await this.handleClearCart(chatId, userId, language);
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

    // Check if user is providing checkout information
    const userState = this.userStates.get(userId);
    if (userState?.awaitingCheckoutInfo) {
      await this.handleCheckoutInfo(chatId, userId, message);
      return;
    }

    // Check if user is providing quantity for a product
    if (userState?.awaitingQuantity) {
      await this.handleQuantityInput(chatId, userId, message);
      return;
    }

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

  private async handleCheckoutInfo(chatId: number, userId: string, message: string) {
    if (!this.bot) return;

    try {
      const user = await storage.getUserByPlatformId(userId, "telegram");
      if (!user) return;

      const language = user.languageCode || "uz";
      const lines = message.trim().split('\n');

      if (lines.length < 4) {
        const errorMessage = language === "uz"
          ? "❌ Ma'lumotlar to'liq emas. Iltimos, quyidagi tartibda yuboring:\n\n1️⃣ Ismingiz\n2️⃣ Telefon raqamingiz\n3️⃣ Manzil\n4️⃣ To'lov usuli"
          : "❌ Данные неполные. Пожалуйста, отправьте в следующем порядке:\n\n1️⃣ Ваше имя\n2️⃣ Номер телефона\n3️⃣ Адрес\n4️⃣ Способ оплаты";
        
        await this.bot.sendMessage(chatId, errorMessage);
        return;
      }

      const [customerName, customerPhone, customerAddress, paymentMethod] = lines;

      // Update all pending orders with customer info
      const orders = await storage.getOrdersByUser(user.id);
      const pendingOrders = orders.filter(order => order.orderStatus === "pending");
      
      let totalAmount = 0;
      for (const order of pendingOrders) {
        totalAmount += parseFloat(order.totalPrice || "0");
        // Update order with customer info and change status to processing
        await storage.updateOrder(order.id, {
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(), 
          customerAddress: customerAddress.trim(),
          paymentMethod: paymentMethod.trim(),
          orderStatus: "processing"
        });
      }

      const confirmMessage = language === "uz"
        ? `✅ Buyurtmangiz qabul qilindi!\n\n👤 ${customerName}\n📞 ${customerPhone}\n📍 ${customerAddress}\n💳 ${paymentMethod}\n\n📊 Jami: $${totalAmount.toFixed(2)}\n📦 Mahsulotlar soni: ${pendingOrders.length}\n\n🚚 Tez orada siz bilan bog'lanamiz!`
        : `✅ Ваш заказ принят!\n\n👤 ${customerName}\n📞 ${customerPhone}\n📍 ${customerAddress}\n💳 ${paymentMethod}\n\n📊 Итого: $${totalAmount.toFixed(2)}\n📦 Количество товаров: ${pendingOrders.length}\n\n🚚 Скоро с вами свяжемся!`;

      await this.bot.sendMessage(chatId, confirmMessage);

      // Clear user state
      this.userStates.delete(userId);

      // Send main menu
      const menuMessage = language === "uz" ? "🏠 Asosiy menyu:" : "🏠 Главное меню:";
      await this.bot.sendMessage(chatId, menuMessage, {
        reply_markup: this.getMainMenuKeyboard(language)
      });
    } catch (error) {
      console.error("Error handling checkout info:", error);
      const userState = this.userStates.get(userId);
      const errorMessage = userState?.language === "uz"
        ? "Buyurtmani rasmiylashtirish jarayonida xatolik yuz berdi."
        : "Ошибка при оформлении заказа.";
      
      await this.bot.sendMessage(chatId, errorMessage);
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
      console.log("Fetching products for catalog...");
      const products = await storage.getAllProducts();
      console.log("Products fetched:", products.length, products.map(p => ({id: p.id, nameUz: p.nameUz, isActive: p.isActive})));
      
      const activeProducts = products.filter(p => p.isActive);
      console.log("Active products:", activeProducts.length);
      
      if (activeProducts.length === 0) {
        const message = language === "uz" 
          ? "🛍️ Hozirda faol mahsulotlar yo'q. Tez orada yangi mahsulotlar qo'shamiz!"
          : "🛍️ В данный момент нет активных товаров. Скоро добавим новые товары!";
        
        await this.bot.sendMessage(chatId, message);
        return;
      }

      const catalogMessage = language === "uz" 
        ? `📦 Bizning katalogimiz (${activeProducts.length} ta mahsulot):`
        : `📦 Наш каталог (${activeProducts.length} товаров):`;
      
      await this.bot.sendMessage(chatId, catalogMessage);
      
      // Show first 8 products with simplified info
      for (const product of activeProducts.slice(0, 8)) {
        const name = language === "uz" ? product.nameUz : product.nameRu;
        
        const productMessage = language === "uz" 
          ? `📦 ${name}\n💰 Narxi: $${product.price}\n📦 Omborda: ${product.stockQuantity || 0} dona`
          : `📦 ${name}\n💰 Цена: $${product.price}\n📦 На складе: ${product.stockQuantity || 0} шт`;

        const keyboard = {
          inline_keyboard: [
            [{ 
              text: language === "uz" ? "🛒 Savatga qo'shish" : "🛒 Добавить в корзину", 
              callback_data: `add_to_cart_${product.id}` 
            }],
            [{ 
              text: language === "uz" ? "📋 Batafsil" : "📋 Подробнее", 
              callback_data: `product_${product.id}` 
            }]
          ]
        };

        // Send with small image if available
        if (product.imageUrl) {
          try {
            await this.bot.sendPhoto(chatId, product.imageUrl, {
              caption: productMessage,
              reply_markup: keyboard
            });
          } catch (error) {
            console.error(`Error sending photo for product ${product.id}:`, error);
            await this.bot.sendMessage(chatId, productMessage, { reply_markup: keyboard });
          }
        } else {
          await this.bot.sendMessage(chatId, productMessage, { reply_markup: keyboard });
        }
      }
    } catch (error) {
      console.error("Error handling catalog request:", error);
      const errorMessage = language === "uz"
        ? "Katalogni yuklashda xatolik yuz berdi."
        : "Ошибка при загрузке каталога.";
      
      await this.bot.sendMessage(chatId, errorMessage);
    }
  }

  private async handleProductDetails(chatId: number, productId: string, language: "uz" | "ru") {
    if (!this.bot) return;

    try {
      const product = await storage.getProduct(productId);
      
      if (!product) {
        const message = language === "uz" 
          ? "Kechirasiz, mahsulot topilmadi."
          : "Извините, товар не найден.";
        await this.bot.sendMessage(chatId, message);
        return;
      }

      const name = language === "uz" ? product.nameUz : product.nameRu;
      const description = language === "uz" ? product.descriptionUz : product.descriptionRu;
      
      const productMessage = language === "uz" 
        ? `📦 ${name}\n\n📝 Ta'rif:\n${description || "Ta'rif mavjud emas"}\n\n💰 Narxi: $${product.price}\n📦 Omborda: ${product.stockQuantity || 0} dona\n📂 Kategoriya: ${product.category || "Umumiy"}`
        : `📦 ${name}\n\n📝 Описание:\n${description || "Описание не доступно"}\n\n💰 Цена: $${product.price}\n📦 На складе: ${product.stockQuantity || 0} шт\n📂 Категория: ${product.category || "Общая"}`;

      const keyboard = {
        inline_keyboard: [
          [{ 
            text: language === "uz" ? "🛒 Savatga qo'shish" : "🛒 Добавить в корзину", 
            callback_data: `add_to_cart_${product.id}` 
          }],
          [{ 
            text: language === "uz" ? "⬅️ Katalogga qaytish" : "⬅️ Вернуться в каталог", 
            callback_data: "catalog" 
          }]
        ]
      };

      if (product.imageUrl) {
        try {
          await this.bot.sendPhoto(chatId, product.imageUrl, {
            caption: productMessage,
            reply_markup: keyboard
          });
        } catch (error) {
          console.error(`Error sending product details photo ${product.id}:`, error);
          await this.bot.sendMessage(chatId, productMessage, { reply_markup: keyboard });
        }
      } else {
        await this.bot.sendMessage(chatId, productMessage, { reply_markup: keyboard });
      }
    } catch (error) {
      console.error("Error handling product details:", error);
      const errorMessage = language === "uz"
        ? "Mahsulot ma'lumotlarini yuklashda xatolik yuz berdi."
        : "Ошибка при загрузке информации о товаре.";
      
      await this.bot.sendMessage(chatId, errorMessage);
    }
  }

  private async handleAddToCart(chatId: number, userId: string, productId: string, language: "uz" | "ru") {
    if (!this.bot) return;

    try {
      const product = await storage.getProduct(productId);
      if (!product) {
        const message = language === "uz" ? "Mahsulot topilmadi." : "Товар не найден.";
        await this.bot.sendMessage(chatId, message);
        return;
      }

      const name = language === "uz" ? product.nameUz : product.nameRu;
      const message = language === "uz" 
        ? `📦 ${name}\n💰 Narxi: $${product.price}\n📦 Omborda: ${product.stockQuantity || 0} dona\n\n🔢 Nechta dona kerak?\n\n📝 Miqdorni kiriting (masalan: 1, 5, 50, 200, 1000):`
        : `📦 ${name}\n💰 Цена: $${product.price}\n📦 На складе: ${product.stockQuantity || 0} шт\n\n🔢 Сколько штук нужно?\n\n📝 Введите количество (например: 1, 5, 50, 200, 1000):`;

      const keyboard = {
        inline_keyboard: [
          [
            { text: "1", callback_data: `quantity_${productId}_1` },
            { text: "5", callback_data: `quantity_${productId}_5` },
            { text: "10", callback_data: `quantity_${productId}_10` }
          ],
          [
            { text: "50", callback_data: `quantity_${productId}_50` },
            { text: "100", callback_data: `quantity_${productId}_100` },
            { text: "500", callback_data: `quantity_${productId}_500` }
          ],
          [{ 
            text: language === "uz" ? "⬅️ Orqaga" : "⬅️ Назад", 
            callback_data: "catalog" 
          }]
        ]
      };

      // Set user state to expect quantity input
      this.userStates.set(userId, { 
        awaitingQuantity: true, 
        productId: productId,
        language: language
      });

      await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMessage = language === "uz"
        ? "Savatga qo'shishda xatolik yuz berdi."
        : "Ошибка при добавлении в корзину.";
      
      await this.bot.sendMessage(chatId, errorMessage);
    }
  }

  private async handleQuantitySelection(chatId: number, userId: string, productId: string, quantity: number, language: "uz" | "ru") {
    if (!this.bot) return;

    try {
      const user = await storage.getUserByPlatformId(userId, "telegram");
      if (!user) return;

      const product = await storage.getProduct(productId);
      if (!product) {
        const message = language === "uz" ? "Mahsulot topilmadi." : "Товар не найден.";
        await this.bot.sendMessage(chatId, message);
        return;
      }

      // Create order (cart item)
      const totalPrice = parseFloat(product.price) * quantity;
      const name = language === "uz" ? product.nameUz : product.nameRu;

      await storage.createOrder({
        userId: user.id,
        productId: product.id,
        productName: name,
        quantity: quantity,
        unitPrice: product.price,
        totalPrice: totalPrice,
        orderStatus: "pending",
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        paymentMethod: ""
      });

      const message = language === "uz" 
        ? `✅ Savatga qo'shildi!\n📦 ${name}\n🔢 Miqdor: ${quantity} dona\n💰 Jami: $${totalPrice.toFixed(2)}`
        : `✅ Добавлено в корзину!\n📦 ${name}\n🔢 Количество: ${quantity} шт\n💰 Итого: $${totalPrice.toFixed(2)}`;

      const keyboard = {
        inline_keyboard: [
          [
            { 
              text: language === "uz" ? "🛒 Savatni ko'rish" : "🛒 Посмотреть корзину", 
              callback_data: "cart" 
            },
            { 
              text: language === "uz" ? "🛍️ Xaridni davom etish" : "🛍️ Продолжить покупки", 
              callback_data: "continue_shopping" 
            }
          ]
        ]
      };

      await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
    } catch (error) {
      console.error("Error selecting quantity:", error);
      const errorMessage = language === "uz"
        ? "Miqdorni tanlashda xatolik yuz berdi."
        : "Ошибка при выборе количества.";
      
      await this.bot.sendMessage(chatId, errorMessage);
    }
  }

  private async handleCheckout(chatId: number, userId: string, language: "uz" | "ru") {
    if (!this.bot) return;

    try {
      const user = await storage.getUserByPlatformId(userId, "telegram");
      if (!user) return;

      const orders = await storage.getOrdersByUser(user.id);
      const pendingOrders = orders.filter(order => order.orderStatus === "pending");
      
      if (pendingOrders.length === 0) {
        const message = language === "uz" 
          ? "🛒 Savatingiz bo'sh."
          : "🛒 Ваша корзина пуста.";
        await this.bot.sendMessage(chatId, message);
        return;
      }

      const message = language === "uz" 
        ? "👤 Buyurtmani rasmiylashtirish uchun ma'lumotlaringizni yuboring:\n\n1️⃣ Ismingiz\n2️⃣ Telefon raqamingiz\n3️⃣ Manzil\n4️⃣ To'lov usuli (naqd/plastik karta)\n\nMisol:\nAli Valiyev\n+998901234567\nToshkent sh, Yunusobod t-ni\nNaqd pul"
        : "👤 Для оформления заказа отправьте свои данные:\n\n1️⃣ Ваше имя\n2️⃣ Номер телефона\n3️⃣ Адрес\n4️⃣ Способ оплаты (наличные/карта)\n\nПример:\nАли Валиев\n+998901234567\nТашкент, Юнусабад\nНаличные";

      await this.bot.sendMessage(chatId, message);

      // Store user state for next message
      this.userStates.set(userId, { awaitingCheckoutInfo: true });
    } catch (error) {
      console.error("Error in checkout:", error);
      const errorMessage = language === "uz"
        ? "Buyurtmani rasmiylashtirish jarayonida xatolik yuz berdi."
        : "Ошибка при оформлении заказа.";
      
      await this.bot.sendMessage(chatId, errorMessage);
    }
  }

  private async handleQuantityInput(chatId: number, userId: string, message: string) {
    if (!this.bot) return;

    try {
      const userState = this.userStates.get(userId);
      if (!userState?.productId || !userState.language) return;

      const quantity = parseInt(message.trim());
      
      // Validate quantity
      if (isNaN(quantity) || quantity < 1) {
        const errorMessage = userState.language === "uz"
          ? "❌ Noto'g'ri miqdor. Iltimos, raqam kiriting (masalan: 5, 100, 500):"
          : "❌ Неправильное количество. Пожалуйста, введите число (например: 5, 100, 500):";
        await this.bot.sendMessage(chatId, errorMessage);
        return;
      }

      if (quantity > 10000) {
        const errorMessage = userState.language === "uz"
          ? "❌ Juda ko'p miqdor. Maksimal 10,000 dona buyurtma berish mumkin."
          : "❌ Слишком большое количество. Максимум можно заказать 10,000 штук.";
        await this.bot.sendMessage(chatId, errorMessage);
        return;
      }

      // Process the quantity selection
      await this.handleQuantitySelection(
        chatId, 
        userId, 
        userState.productId, 
        quantity, 
        userState.language
      );
      
      // Clear user state
      this.userStates.delete(userId);
      
    } catch (error) {
      console.error("Error handling quantity input:", error);
      const currentUserState = this.userStates.get(userId);
      const errorMessage = currentUserState?.language === "uz"
        ? "Miqdorni qayta ishlashda xatolik yuz berdi."
        : "Ошибка при обработке количества.";
      
      await this.bot.sendMessage(chatId, errorMessage);
    }
  }

  private async handleCartRequest(chatId: number, userId: string, language: "uz" | "ru") {
    if (!this.bot) return;

    try {
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

      // Show cart contents
      let totalAmount = 0;
      const cartMessage = language === "uz" ? "🛒 Sizning savatingiz:" : "🛒 Ваша корзина:";
      await this.bot.sendMessage(chatId, cartMessage);

      for (const order of pendingOrders) {
        const orderTotalPrice = parseFloat(order.totalPrice || "0");
        totalAmount += orderTotalPrice;
        
        const itemMessage = language === "uz"
          ? `📦 ${order.productName}\n🔢 Miqdor: ${order.quantity} dona\n💰 Narxi: $${order.unitPrice} × ${order.quantity} = $${orderTotalPrice.toFixed(2)}`
          : `📦 ${order.productName}\n🔢 Количество: ${order.quantity} шт\n💰 Цена: $${order.unitPrice} × ${order.quantity} = $${orderTotalPrice.toFixed(2)}`;

        await this.bot.sendMessage(chatId, itemMessage);
      }

      const summaryMessage = language === "uz"
        ? `📊 Jami: $${totalAmount.toFixed(2)}\n📦 Mahsulotlar soni: ${pendingOrders.length}`
        : `📊 Итого: $${totalAmount.toFixed(2)}\n📦 Количество товаров: ${pendingOrders.length}`;

      const keyboard = {
        inline_keyboard: [
          [{ 
            text: language === "uz" ? "✅ Buyurtmani rasmiylashtirish" : "✅ Оформить заказ", 
            callback_data: "checkout" 
          }],
          [
            { 
              text: language === "uz" ? "🛍️ Xaridni davom etish" : "🛍️ Продолжить покупки", 
              callback_data: "continue_shopping" 
            },
            { 
              text: language === "uz" ? "🗑️ Savatni tozalash" : "🗑️ Очистить корзину", 
              callback_data: "clear_cart" 
            }
          ]
        ]
      };

      await this.bot.sendMessage(chatId, summaryMessage, { reply_markup: keyboard });
    } catch (error) {
      console.error("Error handling cart request:", error);
    }
  }

  private async handleContactRequest(chatId: number, language: "uz" | "ru") {
    if (!this.bot) return;

    // Get contact info from bot settings
    const settings = await storage.getBotSettings();
    const contactInfo = settings?.contactInfo || "+998 90 123 45 67";
    const workingHours = settings?.workingHours || "9:00-19:00 (dushanba-shanba)";
    const companyAddress = settings?.companyAddress || "Toshkent shahar";
    
    const contactMessage = language === "uz" 
      ? `📞 Biz bilan bog'lanish:\n\n• Telefon: ${contactInfo}\n• Telegram: @shop_support\n• Ish vaqti: ${workingHours}\n• Manzil: ${companyAddress}`
      : `📞 Связь с нами:\n\n• Телефон: ${contactInfo}\n• Telegram: @shop_support\n• Время работы: ${workingHours}\n• Адрес: ${companyAddress}`;
    
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

    // Get operator phone and telegram username from bot settings
    const settings = await storage.getBotSettings();
    const operatorPhone = settings?.operatorPhone || "+998 90 123 45 67";
    const telegramUsername = settings?.telegramBotUsername || "@akramjon0011";
    
    const operatorMessage = language === "uz"
      ? `👤 Operator bilan bog'lanish uchun telefon qiling: ${operatorPhone}\n\nYoki ${telegramUsername} ga yozing. Tez orada javob beramiz!`
      : `👤 Для связи с оператором звоните: ${operatorPhone}\n\nИли пишите ${telegramUsername}. Ответим как можно скорее!`;
    
    await this.bot.sendMessage(chatId, operatorMessage);
  }

  private async handleClearCart(chatId: number, userId: string, language: "uz" | "ru") {
    if (!this.bot) return;

    try {
      const user = await storage.getUserByPlatformId(userId, "telegram");
      if (!user) return;

      const orders = await storage.getOrdersByUser(user.id);
      const pendingOrders = orders.filter(order => order.orderStatus === "pending");

      for (const order of pendingOrders) {
        await storage.deleteOrder(order.id);
      }

      const message = language === "uz" 
        ? "✅ Savat tozalandi! Katalogdan yangi mahsulotlar tanlashingiz mumkin."
        : "✅ Корзина очищена! Вы можете выбрать новые товары из каталога.";

      const keyboard = {
        inline_keyboard: [
          [{ text: language === "uz" ? "📦 Katalog" : "📦 Каталог", callback_data: "catalog" }],
          [{ text: language === "uz" ? "🏠 Asosiy menyu" : "🏠 Главное меню", callback_data: "main_menu" }]
        ]
      };

      await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
    } catch (error) {
      console.error("Error clearing cart:", error);
      const errorMessage = language === "uz"
        ? "Savatni tozalashda xatolik yuz berdi."
        : "Ошибка при очистке корзины.";
      
      await this.bot.sendMessage(chatId, errorMessage);
    }
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
        productName: language === "uz" ? product.nameUz : product.nameRu,
        quantity: 1,
        unitPrice: product.price,
        totalPrice: parseFloat(product.price.toString())
      });

      const name = language === "uz" ? product.nameUz : product.nameRu;
      const description = language === "uz" ? product.descriptionUz : product.descriptionRu;
      
      // Truncate description if it's too long to avoid telegram caption limit
      const truncatedDescription = description && description.length > 200 ? 
        description.substring(0, 200) + "..." : description;
      
      const successMessage = language === "uz"
        ? `✅ "${name}" mahsuloti savatingizga qo'shildi!\n💰 Narxi: $${product.price}${truncatedDescription ? '\n📝 ' + truncatedDescription : ''}`
        : `✅ "${name}" добавлен в корзину!\n💰 Цена: $${product.price}${truncatedDescription ? '\n📝 ' + truncatedDescription : ''}`;

      const keyboard = {
        inline_keyboard: [
          [{ text: language === "uz" ? "🛒 Savatni ko'rish" : "🛒 Посмотреть корзину", callback_data: "cart" }],
          [{ text: language === "uz" ? "📦 Katalog" : "📦 Каталог", callback_data: "catalog" }]
        ]
      };

      // Send photo with success message if available
      if (product.imageUrl) {
        try {
          await this.bot.sendPhoto(chatId, product.imageUrl, {
            caption: successMessage,
            reply_markup: keyboard
          });
        } catch (error) {
          console.error(`Error sending photo for order confirmation ${product.id}:`, error);
          await this.bot.sendMessage(chatId, successMessage, { reply_markup: keyboard });
        }
      } else {
        await this.bot.sendMessage(chatId, successMessage, { reply_markup: keyboard });
      }
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

      // Get operator phone from settings for confirmation
      const settings = await storage.getBotSettings();
      const operatorPhone = settings?.operatorPhone || "+998 90 123 45 67";
      
      const confirmMessage = language === "uz"
        ? `✅ Buyurtmangiz tasdiqlandi!\n📦 ${pendingOrders.length} ta mahsulot\n\nTez orada operatorimiz siz bilan bog'lanadi.\nTelefon: ${operatorPhone}`
        : `✅ Ваш заказ подтвержден!\n📦 ${pendingOrders.length} товаров\n\nВскоре с вами свяжется оператор.\nТелефон: ${operatorPhone}`;

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
