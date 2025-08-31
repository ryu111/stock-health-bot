#!/bin/bash
# 🔍 股健檢 LINE Bot 品質檢查
# 此腳本執行所有預定義的程式碼品質檢查

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
Purple='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🤖 開始執行股健檢 LINE Bot 品質檢查...${NC}"
echo "================================================================"

# Change to functions directory
if [ ! -d "functions" ]; then
    echo -e "${RED}❌ Functions directory not found!${NC}"
    exit 1
fi

cd functions

echo -e "${YELLOW}🔍 步驟 1: 檢查 Node.js 版本...${NC}"
node --version
echo -e "${GREEN}✅ Node.js 版本檢查通過${NC}\n"

echo -e "${YELLOW}📦 步驟 2: 安裝依賴套件...${NC}"
INSTALL_OUTPUT=$(npm install 2>&1)
INSTALL_EXIT_CODE=$?
if [ $INSTALL_EXIT_CODE -ne 0 ]; then
    echo -e "${RED}❌ 依賴套件安裝失敗！${NC}"
    echo "$INSTALL_OUTPUT"
    exit 1
fi
echo -e "${GREEN}✅ 依賴套件安裝成功${NC}\n"

echo -e "${YELLOW}🔍 步驟 3: 執行 ESLint 檢查...${NC}"
ESLINT_OUTPUT=$(npm run lint 2>&1)
ESLINT_EXIT_CODE=$?
if [ $ESLINT_EXIT_CODE -ne 0 ]; then
  echo -e "${RED}❌ ESLint 檢查失敗！${NC}"
  echo "$ESLINT_OUTPUT"
  echo -e "${YELLOW}💡 嘗試: npm run lint:fix${NC}"
  exit 1
fi
echo -e "${GREEN}✅ ESLint 檢查通過${NC}\n"

echo -e "${YELLOW}🎨 步驟 4: 檢查 Prettier 格式...${NC}"
if ! npm run format:check 2>&1; then
  echo -e "${RED}❌ Prettier 格式檢查失敗！${NC}"
  echo -e "${YELLOW}💡 嘗試: npm run format${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Prettier 格式檢查通過${NC}\n"

echo -e "${YELLOW}🏗️ 步驟 5: 建置專案...${NC}"
if ! npm run build 2>&1; then
    echo -e "${RED}❌ 建置失敗！${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 建置檢查通過${NC}\n"

echo -e "${YELLOW}📝 步驟 6: 執行完整驗證...${NC}"
if ! npm run verify 2>&1; then
    echo -e "${RED}❌ 驗證失敗！${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 驗證通過${NC}\n"

echo "================================================================"
echo -e "${GREEN}🎉 基礎 CI 檢查都成功通過！${NC}"
echo -e "${Purple}📊 基礎品質摘要:${NC}"
echo "  ✅ ESLint: 通過 (無語法錯誤)"
echo "  ✅ Prettier: 通過 (程式碼格式正確)"
echo "  ✅ 建置: 通過 (專案可編譯)"
echo "  ✅ 驗證: 通過 (環境驗證完成)"
echo ""
echo -e "${BLUE}🚀 基礎檢查完成，繼續執行測試檢查...${NC}"

echo -e "${YELLOW}🧪 步驟 7: 執行 Jest 測試...${NC}"
if ! npm run test:ci 2>&1; then
    echo -e "${RED}❌ Jest 測試失敗！${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Jest 測試通過${NC}\n"

echo -e "${YELLOW}📊 步驟 8: 檢查測試覆蓋率...${NC}"
if ! npm run test:coverage:check 2>&1; then
    echo -e "${RED}❌ 測試覆蓋率檢查失敗！${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 測試覆蓋率檢查通過${NC}\n"

echo "================================================================"
echo -e "${GREEN}🎉 完整 CI 檢查都成功通過！${NC}"
echo -e "${Purple}📊 完整品質摘要:${NC}"
echo "  ✅ ESLint: 通過 (無語法錯誤)"
echo "  ✅ Prettier: 通過 (程式碼格式正確)"
echo "  ✅ 建置: 通過 (專案可編譯)"
echo "  ✅ 驗證: 通過 (環境驗證完成)"
echo "  ✅ Jest 測試: 通過 (所有測試案例)"
echo "  ✅ 覆蓋率: 通過 (達到閾值要求)"

cd ..
exit 0