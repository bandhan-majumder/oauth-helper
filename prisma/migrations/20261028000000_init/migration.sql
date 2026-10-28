CREATE TABLE "oauth_guides" (
    "slug" TEXT NOT NULL,
    "app_name" TEXT NOT NULL,
    "app_domain" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checked_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "oauth_guides_pkey" PRIMARY KEY ("slug")
);

CREATE INDEX "oauth_guides_app_name_idx" ON "oauth_guides"("app_name");
CREATE INDEX "oauth_guides_app_domain_idx" ON "oauth_guides"("app_domain");
