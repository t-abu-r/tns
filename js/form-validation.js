/**
 * The National School & College (TNS) - Admissions Form Validation & Real-time Feedback
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdmissionsForm();
});

function initAdmissionsForm() {
  const form = document.getElementById('admissionsInquiryForm');
  if (!form) return;

  const studentNameInput = document.getElementById('studentName');
  const parentNameInput = document.getElementById('parentName');
  const emailInput = document.getElementById('emailAddress');
  const phoneInput = document.getElementById('phoneNumber');
  const targetGradeInput = document.getElementById('targetGrade');
  const academicStreamInput = document.getElementById('academicStream');
  const messageInput = document.getElementById('inquiryMessage');
  const charCounter = document.getElementById('charCounter');

  // Character counter for message box
  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      const len = messageInput.value.length;
      charCounter.textContent = `${len}/500`;
      if (len > 450) {
        charCounter.classList.add('text-amber-600', 'font-bold');
      } else {
        charCounter.classList.remove('text-amber-600', 'font-bold');
      }
    });
  }

  // Real-time field validation on blur
  const inputs = [
    { el: studentNameInput, validate: val => val.trim().length >= 3, msg: "Student name must be at least 3 characters." },
    { el: parentNameInput, validate: val => val.trim().length >= 3, msg: "Parent/Guardian name is required." },
    { el: emailInput, validate: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), msg: "Please enter a valid email address." },
    { el: phoneInput, validate: val => /^[0-9\+\-\s\(\)]{10,15}$/.test(val.trim()), msg: "Enter a valid contact number (10-15 digits)." },
    { el: targetGradeInput, validate: val => val !== "", msg: "Please select target grade level." },
    { el: academicStreamInput, validate: val => val !== "", msg: "Please select academic stream preference." }
  ];

  inputs.forEach(item => {
    if (!item.el) return;
    item.el.addEventListener('blur', () => {
      validateField(item.el, item.validate, item.msg);
    });
    item.el.addEventListener('input', () => {
      clearFieldError(item.el);
    });
  });

  // Form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;
    inputs.forEach(item => {
      if (item.el) {
        const fieldValid = validateField(item.el, item.validate, item.msg);
        if (!fieldValid) isValid = false;
      }
    });

    if (!isValid) {
      showToast("Please correct highlighted errors before submitting.", "error");
      return;
    }

    // Submit animation state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Submitting Inquiry...`;

    // Build FormData from all named fields
    const formData = new FormData(form);

    fetch('https://formspree.io/f/xaeworlo', {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
      .then(response => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;

        if (response.ok) {
          // Show branded success modal
          showAdmissionsSuccessModal(studentNameInput.value, emailInput.value, targetGradeInput.value);
          // Reset form
          form.reset();
          if (charCounter) charCounter.textContent = '0/500';
          inputs.forEach(item => { if (item.el) clearFieldError(item.el); });
        } else {
          response.json().then(data => {
            const msg = (data && data.errors)
              ? data.errors.map(e => e.message).join(', ')
              : 'Submission failed. Please try again or contact us directly.';
            showToast(msg, 'error');
          }).catch(() => {
            showToast('Submission failed. Please try again or contact us directly.', 'error');
          });
        }
      })
      .catch(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
        showToast('Network error. Please check your connection and try again.', 'error');
      });
  });
}

function validateField(inputEl, validateFn, errorMsg) {
  const value = inputEl.value;
  const parent = inputEl.parentElement;
  let errorEl = parent.querySelector('.field-error-msg');

  if (!validateFn(value)) {
    inputEl.classList.add('border-red-500', 'focus:ring-red-200');
    inputEl.classList.remove('border-slate-300', 'focus:ring-royal/20');

    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.className = 'field-error-msg text-xs text-red-600 mt-1 font-medium flex items-center';
      parent.appendChild(errorEl);
    }
    errorEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1.5"></i> ${errorMsg}`;
    return false;
  } else {
    clearFieldError(inputEl);
    return true;
  }
}

function clearFieldError(inputEl) {
  const parent = inputEl.parentElement;
  const errorEl = parent.querySelector('.field-error-msg');
  if (errorEl) errorEl.remove();
  inputEl.classList.remove('border-red-500', 'focus:ring-red-200');
  inputEl.classList.add('border-slate-300', 'focus:ring-royal/20');
}

function showAdmissionsSuccessModal(studentName, email, grade) {
  const modalHtml = `
    <div id="admissionsSuccessModal" class="modal-backdrop animate-fadeIn">
      <div class="modal-card max-w-md text-center" role="dialog" aria-modal="true" aria-label="Inquiry submitted confirmation">
        <div class="modal-body">
          <div class="success-icon">
            <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
          </div>
          <span class="eyebrow" style="letter-spacing: 0.14em;">Vision Education System</span>
          <h3 class="font-serif-header font-bold text-2xl mb-2" style="color: var(--navy);">Inquiry Submitted!</h3>
          <p class="text-sm leading-relaxed mb-6" style="color: var(--muted);">
            Thank you, <strong style="color: var(--navy);">${studentName}</strong>. Your inquiry for <strong style="color: var(--navy);">${grade}</strong> (2026-2027) has been received. Our Admissions Officer will contact you via <span style="color: var(--navy); text-decoration: underline;">${email}</span> within 24 business hours.
          </p>

          <div class="p-4 border border-slate-200 rounded mb-6 text-left" style="background: var(--paper);">
            <div class="flex items-center text-sm" style="color: var(--muted);">
              <i class="fa-solid fa-calendar-days mr-2" style="color: var(--navy);" aria-hidden="true"></i>
              <span>Entry Test Schedule will be emailed shortly.</span>
            </div>
            <div class="flex items-center text-sm mt-2" style="color: var(--muted);">
              <i class="fa-solid fa-phone mr-2" style="color: var(--navy);" aria-hidden="true"></i>
              <span>Admissions Desk: +92 (42) 3578-9000</span>
            </div>
          </div>

          <button onclick="closeAdmissionsSuccessModal()" class="btn btn-navy btn-block">
            Return to Website
          </button>
        </div>
      </div>
    </div>
  `;

  const wrapper = document.createElement('div');
  wrapper.id = 'successModalWrapper';
  wrapper.innerHTML = modalHtml;
  document.body.appendChild(wrapper);
}

window.closeAdmissionsSuccessModal = function() {
  const wrapper = document.getElementById('successModalWrapper');
  if (wrapper) wrapper.remove();
};

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const toastClass = type === 'error' ? 'toast toast-error' : 'toast toast-info';
  toast.className = toastClass;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <i class="fa-solid ${type === 'error' ? 'fa-triangle-exclamation text-amber-400' : 'fa-circle-info text-blue-300'}" aria-hidden="true"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
