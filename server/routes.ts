import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Initialize authentication routes and middleware
  setupAuth(app);

  // Products Routes
  app.get(api.products.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json(e.errors);
      }
      throw e;
    }
  });

  app.put(api.products.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const id = Number(req.params.id);
      const existing = await storage.getProduct(id);
      if (!existing) return res.status(404).json({ message: "Product not found" });

      const input = api.products.update.input.parse(req.body);
      const updated = await storage.updateProduct(id, input);
      res.json(updated);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json(e.errors);
      }
      throw e;
    }
  });

  app.delete(api.products.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = Number(req.params.id);
    const existing = await storage.getProduct(id);
    if (!existing) return res.status(404).json({ message: "Product not found" });
    
    await storage.deleteProduct(id);
    res.sendStatus(204);
  });

  // Seed data
  const existingProducts = await storage.getProducts();
  if (existingProducts.length === 0) {
    await storage.createProduct({
      name: "Premium Wireless Headphones",
      description: "High-fidelity audio with active noise cancellation and 30-hour battery life.",
      price: 29999 // $299.99
    });
    await storage.createProduct({
      name: "Ergonomic Mechanical Keyboard",
      description: "Customizable RGB backlighting with hot-swappable switches for peak performance.",
      price: 14950 // $149.50
    });
    await storage.createProduct({
      name: "4K Ultra HD Monitor",
      description: "27-inch IPS display with 144Hz refresh rate and HDR support.",
      price: 44900 // $449.00
    });
    await storage.createProduct({
      name: "Smart Home Hub",
      description: "Control all your smart devices from one central voice-activated unit.",
      price: 8999 // $89.99
    });
  }

  return httpServer;
}
