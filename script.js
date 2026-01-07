// متغير لويب هوك
const WEBHOOK_URL = "https://discordapp.com/api/webhooks/1458594749740089418/RMyPWcHIIjYnxL8xkN3n9XY8wzHRSj-y_Iyo8XiD6KPLtFNUWAfk2Xn8hiGz1xzoLSB8";

// عناصر DOM
const form = document.getElementById('applicationForm');
const submitBtn = document.getElementById('submitBtn');
const messageDiv = document.getElementById('message');
const previousField = document.querySelectorAll('input[name="previous"]');
const previousDetails = document.getElementById('previousDetails');
const detailsField = document.getElementById('details');

// إظهار/إخفاء حقل تفاصيل القبائل السابقة
previousField.forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'نعم') {
            previousDetails.style.display = 'block';
            detailsField.required = true;
        } else {
            previousDetails.style.display = 'none';
            detailsField.required = false;
            detailsField.value = '';
        }
    });
});

// التحقق من العمر عند الإرسال
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // التحقق من العمر
    const age = parseInt(document.getElementById('age').value);
    if (age < 13) {
        showMessage('يجب أن يكون عمرك 13 سنة أو أكثر للتقديم', 'error');
        return;
    }
    
    // التحقق من وجود اليوزر والإيدي
    const discordUser = document.getElementById('discordUser').value;
    const discordId = document.getElementById('discordId').value;
    
    if (!discordUser.trim()) {
        showMessage('يرجى إدخال يوزر الدسكورد', 'error');
        return;
    }
    
    if (!discordId.trim()) {
        showMessage('يرجى إدخال الكوبي ايدي', 'error');
        return;
    }
    
    // إذا كان كل شيء صحيح، أرسل البيانات
    submitApplication();
});

// دالة إرسال الطلب
async function submitApplication() {
    // جمع البيانات من النموذج
    const formData = {
        discordUser: document.getElementById('discordUser').value,
        discordId: document.getElementById('discordId').value,
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        reason: document.getElementById('reason').value,
        experience: document.getElementById('experience').value,
        interaction: document.getElementById('interaction').value,
        design: document.getElementById('design').value || 'لا توجد خبرة',
        unique: document.getElementById('unique').value,
        previous: document.querySelector('input[name="previous"]:checked').value,
        details: document.getElementById('details').value || 'لا ينطبق',
        timestamp: new Date().toLocaleString('ar-SA'),
        ip: await getIP()
    };
    
    // تغيير حالة الزر وعرض رسالة التحميل
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    showMessage('جاري إرسال طلبك، يرجى الانتظار...', 'processing');
    
    try {
        // إرسال البيانات إلى ويب هوك
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: null,
                embeds: [{
                    title: "طلب جديد للانضمام إلى قبيلة الدرغام",
                    color: 14427686,
                    fields: [
                        {
                            name: "👤 اسم المتقدم",
                            value: formData.name,
                            inline: true
                        },
                        {
                            name: "🎂 العمر",
                            value: formData.age,
                            inline: true
                        },
                        {
                            name: "📱 يوزر الدسكورد",
                            value: formData.discordUser,
                            inline: true
                        },
                        {
                            name: "🆔 الكوبي ايدي",
                            value: formData.discordId,
                            inline: true
                        },
                        {
                            name: "📝 سبب التقديم",
                            value: formData.reason.substring(0, 1000) + (formData.reason.length > 1000 ? "..." : ""),
                            inline: false
                        },
                        {
                            name: "💼 الخبرات",
                            value: formData.experience.substring(0, 1000) + (formData.experience.length > 1000 ? "..." : ""),
                            inline: false
                        },
                        {
                            name: "🤝 التفاعل في القبيلة",
                            value: formData.interaction.substring(0, 1000) + (formData.interaction.length > 1000 ? "..." : ""),
                            inline: false
                        },
                        {
                            name: "🎨 خبرات التصميم والمونتاج",
                            value: formData.design.substring(0, 500) + (formData.design.length > 500 ? "..." : ""),
                            inline: false
                        },
                        {
                            name: "⭐ لماذا يجب قبولك؟",
                            value: formData.unique.substring(0, 1000) + (formData.unique.length > 1000 ? "..." : ""),
                            inline: false
                        },
                        {
                            name: "🔄 خبرات سابقة في القبائل",
                            value: formData.previous === 'نعم' ? formData.details.substring(0, 1000) + (formData.details.length > 1000 ? "..." : "") : 'لا يوجد',
                            inline: false
                        },
                        {
                            name: "📅 وقت التقديم",
                            value: formData.timestamp,
                            inline: true
                        },
                        {
                            name: "🌐 IP",
                            value: formData.ip,
                            inline: true
                        }
                    ],
                    footer: {
                        text: "نظام تقديم قبيلة الدرغام"
                    }
                }]
            })
        });
        
        if (response.ok) {
            // نجاح الإرسال
            showMessage('تم إرسال طلبك بنجاح! ستتلقى ردًا من إدارة القبيلة قريبًا.', 'success');
            form.reset();
            previousDetails.style.display = 'none';
            detailsField.required = false;
            
            // إعادة تعيين الزر بعد 3 ثواني
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> تقديم الطلب';
            }, 3000);
        } else {
            throw new Error('فشل إرسال الطلب');
        }
    } catch (error) {
        // فشل الإرسال
        console.error('Error:', error);
        showMessage('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى لاحقًا.', 'error');
        
        // إعادة تعيين الزر
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> تقديم الطلب';
    }
}

// دالة لعرض الرسائل
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    
    // إخفاء الرسالة بعد 5 ثواني (عدا رسائل النجاح)
    if (type !== 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

// دالة للحصول على عنوان IP (تقريبية)
async function getIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'غير معروف';
    }
}

// تأثيرات إضافية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة تأثيرات لحقول الإدخال
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        // تأثير عند التركيز
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        // تأثير عند فقد التركيز
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
    
    // تحميل اللوجو افتراضيًا إذا لم يكن موجودًا
    const logo = document.getElementById('logo');
    logo.onerror = function() {
        this.src = 'https://via.placeholder.com/120/1a1a2e/e63946?text=الدرغام';
    };
});