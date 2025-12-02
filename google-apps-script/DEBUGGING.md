# Debugging Guide for Google Apps Script

## How to Debug Grok API Errors

### Method 1: View Execution Logs (Recommended)

1. **In Apps Script Editor:**
   - Go to [script.google.com](https://script.google.com)
   - Open your project
   - Click **View** → **Execution log** (or press `Ctrl+Shift+L` / `Cmd+Shift+L`)

2. **Trigger the error:**
   - Use the web app interface to send a message
   - Or run the `testGrokAPI()` function directly

3. **Check the logs:**
   - You'll see detailed logs including:
     - Request URL
     - Response code
     - Response text (first 500 chars)
     - Parsed error messages
     - Stack traces

### Method 2: Run Test Function Directly

1. **In Apps Script Editor:**
   - Select `testGrokAPI` from the function dropdown (top toolbar)
   - Click **Run** (▶️)
   - Authorize if prompted

2. **View results:**
   - Check **View** → **Execution log**
   - You'll see step-by-step what's happening

### Method 3: Check Script Properties

Verify your API key is set correctly:

1. **In Apps Script Editor:**
   - Click **Project Settings** (gear icon)
   - Scroll to **Script Properties**
   - Verify `GROK_KEY` is set and not `your-grok-api-key-here`

2. **Or run this in the editor:**
   ```javascript
   function checkProperties() {
     const props = PropertiesService.getScriptProperties();
     const grokKey = props.getProperty('GROK_KEY');
     Logger.log('GROK_KEY exists: ' + (grokKey ? 'Yes' : 'No'));
     Logger.log('GROK_KEY length: ' + (grokKey ? grokKey.length : 0));
     Logger.log('GROK_KEY starts with: ' + (grokKey ? grokKey.substring(0, 10) + '...' : 'N/A'));
   }
   ```

### Common Issues & Solutions

#### Issue: "GROK_KEY not configured"
**Solution:**
- Run `setupProperties()` function
- Update the `GROK_KEY` value with your actual API key
- Make sure you're using the correct x.ai API key

#### Issue: "HTTP 401: Unauthorized"
**Solution:**
- API key is invalid or expired
- Check that you copied the full API key
- Verify the key is active at https://x.ai/api

#### Issue: "HTTP 429: Too Many Requests"
**Solution:**
- You've hit rate limits
- Wait a few minutes and try again
- Check your x.ai API usage limits

#### Issue: "HTTP 400: Bad Request"
**Solution:**
- Check the execution log for the full error message
- Verify the request payload structure
- Check if the model name `grok-3` is correct

#### Issue: "Unknown error" or "Invalid JSON response"
**Solution:**
- Check execution logs for the raw response
- The API might be returning HTML error page instead of JSON
- Verify your API key has the correct permissions

### Viewing Logs in Real-Time

1. **Open Execution Log:**
   - View → Execution log
   - Keep it open while testing

2. **Clear old logs:**
   - Click the trash icon to clear previous logs

3. **Filter logs:**
   - Use the search box to filter by function name

### Debugging Tips

1. **Add more logging:**
   - The `callGrok()` function now logs:
     - Request URL
     - Message count
     - Response code
     - Response text (first 500 chars)
     - Parsed errors

2. **Test incrementally:**
   - First test: `testGrokAPI()` - verifies API key and basic connection
   - Second test: Use web app with a simple message
   - Check logs after each step

3. **Check API key format:**
   - Should start with `xai-` or similar
   - Should be 40+ characters
   - No extra spaces or newlines

4. **Verify API endpoint:**
   - Current: `https://api.x.ai/v1/chat/completions`
   - Model: `grok-3` (updated from deprecated `grok-beta`)
   - If x.ai changed their API, update these in `callGrok()`

### Getting Help

If you're still stuck, check the logs for:
1. **Response Code** - Tells you the HTTP status
2. **Response Text** - Shows the actual error from Grok API
3. **Error Stack** - Shows where in the code it failed

Copy the relevant log entries when asking for help!

