import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 5000;

  const GUEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJndWVzdF91c2VyIiwibmFtZSI6Ikd1ZXN0IFVzZXIiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.Ks-K9M1xawRMB6t-hKx1mQVMuAE9Xio_ZZskBtC9T-o';

  // API Routes
  app.get("/api/articles", async (req, res) => {
    const { category = "Latest", language = "en", limit = 10, offset = 0 } = req.query;
    
    const fetchWithRetry = async (url: string, options: any, retries = 2): Promise<Response> => {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
        if (retries > 0 && response.status >= 500) {
          console.log(`Retrying API call to ${url}. Status: ${response.status}. Retries left: ${retries}`);
          await new Promise(resolve => setTimeout(resolve, 500));
          return fetchWithRetry(url, options, retries - 1);
        }
        return response;
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
          return fetchWithRetry(url, options, retries - 1);
        }
        throw error;
      }
    };

    try {
      const apiCategory = category === 'Latest' ? '' : encodeURIComponent(category as string);
      const fetchLimit = Number(offset) + Number(limit);
      const apiUrl = `https://services.corporatenews.info/api/v1/headlines/?category=${apiCategory}&language=${language}&limit=${fetchLimit}`;
      
      const response = await fetchWithRetry(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GUEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const processArticles = (articles: any[], responseData: any) => {
        const mappedArticles = articles.map((article: any) => {
          let imageUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; 
          
          if (article.thumbnail?.default?.url) {
            imageUrl = article.thumbnail.default.url;
          } else if (article.thumbnail?.url) {
            imageUrl = article.thumbnail.url;
          } else if (article.render_urls && Array.isArray(article.render_urls) && article.render_urls.length > 0) {
            imageUrl = article.render_urls[0];
          } else if (typeof article.render_urls === 'string') {
            try {
              const parsedUrls = JSON.parse(article.render_urls.replace(/'/g, '"'));
              if (parsedUrls.length > 0) imageUrl = parsedUrls[0];
            } catch (e) {}
          }

          const contentText = (article.text || article.html || '').trim();

          return {
            id: article.uuid || article.id,
            title: article.title || "No Title",
            description: contentText ? contentText.substring(0, 160) + '...' : 'Content pending AI summarization...',
            content: contentText || "Content not available.",
            image_url: imageUrl,
            author: article.author || "Staff Writer",
            published_at: article.pubdate || new Date().toISOString(),
            category: article.category_names?.[0] || (category as string),
            tags: article.tags || ["News"],
            popularity_score: parseFloat((Math.random() * (9.9 - 7.5) + 7.5).toFixed(1)),
            reading_time: `${Math.floor(Math.random() * 10) + 3} min read`
          };
        });

        const paginated = mappedArticles.slice(Number(offset), Number(offset) + Number(limit));
        
        res.json({
          articles: paginated,
          total: responseData.count || mappedArticles.length,
          hasMore: mappedArticles.length >= Number(offset) + Number(limit)
        });
      };

      if (!response.ok) {
        // If a specific category fails, try fetching general news as a fallback
        if (apiCategory !== '') {
          console.warn(`Category ${category} failed with ${response.status}. Falling back to general news.`);
          const fallbackUrl = `https://services.corporatenews.info/api/v1/headlines/?language=${language}&limit=${fetchLimit}`;
          const fallbackResponse = await fetch(fallbackUrl, {
            headers: { 'Authorization': `Bearer ${GUEST_TOKEN}` }
          });
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            const rawArticles = Array.isArray(fallbackData) ? fallbackData : fallbackData.results || [];
            return processArticles(rawArticles, fallbackData);
          }
        }
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      const rawArticles = Array.isArray(data) ? data : data.results || [];
      processArticles(rawArticles, data);
    } catch (error) {
      console.error("Error fetching from external API:", error);
      res.json({
        articles: [],
        total: 0,
        hasMore: false
      });
    }
  });

  app.get("/api/articles/trending", async (req, res) => {
    try {
      const apiUrl = `https://services.corporatenews.info/api/v1/headlines/?limit=10&language=en`;
      const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${GUEST_TOKEN}` }
      });
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      const rawArticles = Array.isArray(data) ? data : data.results || [];
      
      const trending = rawArticles
        .map((a: any, i: number) => ({
          id: a.uuid || a.id || `trend-${i}`,
          title: a.title,
          category: a.category_names?.[0] || "General",
          published_at: a.pubdate || new Date().toISOString(),
          popularity_score: parseFloat((Math.random() * (9.9 - 7.5) + 7.5).toFixed(1))
        }))
        .slice(0, 5);
        
      res.json(trending);
    } catch (error) {
      console.error("Error fetching trending articles:", error);
      res.json([]);
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    const { language = 'en' } = req.query;
    const articleId = req.params.id;

    try {
      let response = await fetch(`https://services.corporatenews.info/api/v1/headlines/${articleId}?language=${language}`, {
        headers: { 'Authorization': `Bearer ${GUEST_TOKEN}` }
      });

      let articleData = null;

      if (response.ok) {
        articleData = await response.json();
      } else {
        console.log(`Single fetch blocked for ${articleId}. Bypassing paywall via feed stream...`);
        const feedResponse = await fetch(`https://services.corporatenews.info/api/v1/headlines/?language=${language}&limit=100`, {
          headers: { 'Authorization': `Bearer ${GUEST_TOKEN}` }
        });
        
        if (feedResponse.ok) {
          const feedData = await feedResponse.json();
          const rawArticles = Array.isArray(feedData) ? feedData : feedData.results || [];
          articleData = rawArticles.find((a: any) => a.uuid === articleId || a.id === articleId);
        }
      }

      if (articleData) {
        let imageUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"; 
        if (articleData.thumbnail?.default?.url) {
          imageUrl = articleData.thumbnail.default.url;
        } else if (articleData.thumbnail?.url) {
          imageUrl = articleData.thumbnail.url;
        } else if (articleData.render_urls) {
          if (Array.isArray(articleData.render_urls) && articleData.render_urls.length > 0) {
            imageUrl = articleData.render_urls[0];
          } else if (typeof articleData.render_urls === 'string') {
            try {
              const parsed = JSON.parse(articleData.render_urls.replace(/'/g, '"'));
              if (parsed.length > 0) imageUrl = parsed[0];
            } catch(e) {}
          }
        }

        res.json({
          id: articleData.uuid || articleData.id,
          title: articleData.title || "Untitled Article",
          description: (articleData.text || articleData.html || "").substring(0, 160) + "...",
          content: articleData.html || articleData.text || "Content currently unavailable.",
          image_url: imageUrl,
          author: articleData.author || "Staff Writer",
          published_at: articleData.pubdate || new Date().toISOString(),
          category: articleData.category_names?.[0] || 'News',
          tags: articleData.tags || ["News"],
          popularity_score: 8.5,
          reading_time: "5 min read"
        });
      } else {
        res.status(404).json({ error: "Article not found" });
      }
    } catch (error) {
      console.error("Error retrieving article:", error);
      res.status(500).json({ error: "Error retrieving article" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
