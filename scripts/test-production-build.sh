#!/bin/bash

# Production Build Test Script
# Tests production build and startup to catch issues before deployment
#
# Usage: ./scripts/test-production-build.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${MAGENTA}==========================================================${NC}"
echo -e "${MAGENTA}  PRODUCTION BUILD TEST SCRIPT${NC}"
echo -e "${MAGENTA}==========================================================${NC}\n"

# Step 1: Pre-build checks
echo -e "${BLUE}Step 1: Pre-build checks...${NC}"

if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ .env.local file not found${NC}"
    echo -e "${YELLOW}⚠️  Create .env.local with required environment variables${NC}"
    exit 1
fi
echo -e "${GREEN}✅ .env.local file exists${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${RED}❌ node_modules directory not found${NC}"
    echo -e "${YELLOW}⚠️  Run: npm install${NC}"
    exit 1
fi
echo -e "${GREEN}✅ node_modules directory exists${NC}"

# Check disk space
AVAILABLE_SPACE=$(df -h . | awk 'NR==2 {print $4}')
echo -e "${GREEN}✅ Available disk space: ${AVAILABLE_SPACE}${NC}"

# Step 2: Clean previous build
echo -e "\n${BLUE}Step 2: Cleaning previous build...${NC}"

if [ -d ".next" ]; then
    rm -rf .next
    echo -e "${GREEN}✅ Removed .next directory${NC}"
else
    echo -e "${CYAN}ℹ️  No previous build found${NC}"
fi

if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo -e "${GREEN}✅ Removed node_modules/.cache${NC}"
fi

# Step 3: Run production build
echo -e "\n${BLUE}Step 3: Running production build...${NC}"
echo -e "${CYAN}ℹ️  This may take a few minutes...${NC}\n"

BUILD_START=$(date +%s)

if npm run build; then
    BUILD_END=$(date +%s)
    BUILD_DURATION=$((BUILD_END - BUILD_START))
    echo -e "\n${GREEN}✅ Build completed successfully in ${BUILD_DURATION}s${NC}"
else
    echo -e "\n${RED}❌ Build failed${NC}"
    echo -e "${YELLOW}⚠️  Check the error output above${NC}"
    exit 1
fi

# Step 4: Analyze build output
echo -e "\n${BLUE}Step 4: Analyzing build output...${NC}"

if [ -d ".next" ]; then
    BUILD_SIZE=$(du -sh .next | awk '{print $1}')
    echo -e "${GREEN}✅ Build size: ${BUILD_SIZE}${NC}"

    # Check for large pages
    echo -e "${CYAN}ℹ️  Largest pages:${NC}"
    find .next -name "*.js" -type f -exec du -h {} + | sort -rh | head -n 5 | while read size file; do
        echo -e "  ${size} - ${file}"
    done
else
    echo -e "${RED}❌ .next directory not found after build${NC}"
    exit 1
fi

# Step 5: Check for build warnings
echo -e "\n${BLUE}Step 5: Checking build output for warnings...${NC}"

# This would need to be captured during the build step in a real implementation
echo -e "${CYAN}ℹ️  Check build output above for:${NC}"
echo -e "  - Bundle size warnings"
echo -e "  - Missing dependencies"
echo -e "  - TypeScript errors"
echo -e "  - ESLint warnings"

# Step 6: Test production server startup
echo -e "\n${BLUE}Step 6: Testing production server startup...${NC}"

# Check if port 3000 is available
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}❌ Port 3000 is already in use${NC}"
    echo -e "${YELLOW}⚠️  Stop the existing process or use a different port${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Port 3000 is available${NC}"

echo -e "${CYAN}ℹ️  Starting production server...${NC}"
echo -e "${YELLOW}⚠️  Press Ctrl+C to stop the server when done${NC}\n"

# Start server in background
npm run start &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Production server started (PID: ${SERVER_PID})${NC}"
else
    echo -e "${RED}❌ Production server failed to start${NC}"
    exit 1
fi

# Step 7: Basic health check
echo -e "\n${BLUE}Step 7: Running health check...${NC}"

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo -e "${YELLOW}⚠️  curl not found, skipping health check${NC}"
else
    sleep 2  # Give server time to fully initialize

    # Test homepage
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|302"; then
        echo -e "${GREEN}✅ Homepage is accessible${NC}"
    else
        echo -e "${RED}❌ Homepage returned error${NC}"
    fi

    # Test login page
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login | grep -q "200"; then
        echo -e "${GREEN}✅ Login page is accessible${NC}"
    else
        echo -e "${RED}❌ Login page returned error${NC}"
    fi
fi

# Step 8: Generate report
echo -e "\n${MAGENTA}==========================================================${NC}"
echo -e "${MAGENTA}  SUMMARY${NC}"
echo -e "${MAGENTA}==========================================================${NC}\n"

echo -e "${GREEN}✅ Pre-build checks passed${NC}"
echo -e "${GREEN}✅ Build completed in ${BUILD_DURATION}s${NC}"
echo -e "${GREEN}✅ Build size: ${BUILD_SIZE}${NC}"
echo -e "${GREEN}✅ Production server started${NC}"

echo -e "\n${CYAN}📋 Manual Testing Steps:${NC}"
echo -e "  1. Open http://localhost:3000 in your browser"
echo -e "  2. Check browser console for errors"
echo -e "  3. Test login functionality"
echo -e "  4. Navigate through different pages"
echo -e "  5. Check network tab for failed requests"
echo -e "  6. Test in incognito mode"

echo -e "\n${CYAN}🔧 Debug Tools:${NC}"
echo -e "  - Browser console: F12 or Cmd+Option+I"
echo -e "  - Network tab: Check for failed requests"
echo -e "  - React DevTools: Inspect component tree"

echo -e "\n${YELLOW}⚠️  Server is running on http://localhost:3000${NC}"
echo -e "${YELLOW}⚠️  Press Ctrl+C to stop the server${NC}\n"

# Wait for user to stop the server
wait $SERVER_PID

echo -e "\n${GREEN}✨ Test completed!${NC}\n"
