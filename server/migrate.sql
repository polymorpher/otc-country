CREATE TABLE "public"."logs" (
  "id" SERIAL PRIMARY KEY,
  "event_name" TEXT NOT NULL,
  "domain_name" TEXT NOT NULL,
  "src_asset" TEXT NOT NULL,
  "dest_asset" TEXT NOT NULL,
  "offer_address" TEXT NOT NULL,
  "domain_owner" TEXT NOT NULL,
  "total_deposits" TEXT NOT NULL,
  "close_amount" TEXT NOT NULL,
  "src_price" TEXT NOT NULL,
  "dest_price" TEXT NOT NULL,
  "time" TIMESTAMP NOT NULL
);
