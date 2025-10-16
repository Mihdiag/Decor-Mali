CREATE TABLE `categories` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fabricOptions` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`pricePerMeter` int NOT NULL,
	`imageUrl` text,
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `fabricOptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(64) NOT NULL,
	`quoteId` varchar(64),
	`userId` varchar(64),
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320),
	`customerPhone` varchar(50) NOT NULL,
	`customerAddress` text,
	`status` enum('pending','confirmed','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`totalAmount` int NOT NULL,
	`paidAmount` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(64) NOT NULL,
	`categoryId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text,
	`basePrice` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quoteItems` (
	`id` varchar(64) NOT NULL,
	`quoteId` varchar(64) NOT NULL,
	`productType` enum('salon','tapis','rideau','moquette','accessoire') NOT NULL,
	`productName` varchar(255) NOT NULL,
	`mattressLength` int,
	`mattressCount` int,
	`cornerCount` int,
	`armCount` int,
	`fabricId` varchar(64),
	`fabricName` varchar(255),
	`thicknessId` varchar(64),
	`thickness` int,
	`hasSmallTable` boolean DEFAULT false,
	`hasBigTable` boolean DEFAULT false,
	`length` int,
	`width` int,
	`needsDelivery` boolean DEFAULT false,
	`deliveryLocation` varchar(255),
	`unitPrice` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`subtotal` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `quoteItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64),
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320),
	`customerPhone` varchar(50) NOT NULL,
	`customerAddress` text,
	`status` enum('pending','validated','rejected','converted') NOT NULL DEFAULT 'pending',
	`totalAmount` int NOT NULL,
	`notes` text,
	`adminNotes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	`validatedAt` timestamp,
	`validatedBy` varchar(64),
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `thicknessOptions` (
	`id` varchar(64) NOT NULL,
	`thickness` int NOT NULL,
	`priceMultiplier` int NOT NULL,
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `thicknessOptions_id` PRIMARY KEY(`id`)
);
