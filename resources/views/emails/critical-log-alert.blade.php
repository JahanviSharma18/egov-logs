<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>GovTrace Alert</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background-color: #0a0a0a;
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #e0e0e0;
            padding: 32px 16px;
        }
        .wrapper {
            max-width: 560px;
            margin: 0 auto;
            background: #111111;
            border: 1px solid #222222;
            border-radius: 16px;
            overflow: hidden;
        }
        /* Header */
        .header {
            background: linear-gradient(135deg, #1a0a00 0%, #0f0f0f 100%);
            border-bottom: 1px solid #2a1a00;
            padding: 28px 32px 24px;
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .logo-icon {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, #f97316, #c2410c);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            flex-shrink: 0;
        }
        .brand-name {
            font-size: 20px;
            font-weight: 700;
            color: #ffffff;
        }
        .brand-sub {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            margin-top: 2px;
        }
        /* Alert banner */
        .alert-banner {
            background-color: {{ $color }}18;
            border-left: 4px solid {{ $color }};
            padding: 16px 32px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .alert-icon { font-size: 20px; }
        .alert-title {
            font-size: 13px;
            font-weight: 700;
            color: {{ $color }};
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }
        .alert-sub {
            font-size: 11px;
            color: #888;
            margin-top: 2px;
        }
        /* Level badge */
        .level-badge {
            display: inline-block;
            background: {{ $color }}22;
            color: {{ $color }};
            border: 1px solid {{ $color }}44;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        /* Body */
        .body { padding: 28px 32px; }
        .message-box {
            background: #0e0e0e;
            border: 1px solid #1e1e1e;
            border-radius: 10px;
            padding: 16px 20px;
            margin-bottom: 24px;
        }
        .message-label {
            font-size: 10px;
            font-weight: 600;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 8px;
        }
        .message-text {
            font-size: 14px;
            color: #d0d0d0;
            line-height: 1.6;
            word-break: break-word;
        }
        /* Meta grid */
        .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 24px;
        }
        .meta-item {
            background: #0e0e0e;
            border: 1px solid #1e1e1e;
            border-radius: 8px;
            padding: 12px 14px;
        }
        .meta-label {
            font-size: 9px;
            font-weight: 600;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 5px;
        }
        .meta-value {
            font-size: 12px;
            color: #bbb;
            font-family: 'Courier New', monospace;
        }
        /* CTA */
        .cta-wrap { text-align: center; margin-bottom: 24px; }
        .cta-btn {
            display: inline-block;
            background: linear-gradient(135deg, #f97316, #c2410c);
            color: #ffffff;
            font-size: 13px;
            font-weight: 600;
            padding: 12px 28px;
            border-radius: 8px;
            text-decoration: none;
        }
        /* Footer */
        .footer {
            border-top: 1px solid #1a1a1a;
            padding: 16px 32px;
            text-align: center;
            font-size: 10px;
            color: #444;
        }
        .footer a { color: #f97316; text-decoration: none; }
    </style>
</head>
<body>
    <div class="wrapper">

        {{-- Header --}}
        <div class="header">
            <div class="logo-icon">📡</div>
            <div>
                <div class="brand-name">GovTrace</div>
                <div class="brand-sub">AICTE E-Gov Monitoring</div>
            </div>
        </div>

        {{-- Alert banner --}}
        <div class="alert-banner">
            <span class="alert-icon">🚨</span>
            <div>
                <div class="alert-title">{{ $level }} Alert Detected</div>
                <div class="alert-sub">
                    Triggered at {{ $log->created_at->format('d M Y, H:i:s T') }}
                </div>
            </div>
            <div style="margin-left:auto;">
                <span class="level-badge">{{ $level }}</span>
            </div>
        </div>

        {{-- Body --}}
        <div class="body">

            {{-- Log message --}}
            <div class="message-box">
                <div class="message-label">Log Message</div>
                <div class="message-text">{{ $log->message }}</div>
            </div>

            {{-- Meta grid --}}
            <div class="meta-grid">
                <div class="meta-item">
                    <div class="meta-label">Source</div>
                    <div class="meta-value">{{ $log->source ?? '—' }}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">IP Address</div>
                    <div class="meta-value">{{ $log->ip_address ?? '—' }}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">HTTP Method</div>
                    <div class="meta-value">{{ $log->method ?? '—' }}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Log ID</div>
                    <div class="meta-value">#{{ $log->id }}</div>
                </div>
            </div>

            @if($log->url)
            <div class="message-box" style="margin-bottom: 24px;">
                <div class="message-label">URL</div>
                <div class="message-text" style="font-family: 'Courier New', monospace; font-size: 12px; color: #999;">
                    {{ $log->url }}
                </div>
            </div>
            @endif

            {{-- CTA --}}
            <div class="cta-wrap">
                <a href="{{ url('/logs') }}" class="cta-btn">
                    View in GovTrace Dashboard →
                </a>
            </div>

        </div>

        {{-- Footer --}}
        <div class="footer">
            This is an automated alert from
            <a href="{{ url('/') }}">GovTrace</a>.
            You received this because a notification rule matched this log level.<br/>
            Log entry #{{ $log->id }} · {{ $log->created_at->format('Y-m-d H:i:s') }} UTC
        </div>

    </div>
</body>
</html>
