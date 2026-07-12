import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';
import { firebaseConfig, googleSheetsWebAppUrl } from './config.js';

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const phone = document.querySelector('#whatsapp');
const form = document.querySelector('#lead-form');
const submitButton = form.querySelector('.submit');
const submitButtonLabel = submitButton.querySelector('.submit-label');
const submitButtonText = submitButtonLabel.textContent;
const formError = document.querySelector('#form-error');
const formContent = document.querySelector('#form-content');
const successMessage = document.querySelector('#success');

const revealGroups = [
  '.section-kicker', '.section-title', '.section-lead',
  '.benefit-card', '.stat', '.recurrence-visual', '.recurrence-copy',
  '.journey-card', '.testimonial', '.cta-link'
];

revealGroups.forEach((selector) => {
  document.querySelectorAll(selector).forEach((element, index) => {
    element.classList.add('reveal');
    if (index % 3 === 1) element.classList.add('delay-1');
    if (index % 3 === 2) element.classList.add('delay-2');
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -35px' });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const formatNumber = (number, decimals) => number.toLocaleString('pt-BR', {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals
});

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const counter = entry.target;
    const target = Number(counter.dataset.target);
    const decimals = Number(counter.dataset.decimals || 0);
    const duration = 1700;
    const start = performance.now();

    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      counter.textContent = formatNumber(target * eased, decimals);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    counterObserver.unobserve(counter);
  });
}, { threshold: .6 });

document.querySelectorAll('.counter').forEach((counter) => counterObserver.observe(counter));

const testimonialTrack = document.querySelector('.testimonial-grid');
const testimonialCards = [...document.querySelectorAll('.testimonial')];
const carouselDots = [...document.querySelectorAll('.carousel-dot')];
const previousTestimonial = document.querySelector('.carousel-prev');
const nextTestimonial = document.querySelector('.carousel-next');
let activeTestimonial = 0;

const goToTestimonial = (index) => {
  activeTestimonial = (index + testimonialCards.length) % testimonialCards.length;
  const target = testimonialCards[activeTestimonial];
  testimonialTrack.scrollTo({
    left: target.offsetLeft - testimonialTrack.offsetLeft,
    behavior: 'smooth'
  });
  carouselDots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === activeTestimonial));
};

carouselDots.forEach((dot, index) => dot.addEventListener('click', () => goToTestimonial(index)));
previousTestimonial.addEventListener('click', () => goToTestimonial(activeTestimonial - 1));
nextTestimonial.addEventListener('click', () => goToTestimonial(activeTestimonial + 1));

let carouselScrollTimer;
testimonialTrack.addEventListener('scroll', () => {
  clearTimeout(carouselScrollTimer);
  carouselScrollTimer = setTimeout(() => {
    const closestIndex = testimonialCards.reduce((closest, card, index) => {
      const distance = Math.abs((card.offsetLeft - testimonialTrack.offsetLeft) - testimonialTrack.scrollLeft);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: 0, distance: Infinity }).index;
    activeTestimonial = closestIndex;
    carouselDots.forEach((dot, index) => dot.classList.toggle('is-active', index === activeTestimonial));
  }, 80);
}, { passive: true });

phone.addEventListener('input', (event) => {
  let value = event.target.value.replace(/\D/g, '').slice(0, 11);
  if (value.length > 10) value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  else if (value.length > 6) value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  else if (value.length > 2) value = value.replace(/(\d{2})(\d+)/, '($1) $2');
  else if (value.length) value = value.replace(/(\d{0,2})/, '($1');
  event.target.value = value;
});

const syncLeadToGoogleSheets = async (leadId, lead) => {
  if (!googleSheetsWebAppUrl) return;

  const payload = {
    lead_id: leadId,
    name: lead.name,
    whatsapp: lead.whatsapp,
    city: lead.city,
    sold_before: lead.sold_before,
    market_level: lead.market_level,
    created_at: new Date().toISOString(),
    source: lead.source
  };

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);

  try {
    await fetch(googleSheetsWebAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-store',
      keepalive: true,
      signal: controller.signal,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
  } finally {
    window.clearTimeout(timeout);
  }
};

const showSuccess = () => {
  form.reset();
  formContent.hidden = true;
  successMessage.hidden = false;
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submitButton.disabled) return;

  formError.classList.remove('is-visible');
  formError.textContent = '';

  const formData = new FormData(form);
  if (String(formData.get('website') || '').trim()) {
    showSuccess();
    return;
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitButton.disabled = true;
  submitButtonLabel.textContent = 'Enviando cadastro...';

  const lead = {
    name: String(formData.get('name') || '').trim(),
    whatsapp: String(formData.get('whatsapp') || '').trim(),
    city: String(formData.get('city') || '').trim(),
    sold_before: String(formData.get('sold_before') || ''),
    market_level: String(formData.get('market_level') || ''),
    created_at: serverTimestamp(),
    source: window.location.href.slice(0, 500)
  };

  try {
    const leadDocument = await addDoc(collection(db, 'leads'), lead);

    try {
      await syncLeadToGoogleSheets(leadDocument.id, lead);
    } catch (sheetError) {
      console.error('Lead salvo no Firebase, mas não sincronizado com o Google Sheets:', sheetError);
    }

    showSuccess();
  } catch (error) {
    console.error('Não foi possível salvar o lead:', error);
    formError.textContent = 'Não foi possível enviar agora. Verifique sua conexão e tente novamente.';
    formError.classList.add('is-visible');
    submitButton.disabled = false;
    submitButtonLabel.textContent = submitButtonText;
  }
});
