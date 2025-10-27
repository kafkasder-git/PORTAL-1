#!/bin/bash

# Appwrite MCP Server Setup Script
# This script adds Appwrite MCP server to Claude Code

echo "🚀 Setting up Appwrite MCP Server..."

# MCP server configuration
claude mcp add-json appwrite-api '{
  "command": "uvx",
  "args": ["mcp-server-appwrite", "--users"],
  "env": {
    "APPWRITE_PROJECT_ID": "68fee9220016ba9acb1b",
    "APPWRITE_API_KEY": "standard_15c951817a62a9bed5e62ee9fd23e9cd3e063f2a62638aa07f9ca7df31172742bf56949444d6ce1b1fb7ce73d2db7e3227e65ba0141faed6534f8329aec21e776e2eceb40dc6f1aeeb44a4e8244d3faf9c59149e756ad55f76775fb735210c8eaca92916103a741e6f161a87efc8857b06c8fe29ae40dd401e09781913d298c1",
    "APPWRITE_ENDPOINT": "http://selam-appwrite-8154f2-38-242-208-4.traefik.me/v1"
  }
}'

echo "✅ Appwrite MCP Server setup complete!"
echo "📝 You can now use MCP commands to manage your Appwrite database"
echo ""
echo "Next steps:"
echo "  1. Restart Claude Code to load the MCP server"
echo "  2. Use MCP commands to create database and collections"
echo "  3. Continue with Sprint 2 (Authentication)"
