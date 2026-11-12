# Installing the AutoShort MCP server in Cline

AutoShort is a remote MCP server (Streamable HTTP). Do not clone or build anything.

1. Add this entry to `cline_mcp_settings.json` (MCP Servers > Configure MCP Servers):

   ```json
   {
     "mcpServers": {
       "autoshort": {
         "type": "streamableHttp",
         "url": "https://autoshort.org/api/mcp",
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

   `type` must be `streamableHttp` (otherwise Cline assumes legacy SSE).
2. The server asks for sign-in on first use (OAuth). Approve the browser sign-in at autoshort.org.
   If OAuth is not available in your Cline build, the user creates an API key at
   https://autoshort.org/en/developers and you add
   `"headers": { "Authorization": "Bearer <their key>" }` to the entry. Never invent a key.
3. Verify by calling `autoshort_get_credit_balance`.

Rules: drafts are free; renders spend the user's credits. Call `autoshort_estimate_cost` (or
`autoshort_quote_video`) and get the user's explicit yes before any render. Never call
`autoshort_buy_credits` or `autoshort_setup_auto_recharge` unless the user asks for that exact
action. Videos use AI-generated images and voice.
