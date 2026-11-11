# نشر نسخة العرض على Vercel

هذه نسخة عرض للمتجر فقط: تعرض الأفلام والألعاب وتسمح بتجربة البحث والسلة محليًا. لا يوجد شراء أو دفع أو قاعدة بيانات مطلوبة، ولا تضف مفاتيح Stripe إلى Vercel.

## المطلوب قبل النشر

يجب أن يحتوي مستودع GitHub على ملفات المشروع. بعد رفعها، افتح Vercel واختر **Add New → Project**، ثم استورد المستودع `alijixx-svg/Gtuo`.

## الإعدادات

اترك مجلد المشروع على الجذر، واستخدم:

- Framework Preset: **Other**
- Node.js: **24.x**
- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm run build:vercel`
- Output Directory: `artifacts/scene-store/dist/public`

الإعدادات موجودة في `vercel.json`. لا تحتاج إلى Environment Variables لهذه النسخة.

النشر التلقائي عند رفع تعديلات Git معطّل؛ رفع الكود لا ينشره. لبدء نشر جديد من مشروع موجود، افتح **Deployments → ⋯ → Create Deployment**، ثم اكتب `main` وأكّد النشر. فحص البناء يشمل المكتبات المشتركة وواجهة المتجر، ولا يشمل الخادم القديم أو معاينة التصميم.

## بعد النشر

اضغط **Deploy**. عند نجاح النشر، انسخ رابط الموقع الذي ينتهي بـ `.vercel.app`، وليس رابط `vercel.com/new`. هذا هو الرابط الذي يجب وضعه في خانة Vercel بالتسليم. في خانة GitHub ضع رابط المستودع:

`https://github.com/alijixx-svg/Gtuo`

## الفحص المحلي

```sh
pnpm run build:vercel
pnpm run check:vercel
```
