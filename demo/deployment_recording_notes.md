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
   # Expected: {"status":"ok","model":"gemini-2.5-flash-live-preview"}
   ```

3. **Live session** — Open the frontend URL in browser
   - Show the dashboard with seeded coaches loaded from Firestore
   - Start a session, share screen, speak a question
   - Show audio response from the deployed service

4. **Cloud Logging** — Navigate to Cloud Logging, filter by `resource.type="cloud_run_revision"`
   - Show `INFO` log entries from a live session (WebSocket connect, session start, disconnect)
   - The JSON structured log format should be visible

## Deploy Command

```bash
# From project root:
./infra/deploy.sh <your-project-id>
```

Expected output:
```text
==> Configuring Docker for Artifact Registry
==> Building backend image
==> Building frontend image
==> Pushing images
==> Terraform init + apply (infrastructure provisioning)
==> Backend:  https://expertlens-backend-<hash>-uc.a.run.app
==> Frontend: https://expertlens-frontend-<hash>-uc.a.run.app
==> Re-deploying with correct inter-service URLs
==> Deployment complete!
    Frontend: https://expertlens-frontend-<hash>-uc.a.run.app
    Backend:  https://expertlens-backend-<hash>-uc.a.run.app
    Health:   {"status":"ok","model":"gemini-2.5-flash-live-preview"}
```

## Submission Checklist

- [ ] Screen recording shows Cloud Run console (both services "Serving traffic")
- [ ] Health check curl confirms backend is live
- [ ] Full end-to-end session demonstrated over the deployed URL
- [ ] Cloud Logging shows structured logs from the session
- [ ] Recording is at least 2 minutes showing all of the above
