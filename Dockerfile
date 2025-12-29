FROM node:22-alpine

WORKDIR /app

# تثبيت pnpm
RUN npm install -g pnpm@9.12.0

# نسخ ملفات المشروع
COPY package.json pnpm-lock.yaml ./
COPY . .

# تثبيت التبعيات
RUN pnpm install --frozen-lockfile

# بناء المشروع
RUN pnpm build

# تعريف المنفذ
EXPOSE 3000

# تشغيل التطبيق
CMD ["pnpm", "start"]
