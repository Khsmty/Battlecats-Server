import express from 'express';
import ejs from 'ejs';
import path from 'path';
import config from '../config.json';
import Bot from '../Components/Bot';
import axios from 'axios';
import MarkdownIt from 'markdown-it';
import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

export default function () {
  const app: express.Express = express();
  const md = new MarkdownIt();

  app
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .engine('html', ejs.renderFile)
    .set('view engine', 'ejs')
    .set('views', path.join(__dirname, '../../src/Web/views'))
    .use(express.static(path.join(__dirname, '../../src/Web/public')));

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST');

    next();
  });

  app.get('/', (_req, res) => {
    res.render('index');
  });

  app.get('/join', async (_req, res) => {
    const api = await axios.get('https://discord.com/api/guilds/755774191613247568/widget.json');
    const joinLink = api.data.instant_invite;

    res.redirect(joinLink);
  });

  app.get('/v/:key', (req, res) => {
    if (!req.params.key) {
      return res.status(404).render('404');
    }

    Bot.db.query('SELECT * FROM `verifyKey` WHERE `key` = ?', [req.params.key], (e, rows) => {
      if (!rows || !rows[0]) {
        res.status(404).render('404');
      } else {
        res.render('verify', { complete: false });
      }
    });
  });

  app.post('/v/:key', async (req, res) => {
    if (!req.body || !req.body['g-recaptcha-response'] || !req.params.key) {
      return res.status(404).render('404');
    }

    const api = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${req.body['g-recaptcha-response']}`,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (!api.data.success) {
      return res.status(404).render('404');
    }

    Bot.db.query('SELECT * FROM `verifyKey` WHERE `key` = ?', [req.params.key], async (e, rows) => {
      if (!rows || !rows[0]) {
        res.status(404).render('404');
      } else {
        try {
          const member = Bot.client.guilds.cache
            .get(config.guildId)
            ?.members.cache.get(rows[0].userId);

          await member!.roles?.add('759556295770243093');

          Bot.db.query('DELETE FROM `verifyKey` WHERE `key` = ?', [req.params.key]);

          res.render('verify', { complete: true });
        } catch (e) {
          res.status(404).render('404');
        }
      }
    });
  });

  const redirectLinks = fs.readFileSync(
    path.resolve(__dirname, '../../src/Web/redirect.json'),
    'utf8'
  );

  app.get('*', (req, res) => {
    const fileName: any = req.url.slice(1);
    const redirectLink = redirectLinks[fileName] || null;
    const fileExists = fs.existsSync(path.resolve(__dirname, `../../src/Web/md/${fileName}.md`));

    if (redirectLink) {
      res.status(301).redirect(redirectLink);
    } else if (fileExists) {
      const file = fs
        .readFileSync(path.resolve(__dirname, `../../src/Web/md/${fileName}.md`))
        .toString();
      const title = file.split('\n')[0].split('# ')[1];

      res.render('md', {
        title,
        md: md.render(file),
      });
    } else {
      res.status(404).render('404');
    }
  });

  app.listen(process.env.PORT || 3000, () => {
    console.log('Web started.');
  });
}
