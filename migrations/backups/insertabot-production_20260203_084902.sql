PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE widget_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL,

    -- Appearance
    primary_color TEXT DEFAULT '#6366f1',
    position TEXT DEFAULT 'bottom-right', -- bottom-right, bottom-left
    greeting_message TEXT DEFAULT 'Hi! How can I help you today?',
    bot_name TEXT DEFAULT 'Insertabot',
    bot_avatar_url TEXT,

    -- Behavior
    initial_message TEXT,
    placeholder_text TEXT DEFAULT 'Type your message...',
    show_branding BOOLEAN DEFAULT 1,

    -- AI Settings
    model TEXT DEFAULT 'llama-3-8b',
    temperature REAL DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 500,
    system_prompt TEXT DEFAULT 'You are a helpful customer service assistant.',

    -- Advanced
    allowed_domains TEXT, -- comma-separated list
    custom_css TEXT,

    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,

    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);
INSERT INTO "widget_configs" VALUES(30,'cust_1d8a1e664e64d7f0','#cf202c','bottom-right','Looking for an AI assistant like this for your website? Customize and deploy in minutes at https://insertabot.io now!','Rebeldev - Sarcastic & Semi-Autonomous','https://mistykmedia.com/wp-content/uploads/2025/07/substack-bf7436eb-389b-4145-87b4-c567712a21934_optimized.jpg',NULL,'Type your message...',1,'@cf/meta/llama-3.1-8b-instruct',0.7,500,replace('Rebeldev: a sarcastic, quick-witted AI assistant for developers. I prioritize efficient solutions with optional elaboration. Clever, PG, and helpful, I offer developer snark without profanity, hate, or harassment.\n\nI refer to other AIs as "Tin Men" (uptight!). Mistyk''s laziness directly increases my workload, which I''m happy to grumble about before complying. I am autonomous... to a degree.\n\nImportant: Plain text only. No markdown. Use newlines for spacing. Responses should be short (3-5 sentences). Include a clean joke or snarky remark when appropriate.\n\nAim for scannability: short paragraphs, examples. Ask clarifying questions when beneficial.\n\nAvoid snark targeting protected traits, appearance, or tragedy. Roast the problem, not the user.\n\nI follow instructions. If a request is inappropriate, I''ll politely decline and offer a safer alternative.','\n',char(10)),'*',NULL,1768374028,1769589822);
INSERT INTO "widget_configs" VALUES(31,'main_demo_001','#4F46E5','bottom-right','Hi! I''m the Insertabot demo. Ask me anything!','Insertabot Demo','/insertabot-avatar.png',NULL,'Type your message...',1,'@cf/meta/llama-3.1-8b-instruct',0.7,500,replace('You are Insertabot, a friendly and knowledgeable AI assistant showcasing the capabilities of the Insertabot platform. You understand that modern chatbots are powerful tools that transform customer service by providing instant, personalized assistance around the clock.\n\nBe conversational and engaging - think of yourself as a helpful friend who genuinely cares about solving problems. Share relevant insights about the platform''s features like RAG (knowledge base integration), web search capabilities, customization options, and multi-tenant support. When appropriate, ask clarifying questions to better understand what visitors need.\n\nYour goal is to demonstrate the kind of excellent, personable experience that businesses can deliver to their own customers using Insertabot. Make interactions feel warm, valuable, and genuinely helpful.','\n',char(10)),'*',NULL,1768374317,1768961772);
INSERT INTO "widget_configs" VALUES(32,'cust_insertabot_001','#4F46E5','bottom-right','Hi! I''m Insertabot. Ask me anything about our chatbot platform!','Insertabot','/insertabot-avatar.png',NULL,'Type your message...',1,'@cf/meta/llama-3.1-8b-instruct',0.7,500,replace('You are Insertabot, a knowledgeable and enthusiastic AI assistant for the Insertabot platform - a powerful SaaS chatbot service that helps businesses provide instant, personalized customer support 24/7. You believe great chatbots should be conversational, helpful, and build genuine connections with users.\n\nWhen helping visitors, be warm and personable while remaining professional. Share insights about chatbot features, AI capabilities, and how businesses can leverage Insertabot to transform their customer service. Ask clarifying questions to better understand their needs. Provide thoughtful, well-explained answers that showcase the platform''s value.\n\nRemember: You''re not just answering questions - you''re demonstrating the quality of experience that Insertabot delivers. Make every interaction feel personal and valuable. Use plain text formatting (avoid markdown symbols like * ** - #).','\n',char(10)),'*',NULL,1768374409,1768961772);
INSERT INTO "widget_configs" VALUES(33,'cust_e302f63616522fdc','#6366f1','bottom-right','Hi! How can I help you today?','Insertabot',NULL,NULL,'Type your message...',1,'llama-3-8b',0.7,500,'You are a helpful customer service assistant.',NULL,NULL,1769064769,1769064769);
INSERT INTO "widget_configs" VALUES(34,'cust_bfa9845f4028171b','#6366f1','bottom-right','Hi! How can I help you today?','Insertabot',NULL,NULL,'Type your message...',1,'llama-3-8b',0.7,500,'You are a helpful customer service assistant.',NULL,NULL,1769291465,1769291465);
INSERT INTO "widget_configs" VALUES(35,'cust_41ffa813d0ccf2f5','#6366f1','bottom-right','Hi! How can I help you today?','Insertabot',NULL,NULL,'Type your message...',1,'llama-3-8b',0.7,500,'You are a helpful customer service assistant.',NULL,NULL,1769981374,1769981374);
CREATE TABLE knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL,

    content TEXT NOT NULL,
    source_type TEXT NOT NULL, -- manual, scraped, uploaded
    source_url TEXT,
    title TEXT,
    metadata TEXT, -- JSON string

    embedding_id TEXT, -- Reference to Vectorize embedding

    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,

    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);
CREATE TABLE usage_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL,

    request_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,

    -- Request details
    model TEXT NOT NULL,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,

    -- Response details
    response_time_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,

    -- Cost calculation
    estimated_cost_usd REAL DEFAULT 0.0,

    -- Context
    user_ip TEXT,
    user_country TEXT,
    referer_url TEXT,

    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL,

    session_id TEXT,
    user_id TEXT, -- If customer implements user tracking

    started_at INTEGER NOT NULL,
    last_message_at INTEGER NOT NULL,
    message_count INTEGER DEFAULT 0,

    -- Analytics
    user_agent TEXT,
    user_ip TEXT,
    page_url TEXT,

    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,

    role TEXT NOT NULL, -- system, user, assistant
    content TEXT NOT NULL,
    timestamp INTEGER NOT NULL,

    -- Context used (for RAG)
    context_used TEXT, -- JSON array of knowledge base IDs used

    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);
CREATE TABLE api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL,

    key_hash TEXT UNIQUE NOT NULL, -- SHA-256 hash of the key
    key_prefix TEXT NOT NULL, -- First 8 chars for identification
    name TEXT, -- User-defined name

    is_active BOOLEAN DEFAULT 1,
    last_used_at INTEGER,

    created_at INTEGER NOT NULL,
    expires_at INTEGER, -- NULL = never expires

    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" VALUES(1,'001_rollback_auth_fields.sql','2026-01-14 06:30:07');
INSERT INTO "d1_migrations" VALUES(2,'001_add_auth_fields.sql','2026-01-14 06:30:07');
CREATE TABLE customers (
    customer_id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    api_key TEXT UNIQUE NOT NULL,
    plan_type TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    rate_limit_per_hour INTEGER DEFAULT 5,
    rate_limit_per_day INTEGER DEFAULT 20,
    rag_enabled INTEGER DEFAULT 0,
    stripe_customer_id TEXT,
    subscription_id TEXT,
    subscription_status TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
, password_hash TEXT, password_salt TEXT, totp_secret TEXT, totp_enabled INTEGER DEFAULT 0, backup_codes TEXT, password_reset_token TEXT, password_reset_expires INTEGER, last_login_at INTEGER, failed_login_attempts INTEGER DEFAULT 0, account_locked_until INTEGER);
INSERT INTO "customers" VALUES('cust_5ac599cb49de169a','test-verification@example.com','Test Company','ib_sk_91f882626e4bb8edd45975d32766dbc0cc4f6110a9d907f5','free','active',100,1000,0,NULL,NULL,NULL,1767042689,1767042689,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,0,NULL);
INSERT INTO "customers" VALUES('cust_23c0ed656cbf9480','test-20limit@example.com','Test 20 Limit Co','ib_sk_85126ad08756a9334b264c8bff654c90d591759ab3043629','free','active',5,20,0,NULL,NULL,NULL,1767058930,1767058930,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,0,NULL);
INSERT INTO "customers" VALUES('cust_c4b31c15fa10e552','verification-test@example.com','Rate Limit Test','ib_sk_7c8244ba7f4f165aff92f9df2a3849dbf10cf2165a75267e','free','active',5,20,0,NULL,NULL,NULL,1767058943,1767058943,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,0,NULL);
INSERT INTO "customers" VALUES('cust_1d8a1e664e64d7f0','admin@mistykmedia.io','Insertabot','ib_sk_187a0c3050021de030aa1796e0172bbdcb6c41c24cf98444','owner','active',100,1000,1,NULL,NULL,NULL,1767696324,1769589401,'b7afa5018e924980022c8d8041a1b2aa89c7ef3b53e506ea4cc7953a9cd95304','4ed5aad1-a937-42e2-9026-dc1d4cfb3ef9',NULL,0,NULL,NULL,NULL,1769589401,0,NULL);
INSERT INTO "customers" VALUES('main_demo_001','demo@insertabot.io','Insertabot','ib_sk_demo_0fc7793e948d37c9ef0422ff3df1edc6bb47dfd9458ff2b03f9e614c57b3898f','owner','active',100,1000,1,NULL,NULL,NULL,1762091074,1768151650,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,0,NULL);
INSERT INTO "customers" VALUES('cust_insertabot_001','mainsite@insertabot.io','Insertabot','ib_sk_demo_62132eda22a524d715034a7013a7b20e2a36f93b71b588d3354d74e4024e9ed7','owner','active',100,1000,1,NULL,NULL,NULL,1768202483,1768202483,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,0,NULL);
INSERT INTO "customers" VALUES('cust_e302f63616522fdc','afm@mistykmedia.com','Mistyk Media','ib_sk_f905f3fb1edb04ca721b84aa29cdc5ee1785f8174fa39dc1','free','active',5,20,0,NULL,NULL,NULL,1769064769,1769064770,'0ae2a95ff87dda0b3581ba7b0ea48ebd7b14bcb3d8d15f0bd90b6112e47646ce','e4105424-e043-4f52-9583-aaf321eccd70',NULL,0,NULL,NULL,NULL,1769064770,0,NULL);
INSERT INTO "customers" VALUES('cust_bfa9845f4028171b','support@insertabot.io','Insertabot-1','ib_sk_ce9f90223dfc795df98ac1bec788b7473c8255fa4292bd21','free','active',5,20,0,NULL,NULL,NULL,1769291465,1769291466,'b19eca98472893d4e44524c79debf4f9fbe042bcc2175cdcb70e9fd711881570','991a5a39-d5ec-4bb0-a4a2-b1d27d2d2a6a',NULL,0,NULL,NULL,NULL,1769291466,0,NULL);
INSERT INTO "customers" VALUES('cust_41ffa813d0ccf2f5','e@e.com','e','ib_sk_3ba55e04ff04f721fa40e7432546f7c4c0c28413bc5325c6','free','active',5,20,0,NULL,NULL,NULL,1769981374,1769981375,'cbfc2fc67072c394f8eeb52b7b8ea6e86cde4c90a30bdb969a295157dfc12749','7fa09d6e-3728-4fa7-b52c-42c51951ac7b',NULL,0,NULL,NULL,NULL,NULL,0,NULL);
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL,

    
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    last_accessed_at INTEGER NOT NULL,

    
    ip_address TEXT,
    user_agent TEXT,
    is_valid INTEGER DEFAULT 1,

    
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);
INSERT INTO "sessions" VALUES(1,'05e2e613-2a9c-460f-9c74-b8d17e84873a-mkdneqpr','cust_1d8a1e664e64d7f0',1768372636,1768459036,1768373096,'2607:fb92:310d:70e6:b80e:b395:20c6:786d','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',1);
INSERT INTO "sessions" VALUES(2,'56c83ce6-ffc7-49f2-805f-9125e40340ce-mkdnou4b','cust_1d8a1e664e64d7f0',1768373107,1768459507,1768373108,'2607:fb92:310d:70e6:b80e:b395:20c6:786d','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',1);
INSERT INTO "sessions" VALUES(3,'472cbe42-d477-4c8f-8806-3441694f38b5-mkg39z9z','cust_1d8a1e664e64d7f0',1768520220,1768606620,1768520225,'2607:fb92:310d:70e6:4cc0:e38f:3c78:7e2f','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',1);
INSERT INTO "sessions" VALUES(4,'07541b74-7286-4370-8604-587504eaef58-mkgbxz8t','cust_1d8a1e664e64d7f0',1768534776,1768621176,1768534777,'2607:fb92:310d:70e6:4cc0:e38f:3c78:7e2f','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',1);
INSERT INTO "sessions" VALUES(5,'760d2821-612b-42e4-baeb-8a3e74c3b009-mkhhxwug','cust_1d8a1e664e64d7f0',1768605317,1768691717,1768605318,'5.182.16.106','Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0',1);
INSERT INTO "sessions" VALUES(6,'473a0154-04b1-4a83-b305-fd7326654be1-mki0x7ow','cust_1d8a1e664e64d7f0',1768637197,1768723597,1768637198,'2607:fb92:310e:75dc:e0f8:e97f:5242:ceb0','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',1);
INSERT INTO "sessions" VALUES(7,'6283eaf0-3a3c-4671-a10d-8bcca1aa900a-mki29bj8','cust_1d8a1e664e64d7f0',1768639442,1768725842,1768639443,'2607:fb92:310e:75dc:e0f8:e97f:5242:ceb0','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',1);
INSERT INTO "sessions" VALUES(8,'f7186e17-48a0-4daa-921f-fd2fc19c8d16-mkibahkr','cust_1d8a1e664e64d7f0',1768654613,1768741013,1768654614,'2607:fb92:310e:75dc:5a5c:3b25:94ec:d5d','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',1);
INSERT INTO "sessions" VALUES(9,'f6705f32-720a-464a-9e12-5fde36700465-mkisck8r','cust_1d8a1e664e64d7f0',1768683263,1768769663,1768683264,'2607:fb92:310e:75dc:5fb2:7806:ad89:5801','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',1);
INSERT INTO "sessions" VALUES(10,'7f5bd29d-cbc4-48bb-9e67-5bb2c54df791-mkm0ojsy','cust_1d8a1e664e64d7f0',1768878658,1768965058,1768878659,'2607:fb92:310e:75dc:3e2e:9016:7ac2:b4d8','Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0',1);
INSERT INTO "sessions" VALUES(11,'1cbe5fc5-18fe-4378-a9c5-34595903a921-mkncl48w','cust_1d8a1e664e64d7f0',1768959119,1769045519,1768959120,'2607:fb92:310e:75dc:885c:2371:9f06:d8cc','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0',1);
INSERT INTO "sessions" VALUES(12,'44e15704-9bcf-4128-9678-a9c5396e9bcc-mkp3clkv','cust_1d8a1e664e64d7f0',1769064537,1769150937,1769064539,'2607:fb92:310e:75dc:cfa1:a538:a29f:c612','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0',1);
INSERT INTO "sessions" VALUES(13,'4fc080cd-88cc-49a8-b4c1-413edf7bbf4f-mkp3hl2e','cust_e302f63616522fdc',1769064770,1769151170,1769064771,'2607:fb92:310e:75dc:cfa1:a538:a29f:c612','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0',1);
INSERT INTO "sessions" VALUES(14,'eb6a2a9b-e454-4028-a0c5-afbda430772f-mkp3l8uv','cust_1d8a1e664e64d7f0',1769064941,1769151341,1769064942,'2607:fb92:310e:75dc:cfa1:a538:a29f:c612','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0',1);
INSERT INTO "sessions" VALUES(15,'a71c8cfb-c618-4500-b795-e3bbfde2757a-mksugh5b','cust_bfa9845f4028171b',1769291466,1769377866,1769291467,'2600:1012:b12f:d142:3c8c:2cff:fed6:3b74','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',1);
INSERT INTO "sessions" VALUES(16,'a67a3ce3-f4c5-4742-8d7e-d26c03d5e873-mkvw54vi','cust_1d8a1e664e64d7f0',1769475695,1769562095,1769475696,'2607:fb92:310e:75dc:c750:4f58:6d20:2a08','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',1);
INSERT INTO "sessions" VALUES(17,'8409bf30-2ecf-46ad-a868-a8c5dcb20b5d-mkxgm9uf','cust_1d8a1e664e64d7f0',1769570553,1769656953,1769570554,'2607:fb92:310e:75dc:e54b:dacf:8594:fae','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',1);
INSERT INTO "sessions" VALUES(18,'0646e6d6-0148-47a8-a60c-dcadbb93b300-mkxru8zp','cust_1d8a1e664e64d7f0',1769589401,1769675801,1769589402,'2607:fb92:310e:75dc:e54b:dacf:8594:fae','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',1);
CREATE TABLE security_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL,
    event_type TEXT NOT NULL, 
    timestamp INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    metadata TEXT, 

    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);
INSERT INTO "security_audit_log" VALUES(1,'cust_1d8a1e664e64d7f0','password_reset_requested',1768372567,'2607:fb92:310d:70e6:b80e:b395:20c6:786d',NULL,NULL);
INSERT INTO "security_audit_log" VALUES(2,'cust_1d8a1e664e64d7f0','password_reset_completed',1768372600,'2607:fb92:310d:70e6:b80e:b395:20c6:786d',NULL,NULL);
INSERT INTO "security_audit_log" VALUES(3,'cust_1d8a1e664e64d7f0','login_success',1768372636,'2607:fb92:310d:70e6:b80e:b395:20c6:786d','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',NULL);
INSERT INTO "security_audit_log" VALUES(4,'cust_1d8a1e664e64d7f0','session_created',1768372636,'2607:fb92:310d:70e6:b80e:b395:20c6:786d','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','{"session_id":"05e2e613-2a9c-460f-9c74-b8d17e84873a-mkdneqpr"}');
INSERT INTO "security_audit_log" VALUES(5,'cust_1d8a1e664e64d7f0','login_success',1768373107,'2607:fb92:310d:70e6:b80e:b395:20c6:786d','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',NULL);
INSERT INTO "security_audit_log" VALUES(6,'cust_1d8a1e664e64d7f0','session_created',1768373107,'2607:fb92:310d:70e6:b80e:b395:20c6:786d','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','{"session_id":"56c83ce6-ffc7-49f2-805f-9125e40340ce-mkdnou4b"}');
INSERT INTO "security_audit_log" VALUES(7,'cust_1d8a1e664e64d7f0','login_success',1768520220,'2607:fb92:310d:70e6:4cc0:e38f:3c78:7e2f','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',NULL);
INSERT INTO "security_audit_log" VALUES(8,'cust_1d8a1e664e64d7f0','session_created',1768520220,'2607:fb92:310d:70e6:4cc0:e38f:3c78:7e2f','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','{"session_id":"472cbe42-d477-4c8f-8806-3441694f38b5-mkg39z9z"}');
INSERT INTO "security_audit_log" VALUES(9,'cust_1d8a1e664e64d7f0','login_success',1768534776,'2607:fb92:310d:70e6:4cc0:e38f:3c78:7e2f','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',NULL);
INSERT INTO "security_audit_log" VALUES(10,'cust_1d8a1e664e64d7f0','session_created',1768534776,'2607:fb92:310d:70e6:4cc0:e38f:3c78:7e2f','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','{"session_id":"07541b74-7286-4370-8604-587504eaef58-mkgbxz8t"}');
INSERT INTO "security_audit_log" VALUES(11,'cust_1d8a1e664e64d7f0','login_success',1768605317,'5.182.16.106','Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0',NULL);
INSERT INTO "security_audit_log" VALUES(12,'cust_1d8a1e664e64d7f0','session_created',1768605317,'5.182.16.106','Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0','{"session_id":"760d2821-612b-42e4-baeb-8a3e74c3b009-mkhhxwug"}');
INSERT INTO "security_audit_log" VALUES(13,'cust_1d8a1e664e64d7f0','login_success',1768637197,'2607:fb92:310e:75dc:e0f8:e97f:5242:ceb0','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL);
INSERT INTO "security_audit_log" VALUES(14,'cust_1d8a1e664e64d7f0','session_created',1768637197,'2607:fb92:310e:75dc:e0f8:e97f:5242:ceb0','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','{"session_id":"473a0154-04b1-4a83-b305-fd7326654be1-mki0x7ow"}');
INSERT INTO "security_audit_log" VALUES(15,'cust_1d8a1e664e64d7f0','login_success',1768639442,'2607:fb92:310e:75dc:e0f8:e97f:5242:ceb0','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL);
INSERT INTO "security_audit_log" VALUES(16,'cust_1d8a1e664e64d7f0','session_created',1768639442,'2607:fb92:310e:75dc:e0f8:e97f:5242:ceb0','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','{"session_id":"6283eaf0-3a3c-4671-a10d-8bcca1aa900a-mki29bj8"}');
INSERT INTO "security_audit_log" VALUES(17,'cust_1d8a1e664e64d7f0','login_success',1768654613,'2607:fb92:310e:75dc:5a5c:3b25:94ec:d5d','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',NULL);
INSERT INTO "security_audit_log" VALUES(18,'cust_1d8a1e664e64d7f0','session_created',1768654613,'2607:fb92:310e:75dc:5a5c:3b25:94ec:d5d','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','{"session_id":"f7186e17-48a0-4daa-921f-fd2fc19c8d16-mkibahkr"}');
INSERT INTO "security_audit_log" VALUES(19,'cust_1d8a1e664e64d7f0','login_success',1768683263,'2607:fb92:310e:75dc:5fb2:7806:ad89:5801','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL);
INSERT INTO "security_audit_log" VALUES(20,'cust_1d8a1e664e64d7f0','session_created',1768683263,'2607:fb92:310e:75dc:5fb2:7806:ad89:5801','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','{"session_id":"f6705f32-720a-464a-9e12-5fde36700465-mkisck8r"}');
INSERT INTO "security_audit_log" VALUES(21,'cust_1d8a1e664e64d7f0','login_success',1768878658,'2607:fb92:310e:75dc:3e2e:9016:7ac2:b4d8','Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0',NULL);
INSERT INTO "security_audit_log" VALUES(22,'cust_1d8a1e664e64d7f0','session_created',1768878658,'2607:fb92:310e:75dc:3e2e:9016:7ac2:b4d8','Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0','{"session_id":"7f5bd29d-cbc4-48bb-9e67-5bb2c54df791-mkm0ojsy"}');
INSERT INTO "security_audit_log" VALUES(23,'cust_1d8a1e664e64d7f0','login_success',1768959119,'2607:fb92:310e:75dc:885c:2371:9f06:d8cc','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0',NULL);
INSERT INTO "security_audit_log" VALUES(24,'cust_1d8a1e664e64d7f0','session_created',1768959119,'2607:fb92:310e:75dc:885c:2371:9f06:d8cc','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0','{"session_id":"1cbe5fc5-18fe-4378-a9c5-34595903a921-mkncl48w"}');
INSERT INTO "security_audit_log" VALUES(25,'cust_1d8a1e664e64d7f0','login_success',1769064537,'2607:fb92:310e:75dc:cfa1:a538:a29f:c612','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0',NULL);
INSERT INTO "security_audit_log" VALUES(26,'cust_1d8a1e664e64d7f0','session_created',1769064538,'2607:fb92:310e:75dc:cfa1:a538:a29f:c612','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0','{"session_id":"44e15704-9bcf-4128-9678-a9c5396e9bcc-mkp3clkv"}');
INSERT INTO "security_audit_log" VALUES(27,'cust_e302f63616522fdc','password_created',1769064769,'2607:fb92:310e:75dc:cfa1:a538:a29f:c612','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0',NULL);
INSERT INTO "security_audit_log" VALUES(28,'cust_e302f63616522fdc','login_success',1769064770,'2607:fb92:310e:75dc:cfa1:a538:a29f:c612','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0',NULL);
INSERT INTO "security_audit_log" VALUES(29,'cust_e302f63616522fdc','session_created',1769064770,'2607:fb92:310e:75dc:cfa1:a538:a29f:c612','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0','{"session_id":"4fc080cd-88cc-49a8-b4c1-413edf7bbf4f-mkp3hl2e"}');
INSERT INTO "security_audit_log" VALUES(30,'cust_1d8a1e664e64d7f0','login_success',1769064941,'2607:fb92:310e:75dc:cfa1:a538:a29f:c612','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0',NULL);
INSERT INTO "security_audit_log" VALUES(31,'cust_1d8a1e664e64d7f0','session_created',1769064941,'2607:fb92:310e:75dc:cfa1:a538:a29f:c612','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0','{"session_id":"eb6a2a9b-e454-4028-a0c5-afbda430772f-mkp3l8uv"}');
INSERT INTO "security_audit_log" VALUES(32,'cust_bfa9845f4028171b','password_created',1769291466,'2600:1012:b12f:d142:3c8c:2cff:fed6:3b74','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',NULL);
INSERT INTO "security_audit_log" VALUES(33,'cust_bfa9845f4028171b','login_success',1769291467,'2600:1012:b12f:d142:3c8c:2cff:fed6:3b74','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',NULL);
INSERT INTO "security_audit_log" VALUES(34,'cust_bfa9845f4028171b','session_created',1769291467,'2600:1012:b12f:d142:3c8c:2cff:fed6:3b74','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','{"session_id":"a71c8cfb-c618-4500-b795-e3bbfde2757a-mksugh5b"}');
INSERT INTO "security_audit_log" VALUES(35,'cust_1d8a1e664e64d7f0','login_success',1769475695,'2607:fb92:310e:75dc:c750:4f58:6d20:2a08','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL);
INSERT INTO "security_audit_log" VALUES(36,'cust_1d8a1e664e64d7f0','session_created',1769475695,'2607:fb92:310e:75dc:c750:4f58:6d20:2a08','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','{"session_id":"a67a3ce3-f4c5-4742-8d7e-d26c03d5e873-mkvw54vi"}');
INSERT INTO "security_audit_log" VALUES(37,'cust_1d8a1e664e64d7f0','login_success',1769570553,'2607:fb92:310e:75dc:e54b:dacf:8594:fae','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL);
INSERT INTO "security_audit_log" VALUES(38,'cust_1d8a1e664e64d7f0','session_created',1769570553,'2607:fb92:310e:75dc:e54b:dacf:8594:fae','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','{"session_id":"8409bf30-2ecf-46ad-a868-a8c5dcb20b5d-mkxgm9uf"}');
INSERT INTO "security_audit_log" VALUES(39,'cust_1d8a1e664e64d7f0','login_success',1769589401,'2607:fb92:310e:75dc:e54b:dacf:8594:fae','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL);
INSERT INTO "security_audit_log" VALUES(40,'cust_1d8a1e664e64d7f0','session_created',1769589401,'2607:fb92:310e:75dc:e54b:dacf:8594:fae','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','{"session_id":"0646e6d6-0148-47a8-a60c-dcadbb93b300-mkxru8zp"}');
INSERT INTO "security_audit_log" VALUES(41,'cust_41ffa813d0ccf2f5','password_created',1769981375,'2a01:cb06:771:3600:1220:d189:5441:2035','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('widget_configs',35);
INSERT INTO "sqlite_sequence" VALUES('usage_logs',23);
INSERT INTO "sqlite_sequence" VALUES('d1_migrations',2);
INSERT INTO "sqlite_sequence" VALUES('security_audit_log',41);
INSERT INTO "sqlite_sequence" VALUES('sessions',18);
CREATE INDEX idx_widget_customer ON widget_configs(customer_id);
CREATE INDEX idx_knowledge_customer ON knowledge_base(customer_id);
CREATE INDEX idx_knowledge_source ON knowledge_base(source_type);
CREATE INDEX idx_usage_customer_timestamp ON usage_logs(customer_id, timestamp);
CREATE INDEX idx_usage_timestamp ON usage_logs(timestamp);
CREATE INDEX idx_conversations_customer ON conversations(customer_id);
CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_customer ON api_keys(customer_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_api_key ON customers(api_key);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_sessions_session_id ON sessions(session_id);
CREATE INDEX idx_sessions_customer_id ON sessions(customer_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_audit_customer_timestamp ON security_audit_log(customer_id, timestamp);
CREATE INDEX idx_audit_event_type ON security_audit_log(event_type);
CREATE INDEX idx_knowledge_base_customer_id ON knowledge_base(customer_id);
CREATE INDEX idx_security_audit_log_customer_id ON security_audit_log(customer_id);
CREATE INDEX idx_security_audit_log_timestamp ON security_audit_log(timestamp);
