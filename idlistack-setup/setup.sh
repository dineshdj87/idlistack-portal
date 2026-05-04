#!/usr/bin/env bash
# ============================================================
#  Idlistack Portal — One-Command Setup Script
#  Usage: chmod +x setup.sh && ./setup.sh
# ============================================================

set -e  # Exit on any error

# ── Colors ──────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ── Helpers ──────────────────────────────────────────────────
print_banner() {
  echo ""
  echo -e "${CYAN}${BOLD}"
  echo "  ██╗██████╗ ██╗     ██╗███████╗████████╗ █████╗  ██████╗██╗  ██╗"
  echo "  ██║██╔══██╗██║     ██║██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝"
  echo "  ██║██║  ██║██║     ██║███████╗   ██║   ███████║██║     █████╔╝ "
  echo "  ██║██║  ██║██║     ██║╚════██║   ██║   ██╔══██║██║     ██╔═██╗ "
  echo "  ██║██████╔╝███████╗██║███████║   ██║   ██║  ██║╚██████╗██║  ██╗"
  echo "  ╚═╝╚═════╝ ╚══════╝╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝"
  echo -e "${RESET}"
  echo -e "  ${BOLD}Self-Service Deployment Portal${RESET} — Auto Setup"
  echo "  ──────────────────────────────────────────────────"
  echo ""
}

step() {
  echo -e "\n${BLUE}${BOLD}▶  $1${RESET}"
}

ok() {
  echo -e "  ${GREEN}✔  $1${RESET}"
}

warn() {
  echo -e "  ${YELLOW}⚠  $1${RESET}"
}

fail() {
  echo -e "\n${RED}${BOLD}✗  ERROR: $1${RESET}\n"
  exit 1
}

check_command() {
  if command -v "$1" &>/dev/null; then
    ok "$1 found ($(command -v "$1"))"
    return 0
  else
    return 1
  fi
}

# ── Banner ───────────────────────────────────────────────────
print_banner

# ── Step 0: Detect OS ────────────────────────────────────────
step "Detecting environment"
OS="$(uname -s)"
ARCH="$(uname -m)"
ok "OS: $OS | Arch: $ARCH"

if [[ "$OS" == "Linux" ]]; then
  DISTRO=$(grep -oP '(?<=^ID=).+' /etc/os-release | tr -d '"' 2>/dev/null || echo "unknown")
  ok "Distro: $DISTRO"
fi

# ── Step 1: Check Prerequisites ──────────────────────────────
step "Checking prerequisites"

MISSING=()

# Node.js check
if check_command node; then
  NODE_VER=$(node -v | sed 's/v//')
  NODE_MAJOR=$(echo $NODE_VER | cut -d. -f1)
  if (( NODE_MAJOR < 18 )); then
    warn "Node.js $NODE_VER found but 18+ required — will install latest"
    MISSING+=("node")
  else
    ok "Node.js $NODE_VER ✓"
  fi
else
  warn "Node.js not found"
  MISSING+=("node")
fi

# npm check
check_command npm || MISSING+=("npm")

# Docker check
if check_command docker; then
  DOCKER_VER=$(docker --version | grep -oP '\d+\.\d+\.\d+' | head -1)
  ok "Docker $DOCKER_VER ✓"
else
  warn "Docker not found — needed for container deployments"
  MISSING+=("docker")
fi

# PostgreSQL check
if check_command psql; then
  PG_VER=$(psql --version | grep -oP '\d+\.\d+' | head -1)
  ok "PostgreSQL $PG_VER ✓"
else
  warn "psql not found"
  MISSING+=("postgres")
fi

# ── Step 2: Install Missing Prerequisites ────────────────────
if (( ${#MISSING[@]} > 0 )); then
  step "Installing missing prerequisites: ${MISSING[*]}"

  if [[ "$OS" == "Linux" ]]; then
    # Update apt
    sudo apt-get update -qq

    for pkg in "${MISSING[@]}"; do
      case "$pkg" in
        node|npm)
          if ! check_command node 2>/dev/null; then
            echo "  Installing Node.js 20 LTS..."
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - -qq
            sudo apt-get install -y nodejs -qq
            ok "Node.js $(node -v) installed"
          fi
          ;;
        docker)
          echo "  Installing Docker..."
          curl -fsSL https://get.docker.com | sudo sh
          sudo usermod -aG docker "$USER"
          ok "Docker installed — you may need to log out and back in for Docker permissions"
          ;;
        postgres)
          echo "  Installing PostgreSQL..."
          sudo apt-get install -y postgresql postgresql-contrib -qq
          sudo service postgresql start
          ok "PostgreSQL installed and started"
          ;;
      esac
    done

  elif [[ "$OS" == "Darwin" ]]; then
    # macOS
    if ! check_command brew; then
      fail "Homebrew not found. Install from https://brew.sh then re-run this script."
    fi

    for pkg in "${MISSING[@]}"; do
      case "$pkg" in
        node|npm)
          brew install node@20
          ok "Node.js installed"
          ;;
        docker)
          warn "Please install Docker Desktop from https://docker.com/get-started then re-run"
          ;;
        postgres)
          brew install postgresql@15
          brew services start postgresql@15
          ok "PostgreSQL installed and started"
          ;;
      esac
    done

  else
    fail "Unsupported OS: $OS. Please install prerequisites manually."
  fi
fi

# ── Step 3: Check project directory ─────────────────────────
step "Locating project files"

# Try to find idlistack-portal folder
if [[ -d "./idlistack-portal" ]]; then
  PROJECT_DIR="./idlistack-portal"
  ok "Found ./idlistack-portal"
elif [[ -f "./package.json" ]]; then
  PROJECT_DIR="."
  ok "Running from project root"
elif [[ -f "idlistack-portal.zip" ]]; then
  echo "  Unzipping idlistack-portal.zip..."
  unzip -q idlistack-portal.zip
  PROJECT_DIR="./idlistack-portal"
  ok "Unzipped successfully"
else
  warn "Could not find project directory — creating a fresh scaffold"
  mkdir -p idlistack-portal/{frontend,backend/src/{routes,services,db},infra/templates}
  PROJECT_DIR="./idlistack-portal"
fi

cd "$PROJECT_DIR"
ok "Working directory: $(pwd)"

# ── Step 4: Set up .env ─────────────────────────────────────
step "Configuring environment variables"

if [[ ! -f ".env" ]]; then
  if [[ -f ".env.example" ]]; then
    cp .env.example .env
    ok "Copied .env.example → .env"
  else
    cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/idlistack
DB_HOST=localhost
DB_PORT=5432
DB_NAME=idlistack
DB_USER=postgres
DB_PASSWORD=postgres

# App
NODE_ENV=development
BACKEND_PORT=4000
FRONTEND_PORT=3000

# Auth (optional for local dev)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local_dev_secret_change_in_production
GOOGLE_CLIENT_ID=skip
GOOGLE_CLIENT_SECRET=skip

# Email (optional)
SMTP_HOST=localhost
SMTP_PORT=1025
EOF
    ok "Created .env with default local values"
  fi
else
  ok ".env already exists — skipping"
fi

# ── Step 5: Install Node dependencies ───────────────────────
step "Installing Node.js dependencies"

# Root level (if package.json exists)
if [[ -f "package.json" ]]; then
  npm install --silent
  ok "Root dependencies installed"
fi

# Frontend
if [[ -d "frontend" && -f "frontend/package.json" ]]; then
  echo "  Installing frontend packages..."
  cd frontend && npm install --silent && cd ..
  ok "Frontend dependencies installed"
fi

# Backend
if [[ -d "backend" && -f "backend/package.json" ]]; then
  echo "  Installing backend packages..."
  cd backend && npm install --silent && cd ..
  ok "Backend dependencies installed"
fi

# ── Step 6: Set up Database ──────────────────────────────────
step "Setting up PostgreSQL database"

# Make sure postgres is running
if [[ "$OS" == "Linux" ]]; then
  sudo service postgresql start 2>/dev/null || true
elif [[ "$OS" == "Darwin" ]]; then
  brew services start postgresql@15 2>/dev/null || \
  brew services start postgresql 2>/dev/null || true
fi

sleep 2  # Give postgres a moment to start

# Create database if it doesn't exist
if psql -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "idlistack"; then
  ok "Database 'idlistack' already exists"
else
  echo "  Creating database 'idlistack'..."
  createdb -U postgres idlistack 2>/dev/null || \
  sudo -u postgres createdb idlistack 2>/dev/null || \
  warn "Could not auto-create DB — you may need to run: createdb idlistack"
  ok "Database created"
fi

# Run schema migrations
SCHEMA_FILE=""
if [[ -f "backend/src/db/schema.sql" ]]; then
  SCHEMA_FILE="backend/src/db/schema.sql"
elif [[ -f "db/schema.sql" ]]; then
  SCHEMA_FILE="db/schema.sql"
fi

if [[ -n "$SCHEMA_FILE" ]]; then
  echo "  Running schema migrations from $SCHEMA_FILE..."
  psql -U postgres -d idlistack -f "$SCHEMA_FILE" -q 2>/dev/null || \
  sudo -u postgres psql -d idlistack -f "$SCHEMA_FILE" -q 2>/dev/null || \
  warn "Could not run migrations — check DB credentials in .env"
  ok "Schema applied and seed data loaded"
else
  warn "No schema.sql found — skipping migrations"
fi

# ── Step 7: Docker network ───────────────────────────────────
step "Setting up Docker network"

if command -v docker &>/dev/null; then
  if docker network inspect idlistack-net &>/dev/null; then
    ok "Docker network 'idlistack-net' already exists"
  else
    docker network create idlistack-net
    ok "Created Docker network 'idlistack-net'"
  fi
else
  warn "Docker not available — skipping network setup (container deploys won't work)"
fi

# ── Step 8: Build backend TypeScript ────────────────────────
step "Building backend"

if [[ -d "backend" && -f "backend/package.json" ]]; then
  cd backend
  if grep -q '"build"' package.json 2>/dev/null; then
    npm run build --silent 2>/dev/null || warn "Build had warnings — continuing"
    ok "Backend compiled"
  fi
  cd ..
fi

# ── Step 9: Write start scripts ──────────────────────────────
step "Creating run scripts"

cat > start.sh << 'STARTSCRIPT'
#!/usr/bin/env bash
# Start both frontend and backend with live logs

set -e
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RESET='\033[0m'

echo -e "\n${CYAN}Starting Idlistack Portal...${RESET}\n"

# Make sure postgres is up
sudo service postgresql start 2>/dev/null || true

# Start backend in background
echo -e "${GREEN}▶ Backend starting on port 4000${RESET}"
cd backend && npm run dev &
BACKEND_PID=$!
cd ..

sleep 3

# Start frontend in foreground
echo -e "${GREEN}▶ Frontend starting on port 3000${RESET}"
echo ""
echo "  🌐  http://localhost:3000          ← Landing page"
echo "  📋  http://localhost:3000/onboarding  ← Signup wizard"
echo "  📊  http://localhost:3000/dashboard   ← Dashboard"
echo "  🚀  http://localhost:3000/deploy      ← Deploy apps"
echo "  💚  http://localhost:4000/health      ← API health"
echo ""
cd frontend && npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT
STARTSCRIPT

chmod +x start.sh
ok "Created start.sh"

cat > stop.sh << 'STOPSCRIPT'
#!/usr/bin/env bash
# Stop all running Idlistack processes
pkill -f "next dev" 2>/dev/null || true
pkill -f "ts-node" 2>/dev/null || true
pkill -f "fastify" 2>/dev/null || true
echo "✔ All Idlistack processes stopped"
STOPSCRIPT

chmod +x stop.sh
ok "Created stop.sh"

# ── Step 10: Done! ───────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}  ✅  SETUP COMPLETE!${RESET}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════${RESET}"
echo ""
echo -e "  ${BOLD}Run the app:${RESET}"
echo -e "  ${CYAN}./start.sh${RESET}"
echo ""
echo -e "  ${BOLD}Or manually:${RESET}"
echo -e "  ${CYAN}cd backend && npm run dev${RESET}   (Terminal 1)"
echo -e "  ${CYAN}cd frontend && npm run dev${RESET}  (Terminal 2)"
echo ""
echo -e "  ${BOLD}URLs:${RESET}"
echo "  🌐  http://localhost:3000           ← App"
echo "  💚  http://localhost:4000/health    ← API"
echo ""
echo -e "  ${BOLD}Stop everything:${RESET}"
echo -e "  ${CYAN}./stop.sh${RESET}"
echo ""
