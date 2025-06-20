#!/bin/bash

# Get backend directory path
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$BACKEND_DIR/logs"

# Create logs directory
mkdir -p "$LOG_DIR"

# Create cron script
cat > "$BACKEND_DIR/cron-add-articles.sh" << 'EOF'
#!/bin/bash
# Auto-fetch articles every hour

BACKEND_DIR="$(dirname "$0")"
LOG_FILE="$BACKEND_DIR/logs/articles.log"

cd "$BACKEND_DIR"
echo "$(date): Starting article fetch..." >> "$LOG_FILE"
pnpm add_articles >> "$LOG_FILE" 2>&1
echo "$(date): Completed with exit code $?" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"
EOF

# Make executable
chmod +x "$BACKEND_DIR/cron-add-articles.sh"

# Add to crontab (runs every hour)
CRON_JOB="0 * * * * $BACKEND_DIR/cron-add-articles.sh"

# Install cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | sort -u | crontab -

echo "✅ Cron job installed: Articles will be fetched every hour"
echo "📝 Logs: $LOG_DIR/articles.log"
echo "🔍 Check status: crontab -l"