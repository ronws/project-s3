/**
 * Health Check Routes
 * Liveness, readiness, and general health endpoints
 */

import { Router } from 'express';
import { ResponseFormatter } from '../core/responses.js';
import { config } from '../../config/core.js';

const router = Router();

// Track server uptime
const startTime = Date.now();

/**
 * GET /health
 * Basic health status endpoint
 */
router.get('/health', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const response = ResponseFormatter.success(
    {
      status: 'healthy',
      uptime: uptime,
      version: '1.0.0',
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
    },
    'Health check passed',
    req.state?.requestId
  );
  res.json(response);
});

/**
 * GET /live
 * Kubernetes liveness probe
 */
router.get('/live', (req, res) => {
  const response = ResponseFormatter.success({ alive: true }, 'Liveness check passed', req.state?.requestId);
  res.json(response);
});

/**
 * GET /ready
 * Kubernetes readiness probe with dependency checks
 */
router.get('/ready', async (req, res) => {
  const checks = {
    config: !!config.geminiApiKey,
    environment: config.nodeEnv !== 'production' || process.env.NODE_ENV === 'production',
  };

  const ready = Object.values(checks).every(v => v);

  const response = ResponseFormatter.success(
    {
      ready: ready,
      checks: checks,
      timestamp: new Date().toISOString(),
    },
    ready ? 'Readiness check passed' : 'Readiness check failed',
    req.state?.requestId
  );

  res.status(ready ? 200 : 503).json(response);
});

/**
 * GET /metrics
 * Prometheus-compatible metrics endpoint (placeholder)
 */
router.get('/metrics', (req, res) => {
  // TODO: Implement Prometheus metrics collection
  const metrics = `# HELP gemini_api_requests_total Total number of requests
# TYPE gemini_api_requests_total counter
gemini_api_requests_total 0

# HELP gemini_api_errors_total Total number of errors
# TYPE gemini_api_errors_total counter
gemini_api_errors_total 0

# HELP gemini_api_request_duration_ms Request duration in milliseconds
# TYPE gemini_api_request_duration_ms histogram
gemini_api_request_duration_ms_bucket{le="100"} 0
`;
  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(metrics);
});

export default router;
