# Tailscale Integration untuk Mediator API

## Cara Setup

### 1. Generate Auth Key dari Tailscale

1. Buka [Tailscale Admin Console](https://login.tailscale.com/admin/settings/keys)
2. Klik **"Generate auth key..."**
3. Pilih opsi:
   - ✅ **Reusable** (opsional, untuk restart container)
   - ✅ **Ephemeral** (opsional, device dihapus saat container stop)
   - Set expiration sesuai kebutuhan
4. Copy auth key yang dihasilkan

### 2. Tambahkan Auth Key ke .env

Tambahkan baris berikut ke file `.env` Anda:

```env
# Tailscale Configuration
TS_AUTHKEY=tskey-auth-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Jalankan Docker Compose

```bash
# Build dan jalankan
docker-compose up -d --build

# Lihat logs Tailscale
docker logs mediator-tailscale
```

### 4. Verifikasi Koneksi

Setelah container berjalan, device **"mediator-api"** akan muncul di Tailscale Admin Console Anda.

Anda bisa akses API dari device lain di jaringan Tailscale menggunakan:

- `http://mediator-api:8080` (menggunakan MagicDNS)
- `http://100.x.x.x:8080` (menggunakan Tailscale IP)

## Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    Tailscale Network                        │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ desktop-     │    │ infinix-     │    │ mediator-api │  │
│  │ 28d9g5g      │    │ x6853        │    │ (Docker)     │  │
│  │ 100.88.149.  │    │ 100.109.82.  │    │ 100.x.x.x    │  │
│  │ 124          │    │ 62           │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                   │          │
│         └───────────────────┼───────────────────┘          │
│                             │                              │
│                    Encrypted P2P Connection                │
└─────────────────────────────────────────────────────────────┘
```

## Opsi Konfigurasi Tambahan

### Menggunakan Tailscale Serve (HTTPS otomatis)

File `tailscale/serve.json` sudah dikonfigurasi untuk:

- Expose API via HTTPS pada port 443
- Proxy ke API container di port 8080

Untuk mengaktifkan Tailscale Serve, uncomment `TS_SERVE_CONFIG` di docker-compose.yml.

### Subnet Router (Opsional)

Jika ingin mengakses service lain di network Docker dari Tailscale:

```yaml
environment:
  - TS_EXTRA_ARGS=--advertise-routes=172.18.0.0/16
```

### Tags untuk Access Control

Anda bisa menambahkan tags untuk ACL:

```yaml
environment:
  - TS_EXTRA_ARGS=--advertise-tags=tag:container,tag:api
```

## Troubleshooting

### Container tidak muncul di Tailscale

1. Cek logs: `docker logs mediator-tailscale`
2. Pastikan `TS_AUTHKEY` benar di `.env`
3. Pastikan auth key belum expired

### Tidak bisa akses API

1. Cek apakah API berjalan: `docker logs mediator-api`
2. Test dari dalam container: `docker exec mediator-tailscale curl http://localhost:8080`
3. Pastikan firewall tidak memblokir

### Reset Tailscale State

```bash
docker-compose down
docker volume rm mediator-restfull-api_tailscale-state
docker-compose up -d
```

## Windows Host Alternative

Jika Anda sudah menginstall Tailscale di Windows (desktop-28d9g5g), API sudah bisa diakses langsung tanpa container Tailscale:

```
http://100.88.149.124:8080
```

Rebuild container Anda:

docker compose down
docker compose up --build -d

Cek dari komputer lain / desktop (IP 100.88.149.124)
curl http://100.127.130.82:8080

🎁 (Opsional) Aktifkan tailscale serve Agar Bisa HTTPS

Jika Anda ingin mengakses https://mediator-api-3.tailnet-name.ts.net tanpa port, Anda bisa:

docker exec -it mediator-tailscale tailscale serve --bg --http 80 http://api:8080

Kemudian Anda bisa akses:

https://mediator-api-3.your-tailnet.ts.net

(Tentu domain \*.ts.net hanya aktif jika Anda enable DNS dan HTTPS dari admin console Tailscale.)
