import { Router } from "express";
import { seoService } from "../services/seo-service.js";
import { storage } from "../storage.js";

const router = Router();

// Get SEO data for a specific product
router.get("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { lang = 'uz' } = req.query;
    
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const seoData = await seoService.generateProductSEO({
      nameUz: product.nameUz,
      nameRu: product.nameRu,
      descriptionUz: product.descriptionUz || undefined,
      descriptionRu: product.descriptionRu || undefined,
      price: product.price,
      category: product.category || undefined,
      features: []
    }, lang as 'uz' | 'ru');

    res.json(seoData);
  } catch (error) {
    console.error("Error getting product SEO:", error);
    res.status(500).json({ error: "Failed to generate SEO data" });
  }
});

// Get SEO data for catalog page
router.get("/catalog", async (req, res) => {
  try {
    const { lang = 'uz' } = req.query;
    
    const seoData = await seoService.generateCatalogSEO(lang as 'uz' | 'ru');
    res.json(seoData);
  } catch (error) {
    console.error("Error getting catalog SEO:", error);
    res.status(500).json({ error: "Failed to generate catalog SEO data" });
  }
});

export { router as seoRouter };