-- CreateTable
CREATE TABLE "public"."NotificationPref" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "budgetAlertsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "threshold80Enabled" BOOLEAN NOT NULL DEFAULT true,
    "threshold100Enabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "webPushEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPref_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WebPushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebPushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPref_userId_key" ON "public"."NotificationPref"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WebPushSubscription_userId_endpoint_key" ON "public"."WebPushSubscription"("userId", "endpoint");

-- AddForeignKey
ALTER TABLE "public"."NotificationPref" ADD CONSTRAINT "NotificationPref_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WebPushSubscription" ADD CONSTRAINT "WebPushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
