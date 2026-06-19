# Ball delivery presentation

Canonical rules for cricket ball chips (labels, types, legal delivery).

| File | Role |
|------|------|
| `core.js` | JS implementation |
| `fixtures.json` | Cross-platform test contract (JS + PHP) |
| `index.js` | Public exports |

**Full architecture (diagrams, API target, migration):** [`docs/BALL_DELIVERY_ARCHITECTURE.md`](../docs/BALL_DELIVERY_ARCHITECTURE.md)

**PHP mirror:** `api/app/Support/BallDelivery/BallDeliveryPresenter.php`

```bash
# Run contract tests
cd app && npm run test -- src/lib/ball-delivery/ball-delivery.test.js
cd api && ./vendor/bin/phpunit tests/Unit/BallDeliveryPresenterTest.php
```
