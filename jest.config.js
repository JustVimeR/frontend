const nextJest = require("next/jest");

const createJestConfig = nextJest({
	dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
	testEnvironment: "jest-environment-jsdom",
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
	},
	collectCoverageFrom: [
		"src/**/*.{ts,tsx}",
		"!src/**/*.d.ts",
		"!src/app/layout.tsx",
		"!src/app/globals.css",
		"!src/app/oltp/page.tsx",
		"!src/app/reports/[slug]/page.tsx",
		"!src/app/page.tsx",
	],
	coverageThreshold: {
		global: {
			lines: 75,
		},
	},
	testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
};

module.exports = createJestConfig(customJestConfig);
