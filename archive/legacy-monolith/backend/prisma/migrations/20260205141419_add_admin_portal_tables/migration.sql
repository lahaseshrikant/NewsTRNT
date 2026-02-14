-- CreateTable
CREATE TABLE "public"."email_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'newsletter',
    "content" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_backups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'full',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "size" TEXT,
    "path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_by" TEXT,
    "notes" TEXT,

    CONSTRAINT "system_backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ad_requests" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "phone" TEXT,
    "ad_type" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "duration" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "processed_by" TEXT,

    CONSTRAINT "ad_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ad_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "advertiser" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'banner',
    "status" TEXT NOT NULL DEFAULT 'active',
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "budget" DOUBLE PRECISION,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "target_url" TEXT,
    "banner_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."integrations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disconnected',
    "config" JSONB NOT NULL DEFAULT '{}',
    "api_key" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."spam_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'block',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "hit_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "spam_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."security_events" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "user_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "details" JSONB NOT NULL DEFAULT '{}',
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."media_files" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "folder" TEXT NOT NULL DEFAULT 'uploads',
    "alt" TEXT,
    "caption" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "uploaded_by" TEXT,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."moderation_reports" (
    "id" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "reported_by" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resolution" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_templates_type_idx" ON "public"."email_templates"("type");

-- CreateIndex
CREATE INDEX "email_templates_is_active_idx" ON "public"."email_templates"("is_active");

-- CreateIndex
CREATE INDEX "system_backups_type_idx" ON "public"."system_backups"("type");

-- CreateIndex
CREATE INDEX "system_backups_status_idx" ON "public"."system_backups"("status");

-- CreateIndex
CREATE INDEX "system_backups_created_at_idx" ON "public"."system_backups"("created_at");

-- CreateIndex
CREATE INDEX "ad_requests_status_idx" ON "public"."ad_requests"("status");

-- CreateIndex
CREATE INDEX "ad_requests_created_at_idx" ON "public"."ad_requests"("created_at");

-- CreateIndex
CREATE INDEX "ad_campaigns_status_idx" ON "public"."ad_campaigns"("status");

-- CreateIndex
CREATE INDEX "ad_campaigns_start_date_idx" ON "public"."ad_campaigns"("start_date");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_name_key" ON "public"."integrations"("name");

-- CreateIndex
CREATE INDEX "integrations_type_idx" ON "public"."integrations"("type");

-- CreateIndex
CREATE INDEX "integrations_status_idx" ON "public"."integrations"("status");

-- CreateIndex
CREATE INDEX "spam_rules_type_idx" ON "public"."spam_rules"("type");

-- CreateIndex
CREATE INDEX "spam_rules_is_active_idx" ON "public"."spam_rules"("is_active");

-- CreateIndex
CREATE INDEX "security_events_event_type_idx" ON "public"."security_events"("event_type");

-- CreateIndex
CREATE INDEX "security_events_severity_idx" ON "public"."security_events"("severity");

-- CreateIndex
CREATE INDEX "security_events_created_at_idx" ON "public"."security_events"("created_at");

-- CreateIndex
CREATE INDEX "media_files_folder_idx" ON "public"."media_files"("folder");

-- CreateIndex
CREATE INDEX "media_files_mime_type_idx" ON "public"."media_files"("mime_type");

-- CreateIndex
CREATE INDEX "media_files_created_at_idx" ON "public"."media_files"("created_at");

-- CreateIndex
CREATE INDEX "moderation_reports_content_type_idx" ON "public"."moderation_reports"("content_type");

-- CreateIndex
CREATE INDEX "moderation_reports_status_idx" ON "public"."moderation_reports"("status");

-- CreateIndex
CREATE INDEX "moderation_reports_created_at_idx" ON "public"."moderation_reports"("created_at");
