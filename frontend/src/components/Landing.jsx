import React from 'react';

export default function Landing({ onNavigate }) {
  return (
    <div id="landing-page" className="landing-layout">
      {/* Navigation Header */}
      <header className="landing-header">
        <div className="header-container">
          <div className="logo">
            <i className="fa-solid fa-globe"></i>
            <span>Shop<span>Co</span></span>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline btn-signin" onClick={() => onNavigate('login')}>Portalga Kirish</button>
            <button className="btn btn-accent btn-register" onClick={() => onNavigate('register')}>A'zo Bo'lish</button>
          </div>
        </div>
      </header>

      {/* Split-Screen Modern Hero Section */}
      <section className="split-hero">
        <div className="split-hero-container">
          {/* Left Editorial Text */}
          <div className="hero-editorial">
            {/* <span className="editorial-badge">PREMIUM B2B CLOTHING</span> */}
            <h1 className="editorial-title">
              Ulgurji Kiyim-Kechakning<br />
              <span className="highlight">Yangi Davri</span>
            </h1>
            <p className="editorial-desc">
              Dunyo bo'ylab eng sara dizayndagi kiyimlarni to'g'ridan-to'g'ri ishlab chiqaruvchidan ulgurji narxlarda xarid qiling. Biznesingiz uchun eng qulay shartnomalar va real vaqtda monitoring.
            </p>
            <div className="hero-btns">
              <button className="btn btn-accent btn-large btn-signin" onClick={() => onNavigate('login')}>Portalga Kirish <i className="fa-solid fa-arrow-right"></i></button>
              <button className="btn btn-outline btn-large btn-register" onClick={() => onNavigate('register')}>Katalog bilan tanishish</button>
            </div>
            <div className="editorial-stats">
              <div>
                <h3>500+</h3>
                <span>Premium Modellar</span>
              </div>
              <div>
                <h3>1200+</h3>
                <span>Faol Xaridorlar</span>
              </div>
              <div>
                <h3>99%</h3>
                <span>O'z vaqtida yetkazish</span>
              </div>
            </div>
          </div>

          {/* Right Side Category Cards Slider/Showcase */}
          <div className="hero-showcase">
            <div className="showcase-card">
              <img src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=80" alt="Kostyumlar" />
              <div className="card-overlay">
                <span className="cat-tag">Kostyumlar</span>
                <h4>Klassik Erkaklar Kostyumlari</h4>
              </div>
            </div>
            <div className="showcase-card mt-showcase">
              <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=80" alt="Ko'ylaklar" />
              <div className="card-overlay">
                <span className="cat-tag">Ayollar</span>
                <h4>Yozgi Nafis Ko'ylaklar</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Showcase Catalog samples */}
      <section className="catalog-samples">
        <div className="container-narrow">
          <div className="section-title-center">
            <span className="section-tag">POPULAR MODELLAR</span>
            <h2>Katalogimizdan Namunalar</h2>
            <p>Mavsumning eng xaridorgir kiyimlari va ulgurji boshlang'ich narxlari.</p>
          </div>
          <div className="samples-grid">
            <div className="sample-item">
              <div className="sample-img-container">
                <img src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=80" alt="Futbolkalar" />
                <span className="sample-price">150,000 UZS dan</span>
              </div>
              <h4>Trikotaj Erkaklar T-Shirt</h4>
              <span className="p-cat">Futbolkalar</span>
            </div>
            <div className="sample-item">
              <div className="sample-img-container">
                <img src="https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&auto=format&fit=crop&q=80" alt="Shimlar" />
                <span className="sample-price">350,000 UZS dan</span>
              </div>
              <h4>Slim Fit Djinsi Shim</h4>
              <span className="p-cat">Shimlar</span>
            </div>
            <div className="sample-item">
              <div className="sample-img-container">
                <img src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&auto=format&fit=crop&q=80" alt="Poyabzallar" />
                <span className="sample-price">950,000 UZS dan</span>
              </div>
              <h4>Krossovka Nike Air Force</h4>
              <span className="p-cat">Poyabzallar</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Benefits Section */}
      <section className="benefits-section">
        <div className="container-narrow">
          <div className="benefits-layout">
            <div className="benefit-box">
              <i className="fa-solid fa-shield-halved"></i>
              <h4>B2B Xavfsiz Tranzaksiyalar</h4>
              <p>Barcha bank to'lovlari va hujjatlar avtomatik yuritiladi va qonuniy himoyalangan.</p>
            </div>
            <div className="benefit-box">
              <i className="fa-solid fa-truck-fast"></i>
              <h4>Tezkor Logistika</h4>
              <p>Shartnoma tuzilgach, tovarlar shu kunning o'zidayoq ombordan yuklanadi.</p>
            </div>
            <div className="benefit-box">
              <i className="fa-solid fa-tag"></i>
              <h4>Moslashuvchan Chegirmalar</h4>
              <p>Muntazam xaridorlar va yirik buyurtmalar uchun maxsus chegirma kuponlari tizimi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Coupons Advertising Bar */}
      <section className="coupons-promo">
        <div className="promo-container">
          <div className="promo-info">
            <h2>Mavjud Kupon Kodlarimiz</h2>
            <p>Portalda buyurtma yaratishda ushbu kupon kodlarini qo'llang va chegirmalarga ega bo'ling.</p>
          </div>
          <div className="promo-tickets">
            <div className="ticket">
              <div className="ticket-val">10% OFF</div>
              <div className="ticket-code">SHOPCO10</div>
            </div>
            <div className="ticket">
              <div className="ticket-val">15% OFF</div>
              <div className="ticket-code">SPRING15</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ulgurji buyurtmalarni boshlashga tayyormisiz?</h2>
          <p>Batafsil ma'lumot va savdo jurnallariga kirish uchun portalga o'ting.</p>
          <button className="btn btn-accent btn-large btn-signin" onClick={() => onNavigate('login')}>Portalga O'tish <i className="fa-solid fa-arrow-right"></i></button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <span className="logo-text">ShopCo <span className="gold-text">Corp</span></span>
          <p>© 2026 ShopCo. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
}
