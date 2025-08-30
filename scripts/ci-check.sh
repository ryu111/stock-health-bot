#!/bin/bash
# 🔍 CI Quality Checks for Stock Health LINE Bot
# This script runs all predefined code quality checks locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
Purple='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🤖 Starting CI Quality Checks for Stock Health LINE Bot...${NC}"
echo "================================================================"

# Change to functions directory
if [ ! -d "functions" ]; then
    echo -e "${RED}❌ Functions directory not found!${NC}"
    exit 1
fi

cd functions

echo -e "${YELLOW}🔍 Step 1: Checking Node.js version...${NC}"
node --version
echo -e "${GREEN}✅ Node.js version check passed${NC}\n"

echo -e "${YELLOW}📦 Step 2: Installing dependencies...${NC}"
INSTALL_OUTPUT=$(npm install 2>&1)
INSTALL_EXIT_CODE=$?
if [ $INSTALL_EXIT_CODE -ne 0 ]; then
    echo -e "${RED}❌ Dependency installation failed!${NC}"
    echo "$INSTALL_OUTPUT"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed successfully${NC}\n"

echo -e "${YELLOW}🔍 Step 3: Running ESLint...${NC}"
ESLINT_OUTPUT=$(npm run lint 2>&1)
ESLINT_EXIT_CODE=$?
if [ $ESLINT_EXIT_CODE -ne 0 ]; then
    echo -e "${RED}❌ ESLint check failed!${NC}"
    echo "$ESLINT_OUTPUT"
    echo -e "${YELLOW}💡 Try: npm run lint:fix${NC}"
    exit 1
fi
echo -e "${GREEN}✅ ESLint check passed${NC}\n"

echo -e "${YELLOW}🎨 Step 4: Checking Prettier formatting...${NC}"
if ! npm run format:check 2>&1; then
    echo -e "${RED}❌ Prettier format check failed!${NC}"
    echo -e "${YELLOW}💡 Try: npm run format${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Prettier format check passed${NC}\n"

echo -e "${YELLOW}🏗️ Step 5: Building project...${NC}"
if ! npm run build 2>&1; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build check passed${NC}\n"

echo -e "${YELLOW}🧪 Step 6: Running local tests...${NC}"
if ! npm run local-test 2>&1; then
    echo -e "${RED}❌ Local tests failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Local tests passed${NC}\n"

echo -e "${YELLOW}📝 Step 7: Running full verification...${NC}"
if ! npm run verify 2>&1; then
    echo -e "${RED}❌ Verification failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Verification passed${NC}\n"

echo "================================================================"
echo -e "${GREEN}🎉 All CI checks passed successfully!${NC}"
echo -e "${Purple}📊 Quality Summary:${NC}"
echo "  ✅ ESLint: Passed (No syntax errors)"
echo "  ✅ Prettier: Passed (Code properly formatted)"
echo "  ✅ Build: Passed (Project compilable)"
echo "  ✅ Tests: Passed (Local syntax check)"
echo "  ✅ Verify: Passed (Environment validated)"
echo ""
echo -e "${BLUE}🚀 Ready for commit and deployment!${NC}"

cd ..
exit 0