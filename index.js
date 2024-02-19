  require('dotenv').config();
  const express = require('express');
  const cors = require('cors');
  const app = express();

  // Basic Configuration
  const port = process.env.PORT || 5000;

  app.use(cors());

  app.use('/public', express.static(`${process.cwd()}/public`));

  app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

  // API Endpoints
  app.post('/api/shorturl', function(req, res) {
    const originalUrl = req.body.url;
  
    // Validate URL format
    const urlRegex = /^(https?):\/\/www\.[a-z0-9-]+(\.[a-z]{2,})+(\S*)$/i;
    if (!urlRegex.test(originalUrl)) {
      return res.json({ error: 'invalid url' });
    }
  
    const shortUrl = nextShortUrl++;
    urlDatabase.push({ originalUrl, shortUrl });

    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
  
  app.get('/api/shorturl/:short_url', function(req, res) {
    const shortUrl = parseInt(req.params.short_url);
  
    const urlEntry = urlDatabase.find(entry => entry.shortUrl === shortUrl);
  
    if (urlEntry) {
      res.redirect(urlEntry.originalUrl);
    } else {
      res.json({ error: 'invalid short_url' });
    }
  });
  
  app.listen(port, function() {
    console.log(`Listening on port ${port}`);
  });
