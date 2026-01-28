#!/bin/bash

# 测试运行脚本
# 用法: ./scripts/run-tests.sh [unit|e2e|integration|all]

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    print_info "检查依赖..."
    
    if [ ! -d "node_modules" ]; then
        print_warning "未找到 node_modules，正在安装依赖..."
        npm install
    fi
    
    if [ ! -f "tests/fixtures/test-image.png" ]; then
        print_warning "未找到测试图片，正在创建..."
        node tests/fixtures/create-test-image.js
    fi
}

# 运行单元测试
run_unit_tests() {
    print_info "运行单元测试..."
    npm run test:coverage
    
    if [ $? -eq 0 ]; then
        print_info "✅ 单元测试通过"
    else
        print_error "❌ 单元测试失败"
        exit 1
    fi
}

# 运行 E2E 测试
run_e2e_tests() {
    print_info "运行 E2E 测试..."
    
    # 检查 Playwright 是否已安装
    if ! npx playwright --version &> /dev/null; then
        print_warning "Playwright 未安装，正在安装..."
        npx playwright install --with-deps
    fi
    
    npm run test:e2e
    
    if [ $? -eq 0 ]; then
        print_info "✅ E2E 测试通过"
    else
        print_error "❌ E2E 测试失败"
        exit 1
    fi
}

# 运行集成测试
run_integration_tests() {
    print_info "运行 API 集成测试..."
    
    if [ -z "$DIFY_API_KEY" ]; then
        print_error "DIFY_API_KEY 环境变量未设置"
        print_info "请设置真实的 API 凭证："
        print_info "export DIFY_API_KEY=your-api-key"
        print_info "export DIFY_API_ENDPOINT=https://api.dify.ai/v1"
        exit 1
    fi
    
    RUN_INTEGRATION_TESTS=true npm run test:e2e -- api-integration.spec.ts
    
    if [ $? -eq 0 ]; then
        print_info "✅ 集成测试通过"
    else
        print_error "❌ 集成测试失败"
        exit 1
    fi
}

# 主函数
main() {
    local test_type=${1:-all}
    
    print_info "开始测试流程..."
    print_info "测试类型: $test_type"
    
    check_dependencies
    
    case $test_type in
        unit)
            run_unit_tests
            ;;
        e2e)
            run_e2e_tests
            ;;
        integration)
            run_integration_tests
            ;;
        all)
            run_unit_tests
            run_e2e_tests
            print_warning "跳过集成测试（需要真实 API 凭证）"
            print_info "要运行集成测试，请使用: ./scripts/run-tests.sh integration"
            ;;
        *)
            print_error "未知的测试类型: $test_type"
            print_info "用法: ./scripts/run-tests.sh [unit|e2e|integration|all]"
            exit 1
            ;;
    esac
    
    print_info "🎉 测试完成！"
}

# 运行主函数
main "$@"
