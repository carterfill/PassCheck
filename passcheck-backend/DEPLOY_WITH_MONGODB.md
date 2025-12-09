# 🚀 Hướng dẫn Deploy với MongoDB (Không lo mất dữ liệu)

## ✅ Đã hoàn thành

Backend của bạn đã được cập nhật để sử dụng MongoDB thay vì file storage. Dữ liệu giờ sẽ được lưu persistent trong database và **không bị mất** khi deploy trên bất kỳ platform nào.

## 📋 Các thay đổi

### 1. Dependencies mới
- ✅ `mongoose` - MongoDB ODM
- ✅ `@types/mongoose` - TypeScript types

### 2. Files mới
- ✅ `src/models/VisitorStats.model.ts` - MongoDB schema
- ✅ `src/config/database.ts` - Database connection
- ✅ `src/services/visitor.service.ts` - Business logic
- ✅ `src/scripts/restore-stats.ts` - Script khôi phục 200 users
- ✅ `.env.example` - Environment variables template
- ✅ `MONGODB_SETUP.md` - Hướng dẫn chi tiết MongoDB Atlas

### 3. Files đã cập nhật
- ✅ `src/controllers/visitor.controller.ts` - Sử dụng MongoDB service
- ✅ `src/server.ts` - Kết nối MongoDB khi start
- ✅ `package.json` - Thêm script `restore-stats`

## 🎯 Quick Start

### Bước 1: Setup MongoDB Atlas (5 phút)

1. Tạo tài khoản miễn phí tại: https://www.mongodb.com/cloud/atlas/register
2. Tạo cluster (chọn M0 FREE tier)
3. Tạo database user và whitelist IP
4. Lấy connection string

**Xem hướng dẫn chi tiết trong file: `MONGODB_SETUP.md`**

### Bước 2: Cấu hình Backend

#### Local Development

```bash
# 1. Tạo file .env
cp .env.example .env

# 2. Sửa file .env và thêm MongoDB URI
MONGODB_URI=SET_YOUR_OWN_MONGODB_ATLAS_URI

# 3. Test local
npm run dev
```

#### Deploy trên Fly.io

```bash
# 1. Set MongoDB URI secret
fly secrets set MONGODB_URI="SET_YOUR_OWN_MONGODB_ATLAS_URI"

# 2. Deploy
fly deploy

# 3. Khôi phục 200 users (chạy local với .env)
npm run restore-stats
```

#### Deploy trên Railway

```bash
# 1. Push code lên GitHub
git add .
git commit -m "feat: add MongoDB for visitor stats"
git push

# 2. Trong Railway Dashboard:
#    - Variables → Add MONGODB_URI
#    - Paste connection string
#    - Redeploy

# 3. Khôi phục 200 users (chạy local với .env)
npm run restore-stats
```

### Bước 3: Khôi phục dữ liệu 200 users

**Cách 1: Sử dụng script (Khuyên dùng)**

```bash
# Đảm bảo file .env có MONGODB_URI
npm run restore-stats
```

Output:
```
🔄 Connecting to MongoDB...
✅ Connected to MongoDB
🗑️  Deleted 0 existing documents
✅ Successfully restored visitor stats:
   - Total Visits: 200
   - Today Visits: 4
   - Last Visit Date: Sun Dec 01 2025
   - Database ID: 674c8f9e5a3b2c1d4e6f8a9b
👋 MongoDB connection closed
```

**Cách 2: Sử dụng MongoDB Atlas UI**

1. Vào MongoDB Atlas → Database → Browse Collections
2. Chọn database `passcheck` → collection `visitorstats`
3. Click "Insert Document"
4. Paste JSON:
```json
{
  "totalVisits": 200,
  "todayVisits": 4,
  "lastVisitDate": "Sun Dec 01 2025",
  "uniqueVisitors": []
}
```

**Cách 3: Sử dụng API**

```bash
# Sau khi deploy, gọi API track với nhiều unique visitors
for i in {1..200}; do
  curl -X POST https://your-api.fly.dev/api/visitor/track \
    -H "Content-Type: application/json" \
    -d "{\"visitorId\": \"user-$i\"}"
done
```

### Bước 4: Kiểm tra

```bash
# Test API
curl https://your-api.fly.dev/api/visitor/stats

# Expected response:
{
  "totalVisits": 200,
  "todayVisits": 4,
  "uniqueVisitors": 0,
  "lastVisitDate": "Sun Dec 01 2025",
  "usingDatabase": true  # ✅ Quan trọng!
}
```

Nếu `"usingDatabase": true` → ✅ Đang dùng MongoDB, dữ liệu an toàn!

## 🔄 Workflow Deploy mới

```bash
# 1. Cập nhật code
git add .
git commit -m "feat: update feature"

# 2. Deploy (không cần lo setup volume)
fly deploy

# 3. Dữ liệu vẫn còn nguyên! 🎉
# Không cần làm gì thêm
```

## 🛠️ Troubleshooting

### Lỗi: App chạy nhưng `"usingDatabase": false`

```bash
# Kiểm tra MongoDB URI có đúng không
fly secrets list

# Nếu chưa có, set lại:
fly secrets set MONGODB_URI="your-connection-string"

# Xem logs để debug
fly logs
```

### Lỗi: "MongoServerError: bad auth"

```bash
# Kiểm tra username/password trong connection string
# Nếu password có ký tự đặc biệt, encode nó:
# Ví dụ: p@ssw0rd → p%40ssw0rd
```

### Lỗi: "Connection timeout"

```bash
# 1. Kiểm tra IP whitelist trong MongoDB Atlas
#    - Network Access → Add IP: 0.0.0.0/0

# 2. Đợi cluster khởi động (mất 2-3 phút lúc đầu)
```

### Fallback Mode

Nếu MongoDB không connect được, app vẫn chạy bình thường với **in-memory storage**:
- ⚠️ Dữ liệu sẽ mất khi restart
- ⚠️ `"usingDatabase": false` trong response
- ✅ App không crash

## 📊 So sánh giải pháp

| Giải pháp | Persistent | Multi-deploy safe | Setup | Chi phí |
|-----------|------------|-------------------|-------|---------|
| **MongoDB** ✅ | ✅ Luôn luôn | ✅ Mọi platform | 5 phút | Miễn phí |
| Fly.io Volume | ✅ | ❌ Chỉ Fly.io | 2 phút | Miễn phí |
| File storage | ❌ Reset | ❌ | 0 phút | Miễn phí |

## 🎓 Tài liệu tham khảo

- **MongoDB Setup chi tiết**: Xem file `MONGODB_SETUP.md`
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Mongoose Docs**: https://mongoosejs.com/docs/guide.html
- **Connection String**: https://www.mongodb.com/docs/manual/reference/connection-string/

## 💡 Tips

### Xem dữ liệu real-time

```bash
# SSH vào server và check
fly ssh console

# Trong container, chạy:
curl http://localhost:8080/api/visitor/stats
```

### Backup dữ liệu

```bash
# Export từ MongoDB Atlas
mongoexport --uri="mongodb+srv://..." \
  --collection=visitorstats \
  --out=backup-$(date +%Y%m%d).json

# Import lại
mongoimport --uri="mongodb+srv://..." \
  --collection=visitorstats \
  --file=backup-20251201.json
```

### Scale lên nhiều instances

MongoDB hỗ trợ multiple app instances đọc/ghi cùng lúc:

```bash
# Scale lên 3 instances
fly scale count 3

# Tất cả đều dùng chung database
# Không có conflict!
```

## ✨ Lợi ích

1. ✅ **Không lo mất dữ liệu** khi deploy
2. ✅ **Deploy trên bất kỳ platform nào**: Fly.io, Railway, Vercel, Render, Heroku...
3. ✅ **Miễn phí** với MongoDB Atlas free tier
4. ✅ **Dễ scale** khi cần
5. ✅ **Có backup tự động** từ MongoDB Atlas
6. ✅ **Performance tốt** với indexes

---

**Tóm lại**: Giờ bạn có thể deploy thoải mái trên bất kỳ platform nào mà không lo mất dữ liệu! 🚀
