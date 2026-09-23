ATHRUNA — النسخة المصححة

1) أسهل طريقة للعرض:
   افتح index.html مباشرة في Chrome أو Edge.
   هذه النسخة تحتوي CSS وJavaScript داخل الملف نفسه، لذلك لن تظهر لك صفحة HTML بيضاء بدون تنسيق.
   الصور الحقيقية تُحمّل من Wikimedia Commons، لذلك يجب أن يكون الإنترنت متوفراً لرؤية الصور.

2) الطريقة الأفضل داخل VS Code:
   - افتح هذا المجلد في VS Code.
   - ثبّت إضافة Live Server.
   - اضغط بزر الفأرة الأيمن على index.html ثم Open with Live Server.

3) لتشغيل AI السحابي:
   شغّل نسخة server.js من مجلد المشروع الأصلي:
   npm install
   انسخ .env.example إلى .env وضع GEMINI_API_KEY.
   ثم npm start
   وافتح http://localhost:3000

ملاحظة:
النسخة المباشرة index.html تعمل بوضع المرشد المحلي عند فتحها كملف، أما Gemini فيحتاج تشغيل الخادم.
