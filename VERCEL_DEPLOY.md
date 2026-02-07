# Vercel Deployment Guide for Aethernaut

## Current Status
✅ Frontend built successfully with static export  
✅ All files ready in `app/dist/` folder  
✅ Vercel configuration created (`vercel.json`)  
⏳ Deployment authorization needed

## Deployment Options

### Option 1: Manual Vercel CLI (Recommended)

Since the CLI auth is having issues in the automated environment, here's how to deploy manually:

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Navigate to app directory
cd ~/Aethernaut/app

# 3. Login to Vercel (this will open browser)
vercel login

# 4. Deploy (follow prompts)
vercel --prod

# Or deploy with prebuilt static files:
vercel deploy --prebuilt --prod
```

### Option 2: Vercel GitHub Integration (Easiest)

1. Go to https://vercel.com/new
2. Import your GitHub repository: `igwethesovereign/Aethernaut`
3. Configure:
   - **Root Directory:** `app`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_TREASURY_PROGRAM_ID=BovzoaAX7fivhW2RS9juginL3MQmT3x6tpFUwB7tjST7
   NEXT_PUBLIC_REGISTRY_PROGRAM_ID=2fs7z5NAojSAgJkg3yQz5EgjBXki9tFK6sGRHVMvQfpq
   NEXT_PUBLIC_MARKET_PROGRAM_ID=FT89ecUFydzZsT495pcGVdnPqm5ZBxLEagaYbBMYbLUX
   ```
5. Click Deploy

### Option 3: Vercel Dashboard with Token

If you have a Vercel token:

```bash
export VERCEL_TOKEN=your_token_here
cd ~/Aethernaut/app
npx vercel --token $VERCEL_TOKEN --prod
```

## Environment Variables

The following env vars are configured for the devnet deployment:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` |
| `NEXT_PUBLIC_TREASURY_PROGRAM_ID` | `BovzoaAX7fivhW2RS9juginL3MQmT3x6tpFUwB7tjST7` |
| `NEXT_PUBLIC_REGISTRY_PROGRAM_ID` | `2fs7z5NAojSAgJkg3yQz5EgjBXki9tFK6sGRHVMvQfpq` |
| `NEXT_PUBLIC_MARKET_PROGRAM_ID` | `FT89ecUFydzZsT495pcGVdnPqm5ZBxLEagaYbBMYbLUX` |

## Files Ready for Deployment

```
app/dist/
├── index.html          # Main entry point
├── 404.html            # Error page
├── _next/              # Next.js assets
│   └── static/
│       ├── chunks/     # JavaScript bundles
│       ├── css/        # Stylesheets
│       └── media/      # Fonts and images
└── ...
```

## Post-Deployment Checklist

Once deployed, verify:
- [ ] Website loads at the Vercel URL
- [ ] Wallet connection works (Phantom/Solflare)
- [ ] Devnet program addresses display correctly
- [ ] Dashboard cards render properly
- [ ] GitHub link works
- [ ] Forum link works

## Expected Vercel URL
After deployment, your site will be available at:
`https://aethernaut-[username].vercel.app`

Or set a custom domain in Vercel dashboard.

## Troubleshooting

### Issue: "No existing credentials found"
**Solution:** Run `vercel login` manually in your terminal

### Issue: Build fails
**Solution:** Check that `npm run build` works locally first

### Issue: Wallet connection not working
**Solution:** Verify environment variables are set in Vercel dashboard

### Issue: Static files not loading
**Solution:** Ensure `output: 'export'` is in `next.config.ts`

## Quick Deploy Command

```bash
cd ~/Aethernaut/app && vercel --prod
```

Then follow the interactive prompts to complete deployment.
