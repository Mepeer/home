// قائمة المدن
const CITIES = ["عمان", "الزرقاء", "إربد", "البلقاء", "الكرك", "معان", "الطفيلة", "المفرق", "جرش", "عجلون", "العقبة", "مادبا"];

// العناصر في الصفحة
const brokersList = document.getElementById("brokers");
const citiesContainer = document.getElementById("cities");
const footer = document.getElementById("footer");
const loader = document.getElementById("loader");
const container = document.getElementById("container");

// دالة لإنشاء بطاقة وسيط
const createBrokerCard = (broker) => `
  <a href="profile.html?id=${broker.id}" class="broker">
    <img src="${broker.image}" alt="${broker.name}" class="broker-img" loading="lazy">
    <div class="broker-details">
      <h3 class="broker-name">
        ${broker.name}
        ${broker.verified ? `
          <span class="verified status">
            <i class="fas fa-check-circle"></i> موثوق
            ${broker.featured ? '<span class="featured-star"><i class="fas fa-star"></i> مميز</span>' : ''}
          </span>
        ` : ''}
      </h3>
      <span class="rating">${broker.rating}</span>
    </div>
  </a>
`;

// دالة لجلب بيانات الوسطاء
const getBrokers = async (city) => {
  try {
    const cached = localStorage.getItem(city);
    if (cached) {
      const { version, data } = JSON.parse(cached);
      const brokers = Array.isArray(data) ? data : [];
      const res = await fetch(`data/${city}.json`);
      if (!res.ok) return brokers;
      const json = await res.json();
      const newBrokers = Array.isArray(json) ? json : json.data || [];
      if (json.version > version) {
        localStorage.setItem(city, JSON.stringify({ version: json.version, data: newBrokers }));
        return newBrokers.sort((a, b) => b.rank - a.rank);
      }
      return brokers.sort((a, b) => b.rank - a.rank);
    }

    const res = await fetch(`data/${city}.json`);
    if (!res.ok) return [];
    const json = await res.json();
    const brokers = Array.isArray(json) ? json : json.data || [];
    localStorage.setItem(city, JSON.stringify({ version: json.version || 1, data: brokers }));
    return brokers.sort((a, b) => b.rank - a.rank);
  } catch (e) {
    console.error(`خطأ في جلب بيانات ${city}:`, e);
    return [];
  }
};

// دالة لعرض الوسطاء
const showBrokers = async (city) => {
  const brokers = await getBrokers(city);
  brokersList.innerHTML = brokers.length
    ? brokers.map(createBrokerCard).join('')
    : '<div class="no-brokers">لا وسطاء، <a href="join.html">كن أول وسيط</a></div>';
  footer.style.display = "block";
};

// التحقق من وجود بيانات مخزنة وعرض الصفحة
const initializePage = () => {
  const firstCity = CITIES[0];
  const hasCache = localStorage.getItem(firstCity);

  if (hasCache) {
    container.classList.add("loaded");
    loader.classList.add("hidden");
    CITIES.forEach((city, index) => {
      const btn = document.createElement("button");
      btn.className = `city-btn ${index === 0 ? "active" : ""}`;
      btn.textContent = city;
      btn.onclick = () => {
        showBrokers(city);
        citiesContainer.querySelectorAll(".city-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      };
      citiesContainer.appendChild(btn);
      if (index === 0) showBrokers(city);
    });
  } else {
    window.onload = () => {
      container.classList.add("loaded");
      loader.classList.add("hidden");
      CITIES.forEach((city, index) => {
        const btn = document.createElement("button");
        btn.className = `city-btn ${index === 0 ? "active" : ""}`;
        btn.textContent = city;
        btn.onclick = () => {
          showBrokers(city);
          citiesContainer.querySelectorAll(".city-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
        };
        citiesContainer.appendChild(btn);
        if (index === 0) showBrokers(city);
      });
    };
  }
};

// تشغيل التهيئة
initializePage();
