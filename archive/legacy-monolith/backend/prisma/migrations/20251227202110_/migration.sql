-- AlterTable
ALTER TABLE "public"."articles" ADD COLUMN     "author_type" TEXT NOT NULL DEFAULT 'staff',
ADD COLUMN     "content_type" TEXT NOT NULL DEFAULT 'news',
ADD COLUMN     "is_original" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "news_source" TEXT,
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'normal';

-- AlterTable
ALTER TABLE "public"."comments" ADD COLUMN     "display_name" TEXT,
ADD COLUMN     "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."market_indices" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "previous_close" DOUBLE PRECISION NOT NULL,
    "change" DOUBLE PRECISION NOT NULL,
    "change_percent" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "open" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "currency" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "is_open" BOOLEAN NOT NULL DEFAULT false,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "last_source" TEXT,
    "data_quality" INTEGER NOT NULL DEFAULT 100,
    "is_stale" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_indices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."market_index_history" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "open" DOUBLE PRECISION,
    "high" DOUBLE PRECISION,
    "low" DOUBLE PRECISION,
    "close" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "change_percent" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "interval" TEXT NOT NULL DEFAULT '1d',
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_index_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."market_provider_preferences" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "provider_order" TEXT[],
    "fallback_strategy" TEXT NOT NULL DEFAULT 'sequential',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_provider_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cryptocurrencies" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coingecko_id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "previous_close" DOUBLE PRECISION,
    "change" DOUBLE PRECISION NOT NULL,
    "change_percent" DOUBLE PRECISION NOT NULL,
    "high_24h" DOUBLE PRECISION,
    "low_24h" DOUBLE PRECISION,
    "volume_24h" DOUBLE PRECISION,
    "market_cap" DOUBLE PRECISION,
    "circulating_supply" DOUBLE PRECISION,
    "total_supply" DOUBLE PRECISION,
    "rank" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "last_updated" TIMESTAMP(3) NOT NULL,
    "last_source" TEXT,
    "data_quality" INTEGER NOT NULL DEFAULT 100,
    "is_stale" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cryptocurrencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."crypto_history" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION,
    "marketCap" DOUBLE PRECISION,
    "change_percent" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "interval" TEXT NOT NULL DEFAULT '1d',
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crypto_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."currency_rates" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "currency_name" TEXT NOT NULL,
    "rate_to_usd" DOUBLE PRECISION NOT NULL,
    "rate_from_usd" DOUBLE PRECISION,
    "symbol" TEXT,
    "country" TEXT,
    "previous_rate" DOUBLE PRECISION,
    "change" DOUBLE PRECISION,
    "change_percent" DOUBLE PRECISION,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "last_source" TEXT,
    "is_stale" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currency_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."currency_history" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "rate_to_usd" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "currency_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."commodities" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "previous_close" DOUBLE PRECISION,
    "change" DOUBLE PRECISION,
    "change_percent" DOUBLE PRECISION,
    "open" DOUBLE PRECISION,
    "high" DOUBLE PRECISION,
    "low" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "unit" TEXT NOT NULL DEFAULT 'USD',
    "unit_label" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "last_updated" TIMESTAMP(3) NOT NULL,
    "last_source" TEXT,
    "data_quality" INTEGER NOT NULL DEFAULT 100,
    "is_stale" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commodities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."commodity_history" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "open" DOUBLE PRECISION,
    "high" DOUBLE PRECISION,
    "low" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "interval" TEXT NOT NULL DEFAULT '1d',
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commodity_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scraper_runs" (
    "id" TEXT NOT NULL,
    "scraper_name" TEXT NOT NULL,
    "data_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "items_found" INTEGER,
    "items_inserted" INTEGER,
    "items_failed" INTEGER,
    "error_message" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scraper_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."market_index_configs" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "exchange" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "market_hours" JSONB NOT NULL DEFAULT '{"open": "09:30", "close": "16:00"}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_global" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_index_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cryptocurrency_configs" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coingecko_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cryptocurrency_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."commodity_configs" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'USD',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commodity_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."currency_pair_configs" (
    "id" TEXT NOT NULL,
    "pair" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "base" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'major',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currency_pair_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."category_follows" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "followed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."topic_follows" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "topic_name" TEXT NOT NULL,
    "topic_slug" TEXT NOT NULL,
    "parent_category" TEXT,
    "followed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topic_follows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "market_indices_symbol_key" ON "public"."market_indices"("symbol");

-- CreateIndex
CREATE INDEX "market_indices_symbol_idx" ON "public"."market_indices"("symbol");

-- CreateIndex
CREATE INDEX "market_indices_country_idx" ON "public"."market_indices"("country");

-- CreateIndex
CREATE INDEX "market_indices_last_updated_idx" ON "public"."market_indices"("last_updated");

-- CreateIndex
CREATE INDEX "market_indices_is_stale_idx" ON "public"."market_indices"("is_stale");

-- CreateIndex
CREATE INDEX "market_index_history_symbol_timestamp_idx" ON "public"."market_index_history"("symbol", "timestamp");

-- CreateIndex
CREATE INDEX "market_index_history_timestamp_idx" ON "public"."market_index_history"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "market_index_history_symbol_timestamp_interval_key" ON "public"."market_index_history"("symbol", "timestamp", "interval");

-- CreateIndex
CREATE UNIQUE INDEX "market_provider_preferences_category_key" ON "public"."market_provider_preferences"("category");

-- CreateIndex
CREATE UNIQUE INDEX "cryptocurrencies_symbol_key" ON "public"."cryptocurrencies"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "cryptocurrencies_coingecko_id_key" ON "public"."cryptocurrencies"("coingecko_id");

-- CreateIndex
CREATE INDEX "cryptocurrencies_symbol_idx" ON "public"."cryptocurrencies"("symbol");

-- CreateIndex
CREATE INDEX "cryptocurrencies_last_updated_idx" ON "public"."cryptocurrencies"("last_updated");

-- CreateIndex
CREATE INDEX "cryptocurrencies_rank_idx" ON "public"."cryptocurrencies"("rank");

-- CreateIndex
CREATE INDEX "crypto_history_symbol_timestamp_idx" ON "public"."crypto_history"("symbol", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "crypto_history_symbol_timestamp_interval_key" ON "public"."crypto_history"("symbol", "timestamp", "interval");

-- CreateIndex
CREATE UNIQUE INDEX "currency_rates_currency_key" ON "public"."currency_rates"("currency");

-- CreateIndex
CREATE INDEX "currency_rates_currency_idx" ON "public"."currency_rates"("currency");

-- CreateIndex
CREATE INDEX "currency_rates_last_updated_idx" ON "public"."currency_rates"("last_updated");

-- CreateIndex
CREATE INDEX "currency_history_currency_timestamp_idx" ON "public"."currency_history"("currency", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "currency_history_currency_timestamp_key" ON "public"."currency_history"("currency", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "commodities_symbol_key" ON "public"."commodities"("symbol");

-- CreateIndex
CREATE INDEX "commodities_symbol_idx" ON "public"."commodities"("symbol");

-- CreateIndex
CREATE INDEX "commodities_category_idx" ON "public"."commodities"("category");

-- CreateIndex
CREATE INDEX "commodities_last_updated_idx" ON "public"."commodities"("last_updated");

-- CreateIndex
CREATE INDEX "commodity_history_symbol_timestamp_idx" ON "public"."commodity_history"("symbol", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "commodity_history_symbol_timestamp_interval_key" ON "public"."commodity_history"("symbol", "timestamp", "interval");

-- CreateIndex
CREATE INDEX "scraper_runs_scraper_name_started_at_idx" ON "public"."scraper_runs"("scraper_name", "started_at");

-- CreateIndex
CREATE INDEX "scraper_runs_status_idx" ON "public"."scraper_runs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "market_index_configs_symbol_key" ON "public"."market_index_configs"("symbol");

-- CreateIndex
CREATE INDEX "market_index_configs_symbol_idx" ON "public"."market_index_configs"("symbol");

-- CreateIndex
CREATE INDEX "market_index_configs_country_idx" ON "public"."market_index_configs"("country");

-- CreateIndex
CREATE INDEX "market_index_configs_is_active_idx" ON "public"."market_index_configs"("is_active");

-- CreateIndex
CREATE INDEX "market_index_configs_region_idx" ON "public"."market_index_configs"("region");

-- CreateIndex
CREATE UNIQUE INDEX "cryptocurrency_configs_symbol_key" ON "public"."cryptocurrency_configs"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "cryptocurrency_configs_coingecko_id_key" ON "public"."cryptocurrency_configs"("coingecko_id");

-- CreateIndex
CREATE INDEX "cryptocurrency_configs_symbol_idx" ON "public"."cryptocurrency_configs"("symbol");

-- CreateIndex
CREATE INDEX "cryptocurrency_configs_is_active_idx" ON "public"."cryptocurrency_configs"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "commodity_configs_symbol_key" ON "public"."commodity_configs"("symbol");

-- CreateIndex
CREATE INDEX "commodity_configs_symbol_idx" ON "public"."commodity_configs"("symbol");

-- CreateIndex
CREATE INDEX "commodity_configs_category_idx" ON "public"."commodity_configs"("category");

-- CreateIndex
CREATE INDEX "commodity_configs_is_active_idx" ON "public"."commodity_configs"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "currency_pair_configs_pair_key" ON "public"."currency_pair_configs"("pair");

-- CreateIndex
CREATE INDEX "currency_pair_configs_pair_idx" ON "public"."currency_pair_configs"("pair");

-- CreateIndex
CREATE INDEX "currency_pair_configs_type_idx" ON "public"."currency_pair_configs"("type");

-- CreateIndex
CREATE INDEX "currency_pair_configs_is_active_idx" ON "public"."currency_pair_configs"("is_active");

-- CreateIndex
CREATE INDEX "category_follows_user_id_idx" ON "public"."category_follows"("user_id");

-- CreateIndex
CREATE INDEX "category_follows_category_id_idx" ON "public"."category_follows"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_follows_user_id_category_id_key" ON "public"."category_follows"("user_id", "category_id");

-- CreateIndex
CREATE INDEX "topic_follows_user_id_idx" ON "public"."topic_follows"("user_id");

-- CreateIndex
CREATE INDEX "topic_follows_topic_slug_idx" ON "public"."topic_follows"("topic_slug");

-- CreateIndex
CREATE UNIQUE INDEX "topic_follows_user_id_topic_slug_key" ON "public"."topic_follows"("user_id", "topic_slug");

-- CreateIndex
CREATE INDEX "articles_content_type_idx" ON "public"."articles"("content_type");

-- CreateIndex
CREATE INDEX "articles_author_type_idx" ON "public"."articles"("author_type");

-- CreateIndex
CREATE INDEX "articles_content_type_published_at_idx" ON "public"."articles"("content_type", "published_at");

-- CreateIndex
CREATE INDEX "articles_is_original_idx" ON "public"."articles"("is_original");

-- CreateIndex
CREATE INDEX "articles_priority_idx" ON "public"."articles"("priority");

-- CreateIndex
CREATE INDEX "comments_user_id_idx" ON "public"."comments"("user_id");

-- AddForeignKey
ALTER TABLE "public"."market_index_history" ADD CONSTRAINT "market_index_history_symbol_fkey" FOREIGN KEY ("symbol") REFERENCES "public"."market_indices"("symbol") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."crypto_history" ADD CONSTRAINT "crypto_history_symbol_fkey" FOREIGN KEY ("symbol") REFERENCES "public"."cryptocurrencies"("symbol") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."currency_history" ADD CONSTRAINT "currency_history_currency_fkey" FOREIGN KEY ("currency") REFERENCES "public"."currency_rates"("currency") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commodity_history" ADD CONSTRAINT "commodity_history_symbol_fkey" FOREIGN KEY ("symbol") REFERENCES "public"."commodities"("symbol") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."category_follows" ADD CONSTRAINT "category_follows_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."category_follows" ADD CONSTRAINT "category_follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."topic_follows" ADD CONSTRAINT "topic_follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
