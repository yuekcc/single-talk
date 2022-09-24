BEGIN TRANSACTION;
CREATE TABLE "talk" (
	"id"	INTEGER,
	"message"	TEXT,
	"created_time"	TEXT,
	"message_type"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
)
COMMIT;
