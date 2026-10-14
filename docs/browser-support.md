# Browser Support

The project targets the latest stable Chrome version required by the subject and the following additional browsers:

| Browser | Status | Notes |
| --- | --- | --- |
| Firefox | Supported target | Uses standard React/Next.js, CSS Grid/Flexbox, HTTPS, Fetch/XHR and Socket.IO transports |
| Safari | Supported target | Layout avoids browser-specific APIs; avatar upload uses FileReader and Canvas APIs available in Safari |
| Edge | Supported target | Chromium compatibility is expected to match Chrome for the application stack |

## Manual Verification Checklist

Run this checklist before the final defense on Chrome plus at least two additional browsers:

- Register and log in.
- Create and update a profile.
- Upload/crop an avatar.
- Enable, confirm and disable 2FA.
- Browse the match deck, reject a profile, refresh, and verify the deck state is stable.
- Match two users and exchange messages in two browser windows.
- Create a mutual match, then verify it appears in the messages/contact list.
- Delete a match and verify it disappears from active contacts.
- View a matched user's profile and online status.
- Call `/api/public/docs` and `/api/public/users` with `x-api-key`.
- Confirm no browser console errors appear during the main flows.

## Known Limitations

- The local TLS certificate is self-signed, so browsers may ask the evaluator to accept the local certificate warning.
- The public API default key is only for local development; set `PUBLIC_API_KEY` in `.env` before evaluation.
