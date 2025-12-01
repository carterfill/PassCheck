# Hướng dẫn thiết lập Fly.io Volume để giữ dữ liệu

## Vấn đề
Sau mỗi lần deploy, dữ liệu visitor (số người dùng) bị reset về 0 vì Fly.io reset filesystem của container.

## Giải pháp
Sử dụng **Fly.io Volumes** để persist dữ liệu giữa các lần deploy.

## Các bước thiết lập

### 1. Tạo Volume trên Fly.io

```bash
# Tạo volume với tên passcheck_data trong region sin (Singapore)
fly volumes create passcheck_data --region sin --size 1
```

**Lưu ý:** 
- Volume size tối thiểu là 1GB (miễn phí với plan free)
- Phải tạo volume trong cùng region với app của bạn (sin = Singapore)

### 2. Khôi phục dữ liệu 200 người dùng

Sau khi tạo volume, bạn cần upload file `visitor-stats.json` với 200 users lên volume:

**Cách 1: SSH vào container và tạo file**
```bash
# SSH vào container
fly ssh console

# Tạo file với 200 users
cat > /app/data/visitor-stats.json << 'EOF'
{
  "totalVisits": 200,
  "todayVisits": 4,
  "lastVisitDate": "Sun Dec 01 2025",
  "uniqueVisitors": []
}
EOF

# Exit
exit
```

**Cách 2: Deploy app với file đã cập nhật**
File `visitor-stats.json` đã được cập nhật với 200 users. Khi deploy lần đầu, nó sẽ được copy vào volume.

### 3. Deploy app

```bash
# Deploy app với volume configuration
fly deploy
```

### 4. Kiểm tra volume đã được mount

```bash
# Kiểm tra danh sách volumes
fly volumes list

# SSH vào container và kiểm tra
fly ssh console

# Kiểm tra data directory
ls -la /app/data
cat /app/data/visitor-stats.json
```

## Kiểm tra hoạt động

Sau khi setup xong:

1. Truy cập app của bạn
2. Kiểm tra số lượng visitors
3. Deploy lại app: `fly deploy`
4. Kiểm tra lại số lượng visitors - **dữ liệu không bị mất**

## Lưu ý quan trọng

1. **Volume là persistent**: Dữ liệu sẽ được giữ lại ngay cả khi deploy hoặc restart app
2. **Backup định kỳ**: Nên backup file `visitor-stats.json` định kỳ:
   ```bash
   fly ssh console -C "cat /app/data/visitor-stats.json" > visitor-stats-backup.json
   ```
3. **Volume chỉ hoạt động trong 1 machine**: Nếu bạn scale lên nhiều machines, cần dùng database thay vì file

## Troubleshooting

### Volume không được mount
```bash
# Xóa volume cũ
fly volumes destroy passcheck_data

# Tạo lại
fly volumes create passcheck_data --region sin --size 1

# Deploy lại
fly deploy
```

### Dữ liệu vẫn bị reset
Kiểm tra xem volume có đang được mount không:
```bash
fly ssh console
df -h
# Phải thấy /app/data được mount
```

## Alternative: Sử dụng Database

Nếu bạn muốn giải pháp robust hơn, có thể sử dụng:
- **Upstash Redis** (free tier available)
- **Fly.io Postgres** (free tier available)
- **MongoDB Atlas** (free tier available)

Điều này sẽ giúp:
- Dữ liệu an toàn hơn
- Có thể scale lên nhiều machines
- Có backup tự động
