# Deployment Proof Recording Notes

The hackathon requires evidence of a working Cloud Run deployment.

## What to Capture

Record a screen capture showing:

1. **Cloud Run console** — Navigate to console.cloud.google.com → Cloud Run
   - Show both services: `expertlens-backend` and `expertlens-frontend`
   - Show each service's status as "Serving traffic" (green checkmark)
   - Show the service URLs

2. **Health check** — In terminal, run:
   ```bash
   curl https://<backend-url>/health
   # Expected: {"status":"ok","model":"gemini-2.5-flash-native-audio-latest"}
   ```

3. **Live session** — Open the frontend URL in browser
   - Show the dashboard with seeded coaches loaded from Firestore
   - Start a session, share screen, speak a question
   - Show audio response from the deployed service

4. **Cloud Logging** — Navigate to Cloud Logging, filter by `resource.type="cloud_run_revision"`
   - Show `INFO` log entries from a live session (WebSocket connect, session start, disconnect)
   - The JSON structured log format should be visible

## Deployment

Deployment is fully automated. Every push to `main` triggers a Cloud Build pipeline (`deploy-on-main-push`) that builds both Docker images, pushes to Artifact Registry, deploys to Cloud Run, and updates CORS configuration — no manual steps needed.

For the **first deploy** (infrastructure provisioning only), run:

```bash
# From project root:
./infra/deploy.sh <your-project-id>
```

After the first deploy, all subsequent deployments happen automatically on merge to `main`.

## Submission Checklist

- [ ] Screen recording shows Cloud Run console (both services "Serving traffic")
- [ ] Health check curl confirms backend is live
- [ ] Full end-to-end session demonstrated over the deployed URL
- [ ] Cloud Logging shows structured logs from the session
- [ ] Recording is at least 2 minutes showing all of the above
