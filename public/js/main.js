// คัดลอกรหัสผ่านลง Clipboard พร้อมล้างค่าใน 30 วินาที
async function copyToClipboard(textToCopy, buttonElement) {
  try {
    await navigator.clipboard.writeText(textToCopy);
    
    // เปลี่ยนข้อความปุ่มเพื่อแจ้งเตือนผู้ใช้
    const originalText = buttonElement.innerText;
    buttonElement.innerText = "Copied!";
    buttonElement.classList.add("bg-green-600");

    setTimeout(() => {
      buttonElement.innerText = originalText;
      buttonElement.classList.remove("bg-green-600");
    }, 2000);

    // ล้าง Clipboard อัตโนมัติหลังผ่านไป 30 วินาทีเพื่อความปลอดภัย
    setTimeout(async () => {
      await navigator.clipboard.writeText("");
      console.log("Clipboard cleared for security.");
    }, 30000);

  } catch (err) {
    alert("ไม่สามารถคัดลอกได้: " + err);
  }
}

// ค้นหารายการบัญชีบน UI แบบ Real-time
function filterAccounts(keyword) {
  const cards = document.querySelectorAll('.account-card');
  cards.forEach(card => {
    const serviceName = card.getAttribute('data-service').toLowerCase();
    if (serviceName.includes(keyword.toLowerCase())) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}