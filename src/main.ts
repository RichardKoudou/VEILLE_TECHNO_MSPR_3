import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VeilleService } from './modules/feed/veille.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  logger.log('');
  logger.log('╔═══════════════════════════════════════════════╗');
  logger.log('║   📡 VEILLE TECHNOLOGIQUE — K-ElectroniK     ║');
  logger.log('║   MSPR Bloc 1 RNCP35584                       ║');
  logger.log('╚═══════════════════════════════════════════════╝');
  logger.log('');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  // CORS pour le dev
  app.enableCors();

  await app.listen(3000);
  logger.log('');
  logger.log('🌐 Interface web : http://localhost:3000');
  logger.log('📡 API REST      : http://localhost:3000/api/articles');
  logger.log('');

  // Lancement immédiat de la collecte au démarrage
  const veilleService = app.get(VeilleService);
  logger.log('▶  Première collecte en cours...');
  veilleService.run().catch(err => logger.error('Erreur collecte:', err));
}

bootstrap().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
